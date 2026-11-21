import { NextResponse } from 'next/server';
import { verifyHitpayHmac, markPaid } from '@/lib/orders';

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
    await markPaid(num);
  }
  return NextResponse.json({ ok: true });
}
