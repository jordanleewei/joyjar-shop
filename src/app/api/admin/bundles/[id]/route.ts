import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { refreshShop } from '@/lib/orders';

// Edit the Box of Six (name, notes, description, price).
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const { id } = await params;
  const b = await prisma.bundle.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const str = (v: any, max: number) => String(v ?? '').trim().slice(0, max);
  const price = Math.round(Number(body.price) * 100) / 100;
  if (!isFinite(price) || price <= 0 || price > 9999) return NextResponse.json({ error: 'Price should be a number like 68.00.' }, { status: 400 });
  const title = str(body.title, 60);
  if (!title) return NextResponse.json({ error: 'Add a name (English).' }, { status: 400 });
  await prisma.bundle.update({
    where: { id },
    data: { title, titleZh: str(body.titleZh, 30), note: str(body.note, 120), noteZh: str(body.noteZh, 60), blurb: str(body.blurb, 600), blurbZh: str(body.blurbZh, 300), price },
  });
  refreshShop();
  return NextResponse.json({ ok: true });
}
