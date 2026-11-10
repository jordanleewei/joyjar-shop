import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentMember } from '@/lib/auth';
import { priceCart, newOrderNum, HITPAY_API } from '@/lib/orders';
import { discountOptions, stackDiscounts } from '@/lib/discounts';

// Prices the cart on the server, saves a pending order, then opens a HitPay payment request.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cart, form = {}, pickup = false, zoneId, slot = "", pay = "paynow", discounts = {} } = body || {};

    const hitpayApiKey = process.env.HITPAY_API_KEY;
    if (!hitpayApiKey) {
      return NextResponse.json({ error: 'HitPay API key is missing' }, { status: 500 });
    }

    if (!form.name || !form.phone || (!pickup && !form.addr)) {
      return NextResponse.json({ error: 'Please fill in your name, phone and address.' }, { status: 400 });
    }

    const member = await currentMember();
    // member discounts: only what they ticked, re-checked here, capped at 35%
    const opts = member ? await discountOptions(member) : null;
    const stacked = opts ? stackDiscounts(opts, {
      tier: !!discounts.tier, welcome: !!discounts.welcome,
      vouchers: Array.isArray(discounts.vouchers) ? discounts.vouchers.map(String) : [],
    }) : { rate: 0, parts: [] };
    let priced;
    try {
      priced = await priceCart(cart, { pickup: !!pickup, zoneId, discountRate: stacked.rate, freeDelivery: !!opts?.freeDelivery });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    const num = newOrderNum();
    const order = await prisma.order.create({
      data: {
        num,
        customerDetails: JSON.stringify({
          name: String(form.name).slice(0, 120), phone: String(form.phone).slice(0, 40),
          email: String(form.email || member?.email || "").slice(0, 160),
          addr: String(form.addr || "").slice(0, 300), unit: String(form.unit || "").slice(0, 40),
          postal: String(form.postal || "").slice(0, 20), note: String(form.note || "").slice(0, 500),
        }),
        slot: String(slot).slice(0, 120),
        zoneId: pickup ? "pickup" : (priced.zone?.id || ""),
        subtotal: priced.subtotal,
        deliveryFee: priced.ship,
        discount: priced.discount,
        total: priced.total,
        method: pay === "card" ? "card" : "paynow",
        items: JSON.stringify(priced.cart),
        memberId: member?.id || null,
        discountDetail: stacked.parts.length ? JSON.stringify(stacked.parts.map((p) => ({ kind: p.kind, label: p.label, rate: p.rate }))) : "",
      },
    });
    // hold the vouchers used on this order (they free up again if it's never paid)
    const voucherIds = stacked.parts.filter((p) => p.kind === "voucher" && p.id).map((p) => p.id as string);
    if (voucherIds.length && member) {
      await prisma.missionClaim.updateMany({ where: { id: { in: voucherIds }, memberId: member.id }, data: { usedOrderId: order.id } });
    }

    const origin = new URL(request.url).origin;
    const params = new URLSearchParams();
    params.append('amount', priced.total.toFixed(2));
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
    return NextResponse.json({ url: data.url, num, total: priced.total });
  } catch (error: any) {
    console.error('Error creating HitPay payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create HitPay payment' },
      { status: 500 }
    );
  }
}
