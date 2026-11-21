import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { refreshShop } from '@/lib/orders';

// { id, stock: number | null, available: boolean }
export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || '');
  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: 'Unknown flavour.' }, { status: 404 });
  const stock = body.stock === null ? null : Math.max(0, Math.min(99999, Math.floor(Number(body.stock) || 0)));
  const p = await prisma.product.update({ where: { id }, data: { stock, available: body.available !== false } });
  refreshShop();
  return NextResponse.json({ ok: true, product: { id: p.id, stock: p.stock, available: p.available } });
}
