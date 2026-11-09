import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyHitpayHmac } from '@/lib/orders';

// HitPay calls this after a payment. Marks the matching order as paid.
export async function POST(request: Request) {
  const form = await request.formData();
  const fields: Record<string, string> = {};
  form.forEach((v, k) => { fields[k] = String(v); });

  if (!verifyHitpayHmac(fields)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const num = fields.reference_number;
  if (num && String(fields.status).toLowerCase() === 'completed') {
    await prisma.order.updateMany({ where: { num, status: { not: 'paid' } }, data: { status: 'paid' } });
  }
  return NextResponse.json({ ok: true });
}
