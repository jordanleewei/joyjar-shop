import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { refreshShop } from '@/lib/orders';

// Standard prices: { single: 15.8, box: 68 }
export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const money = (v: any) => { const n = Math.round(Number(v) * 100) / 100; return isFinite(n) && n > 0 && n < 10000 ? n : null; };
  const single = body.single === undefined ? undefined : money(body.single);
  const box = body.box === undefined ? undefined : money(body.box);
  if (single === null || box === null) return NextResponse.json({ error: 'Prices should be numbers like 15.80.' }, { status: 400 });
  const bundles = await prisma.bundle.findMany();
  await Promise.all(bundles.map((b) => {
    const price = b.qty === 1 ? single : box;
    return price == null ? null : prisma.bundle.update({ where: { id: b.id }, data: { price } });
  }));
  refreshShop();
  return NextResponse.json({ ok: true });
}
