import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { refreshShop } from '@/lib/orders';

type Ctx = { params: Promise<{ id: string }> };
const MAX = 2.5 * 1024 * 1024;

// Upload a product photo (form field "photo"). The browser shrinks it first.
export async function PUT(request: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const { id } = await params;
  const p = await prisma.product.findUnique({ where: { id }, select: { imageVer: true } });
  if (!p) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  const form = await request.formData().catch(() => null);
  const file = form?.get('photo');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'Please choose a photo.' }, { status: 400 });
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return NextResponse.json({ error: 'Please use a JPG, PNG or WebP photo.' }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: 'That photo is too large. Try a smaller one.' }, { status: 400 });
  const data = Buffer.from(await file.arrayBuffer());
  await prisma.productImage.upsert({ where: { productId: id }, create: { productId: id, mime: file.type, data }, update: { mime: file.type, data } });
  const updated = await prisma.product.update({ where: { id }, data: { imageVer: Math.max(1, p.imageVer + 1) } });
  refreshShop();
  return NextResponse.json({ ok: true, imageVer: updated.imageVer });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const { id } = await params;
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.product.update({ where: { id }, data: { imageVer: 0 } }).catch(() => null);
  refreshShop();
  return NextResponse.json({ ok: true });
}
