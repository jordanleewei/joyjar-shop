import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { refreshShop } from '@/lib/orders';
import { productData, slugify } from '@/lib/productAdmin';

// Add a new product.
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  let data;
  try { data = productData(body); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
  const reserved = new Set(['jar-1', 'jar-6', 'new']);
  const base = slugify(data.flavorEn);
  let id = base, n = 2;
  while (reserved.has(id) || (await prisma.product.findUnique({ where: { id }, select: { id: true } })) || (await prisma.bundle.findUnique({ where: { id }, select: { id: true } }))) id = `${base}-${n++}`;
  const max = await prisma.product.aggregate({ _max: { sortOrder: true } });
  const p = await prisma.product.create({ data: { id, ...data, sortOrder: body.sortOrder ? data.sortOrder : (max._max.sortOrder || 0) + 1 } });
  refreshShop();
  return NextResponse.json({ ok: true, id: p.id });
}
