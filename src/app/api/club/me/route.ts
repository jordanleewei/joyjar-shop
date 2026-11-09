import { NextResponse } from 'next/server';
import { currentMember } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const m = await currentMember();
  return NextResponse.json({ member: m });
}
