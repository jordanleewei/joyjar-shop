import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sessionMemberId, verifyPassword, hashPassword } from '@/lib/auth';

export async function PUT(request: Request) {
  const id = await sessionMemberId();
  if (!id) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const { current, next } = await request.json().catch(() => ({}));
  const m = await prisma.member.findUnique({ where: { id } });
  if (!m || !verifyPassword(String(current || ''), m.passwordHash)) {
    return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 400 });
  }
  if (String(next || '').length < 8) return NextResponse.json({ error: 'New password needs at least 8 characters.' }, { status: 400 });
  await prisma.member.update({ where: { id }, data: { passwordHash: hashPassword(String(next)) } });
  return NextResponse.json({ ok: true });
}
