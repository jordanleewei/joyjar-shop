import { NextResponse } from 'next/server';
import { endAdmin } from '@/lib/admin';

export async function POST() {
  await endAdmin();
  return NextResponse.json({ ok: true });
}
