import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentMember } from '@/lib/auth';
import { ACCESSORIES, TREATS, tierOfAccessory, tierFor, TIERS } from '@/lib/club';
import { pointsSummary, petInventory, lockMember, parsePetState } from '@/lib/points';

export const dynamic = 'force-dynamic';

async function state(memberId: string) {
  const [pts, inv] = await Promise.all([pointsSummary(memberId), petInventory(memberId)]);
  return { balance: pts.balance, lifetime: pts.lifetime, tierIndex: tierFor(pts.lifetime).index, owned: inv.owned, treats: inv.treats };
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

  if (body.action === 'buy') {
    const item = String(body.item || '');
    const acc = ACCESSORIES.find((a) => a.id === item);
    const treat = item.startsWith('treat:') ? TREATS.find((t) => 'treat:' + t.id === item) : null;
    if (!acc && !treat) return NextResponse.json({ error: 'That item isn’t in the shop.' }, { status: 400 });
    try {
      await prisma.$transaction(async (tx) => {
        await lockMember(tx, m.id);
        const pts = await pointsSummary(m.id, tx);
        const tierIndex = tierFor(pts.lifetime).index;
        let cost = 0;
        if (acc) {
          const need = tierOfAccessory(acc.id);
          if (need > tierIndex) throw new Error(`Reach ${TIERS[need].en} to unlock the ${acc.en.replace(/^\S+\s/, '').toLowerCase()}.`);
          const inv = await petInventory(m.id, undefined, tx);
          if (inv.owned.includes(acc.id)) throw new Error('You already have this one.');
          cost = acc.cost;
        } else cost = treat!.cost;
        if (pts.balance < cost) throw new Error(`You need ${cost - pts.balance} more points for this.`);
        await tx.petPurchase.create({ data: { memberId: m.id, item, cost } });
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
    if (!ok) return NextResponse.json({ error: 'No more of that treat. Get more in the pet shop.' }, { status: 400 });
    return NextResponse.json({ ok: true, ...(await state(m.id)) });
  }
  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
