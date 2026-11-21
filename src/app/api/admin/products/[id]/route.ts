import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { refreshShop } from '@/lib/orders';
import { productData } from '@/lib/productAdmin';

type Ctx = { params: Promise<{ id: string }> };

// Save changes, or { restore: true } to bring back a removed product (hidden until shown again).
export async function PUT(request: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  if (body.restore) {
    await prisma.product.update({ where: { id }, data: { archived: false, available: false } });
    refreshShop();
    return NextResponse.json({ ok: true });
  }
  let data;
  try { data = productData(body); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
  await prisma.product.update({ where: { id }, data });
  refreshShop();
  return NextResponse.json({ ok: true, id });
}

// Remove. Products that were never ordered are deleted; ones in past orders are hidden
// and moved to "Removed" so those orders still show the right name.
export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const { id } = await params;
  const used = await prisma.order.count({ where: { items: { contains: `"productId":"${id.replace(/"/g, '')}"` } } });
  if (used) {
    await prisma.product.update({ where: { id }, data: { archived: true, available: false } });
  } else {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } }).catch(() => null);
  }
  refreshShop();
  return NextResponse.json({ ok: true, archived: !!used });
}
