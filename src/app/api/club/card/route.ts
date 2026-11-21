import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentMember } from '@/lib/auth';
import { cleanCard } from '@/lib/club';
import { petInventory } from '@/lib/points';

export async function PUT(request: Request) {
  const m = await currentMember();
  if (!m) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const { card, name } = await request.json().catch(() => ({}));
  const c = cleanCard(card);
  // only accessories they own (bought in the pet shop, or free)
  if (!(await petInventory(m.id)).owned.includes(c.accessory)) c.accessory = 'none';
  const nm = String(name || '').trim().slice(0, 40) || m.name;
  await prisma.member.update({ where: { id: m.id }, data: { card: JSON.stringify(c), name: nm } });
  return NextResponse.json({ ok: true, card: c });
}
