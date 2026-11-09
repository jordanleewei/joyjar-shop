import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, startSession } from '@/lib/auth';
import { cleanCard, unlockedAccessories } from '@/lib/club';

export async function POST(request: Request) {
  const { email, password, name, card } = await request.json().catch(() => ({}));
  const em = String(email || '').trim().toLowerCase();
  const nm = String(name || '').trim().slice(0, 40);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  if (String(password || '').length < 8) return NextResponse.json({ error: 'Password needs at least 8 characters.' }, { status: 400 });
  if (!nm) return NextResponse.json({ error: 'Please tell us your name.' }, { status: 400 });

  const c = cleanCard(card);
  if (!unlockedAccessories(0).includes(c.accessory)) c.accessory = 'none';

  const exists = await prisma.member.findUnique({ where: { email: em } });
  if (exists) return NextResponse.json({ error: 'That email is already a member. Try logging in.' }, { status: 409 });

  const m = await prisma.member.create({
    data: { email: em, name: nm, passwordHash: hashPassword(String(password)), card: JSON.stringify(c) },
  });
  await startSession(m.id);
  return NextResponse.json({ ok: true });
}
