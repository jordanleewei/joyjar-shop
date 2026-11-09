import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentMember } from '@/lib/auth';
import { cleanCard, unlockedAccessories } from '@/lib/club';

export async function PUT(request: Request) {
  const m = await currentMember();
  if (!m) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const { card, name } = await request.json().catch(() => ({}));
  const c = cleanCard(card);
  if (!unlockedAccessories(m.tierIndex).includes(c.accessory)) c.accessory = 'none';
  const nm = String(name || '').trim().slice(0, 40) || m.name;
  await prisma.member.update({ where: { id: m.id }, data: { card: JSON.stringify(c), name: nm } });
  return NextResponse.json({ ok: true, card: c });
}
