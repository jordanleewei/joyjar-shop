import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, startSession } from '@/lib/auth';

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  const m = await prisma.member.findUnique({ where: { email: String(email || '').trim().toLowerCase() } });
  if (!m || !verifyPassword(String(password || ''), m.passwordHash)) {
    return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
  }
  await startSession(m.id);
  return NextResponse.json({ ok: true });
}
