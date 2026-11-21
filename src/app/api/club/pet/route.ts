import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentMember } from '@/lib/auth';
import { TREATS, tierFor } from '@/lib/club';
import { pointsSummary, petInventory, lockMember, parsePetState } from '@/lib/points';

export const dynamic = 'force-dynamic';

async function state(memberId: string) {
  const pts = await pointsSummary(memberId);
  const tierIndex = tierFor(pts.lifetime).index;
  const inv = await petInventory(memberId, undefined, undefined, tierIndex);
  return { balance: pts.balance, lifetime: pts.lifetime, tierIndex, owned: inv.owned, treats: inv.treats };
}

export async function GET() {
  const m = await currentMember();
  if (!m) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  return NextResponse.json(await state(m.id));
}

// { action: "buy", item: "<accessory id>" | "treat:<id>" }  or  { action: "feed", treat: "<id>" }
export async function POST(request: Request) {
  const m = await currentMember();
  if (!m) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const body = await request.json().catch(() => ({}));

  // buy treats (1 point each). Accessories aren't bought: they unlock with your tier.
  if (body.action === 'buy') {
    const item = String(body.item || '');
    const treat = TREATS.find((t) => 'treat:' + t.id === item);
    if (!treat) return NextResponse.json({ error: 'Accessories unlock free as you move up a tier.' }, { status: 400 });
    const qty = Math.max(1, Math.min(20, Math.floor(Number(body.qty) || 1)));
    try {
      await prisma.$transaction(async (tx) => {
        await lockMember(tx, m.id);
        const pts = await pointsSummary(m.id, tx);
        const cost = treat.cost * qty;
        if (pts.balance < cost) throw new Error(pts.balance ? `You have ${pts.balance} point${pts.balance === 1 ? "" : "s"}. Earn more with orders and missions.` : 'You need points for treats. Earn them with orders and missions.');
        await tx.petPurchase.createMany({ data: Array.from({ length: qty }, () => ({ memberId: m.id, item, cost: treat.cost })) });
      });
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Couldn’t buy that right now.' }, { status: 400 });
    }
    return NextResponse.json({ ok: true, ...(await state(m.id)) });
  }

  if (body.action === 'feed') {
    const t = TREATS.find((x) => x.id === String(body.treat || ''));
    if (!t) return NextResponse.json({ error: 'Unknown treat.' }, { status: 400 });
    const ok = await prisma.$transaction(async (tx) => {
      await lockMember(tx, m.id);
      const row = await tx.member.findUnique({ where: { id: m.id }, select: { petState: true } });
      const inv = await petInventory(m.id, row?.petState || '{}', tx);
      if (!inv.treats[t.id]) return false;
      const st = parsePetState(row?.petState || '{}');
      st.fed[t.id] = (st.fed[t.id] || 0) + 1;
      await tx.member.update({ where: { id: m.id }, data: { petState: JSON.stringify(st) } });
      return true;
    });
    if (!ok) return NextResponse.json({ error: 'No more of that treat. Get more for 1 point each.' }, { status: 400 });
    return NextResponse.json({ ok: true, ...(await state(m.id)) });
  }
  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
