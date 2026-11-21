import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentMember } from '@/lib/auth';
import { priceCart, newOrderNum, HITPAY_API } from '@/lib/orders';
import { discountOptions, applyDiscount } from '@/lib/discounts';
import { pointsSummary, lockMember } from '@/lib/points';
import { pointsFor } from '@/lib/club';
import { REGIONS } from '@/lib/regions';

// Prices the cart on the server, saves a pending order, then opens a HitPay payment request.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cart, form = {}, region = "", pay = "paynow", discount = {} } = body || {};

    const hitpayApiKey = process.env.HITPAY_API_KEY;
    if (!hitpayApiKey) {
      return NextResponse.json({ error: 'HitPay API key is missing' }, { status: 500 });
    }

    if (!form.name || !form.phone || !form.addr || !/^\d{6}$/.test(String(form.postal || '').trim())) {
      return NextResponse.json({ error: 'Please fill in your name, phone, address and postal code.' }, { status: 400 });
    }
    const regionId = REGIONS.some((r) => r.id === region) ? String(region) : '';
    if (!regionId) return NextResponse.json({ error: 'Please choose your delivery region.' }, { status: 400 });

    let priced;
    try {
      priced = await priceCart(cart);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    const member = await currentMember();
    const num = newOrderNum();
    const choice = { kind: discount.kind, blocks: Number(discount.blocks) || 0 };

    // one discount only: welcome 5% or points. Points are checked inside a lock so they can't be spent twice.
    const order = await prisma.$transaction(async (tx) => {
      let applied = applyDiscount(null, {}, priced.subtotal);
      if (member) {
        if (choice.kind === 'points') await lockMember(tx, member.id);
        const opts = await discountOptions(member);
        if (choice.kind === 'points') opts.points = (await pointsSummary(member.id, tx)).balance;
        applied = applyDiscount(opts, choice, priced.subtotal);
      }
      const total = Math.round((priced.subtotal - applied.amount + priced.ship) * 100) / 100;
      return tx.order.create({
        data: {
          num,
          customerDetails: JSON.stringify({
            name: String(form.name).slice(0, 120), phone: String(form.phone).slice(0, 40),
            email: String(form.email || member?.email || "").slice(0, 160),
            addr: String(form.addr || "").slice(0, 300), unit: String(form.unit || "").slice(0, 40),
            postal: String(form.postal || "").trim().slice(0, 20), note: String(form.note || "").slice(0, 500),
          }),
          slot: "",
          zoneId: regionId,
          region: regionId,
          subtotal: priced.subtotal,
          deliveryFee: priced.ship,
          discount: applied.amount,
          total,
          method: pay === "card" ? "card" : "paynow",
          items: JSON.stringify(priced.cart),
          memberId: member?.id || null,
          pointsUsed: applied.pointsUsed,
          pointsEarned: member ? pointsFor(priced.subtotal - applied.amount) : 0,
          discountDetail: applied.kind !== 'none' ? JSON.stringify([{ kind: applied.kind, label: applied.label, amount: applied.amount, points: applied.pointsUsed }]) : "",
        },
      });
    });
    const total = order.total;

    const origin = new URL(request.url).origin;
    const params = new URLSearchParams();
    params.append('amount', total.toFixed(2));
    params.append('currency', 'SGD');
    params.append('reference_number', num);
    params.append('purpose', `JoyJar order ${num}`);
    params.append('name', String(form.name));
    params.append('phone', String(form.phone));
    if (form.email || member?.email) params.append('email', String(form.email || member?.email));
    params.append('redirect_url', `${origin}/checkout/confirm?num=${encodeURIComponent(num)}`);
    params.append('webhook', `${origin}/api/hitpay-webhook`);

    const response = await fetch(`${HITPAY_API}/payment-requests`, {
      method: 'POST',
      headers: {
        'X-BUSINESS-API-KEY': hitpayApiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('HitPay Error:', data);
      await prisma.order.update({ where: { id: order.id }, data: { status: 'failed' } });
      return NextResponse.json(
        { error: data.message || 'HitPay API Error' },
        { status: response.status }
      );
    }

    await prisma.order.update({ where: { id: order.id }, data: { hitpayId: String(data.id || '') } });
    return NextResponse.json({ url: data.url, num, total });
  } catch (error: any) {
    console.error('Error creating HitPay payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create HitPay payment' },
      { status: 500 }
    );
  }
}
