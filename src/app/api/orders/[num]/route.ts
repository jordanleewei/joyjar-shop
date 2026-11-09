import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hitpayStatus } from '@/lib/orders';

// Used by the confirmation page. Double-checks payment with HitPay if the webhook hasn't landed yet.
export async function GET(_req: Request, { params }: { params: Promise<{ num: string }> }) {
  const { num } = await params;
  let order = await prisma.order.findUnique({ where: { num } });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  if (order.status !== 'paid' && order.hitpayId) {
    const status = await hitpayStatus(order.hitpayId);
    if (status === 'completed') {
      order = await prisma.order.update({ where: { id: order.id }, data: { status: 'paid' } });
    }
  }

  let firstName = '';
  try { firstName = String(JSON.parse(order.customerDetails).name || '').split(' ')[0]; } catch {}

  return NextResponse.json({
    num: order.num, status: order.status, slot: order.slot, total: order.total,
    discount: order.discount, method: order.method, pickup: order.zoneId === 'pickup',
    firstName, member: !!order.memberId,
  });
}
