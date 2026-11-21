import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { REGIONS } from '@/lib/regions';

const FULFIL = ['new', 'packed', 'delivered'];

// Update one or more orders: { nums: string[], fulfil?: "new"|"packed"|"delivered", region?: string }
export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const nums = (Array.isArray(body.nums) ? body.nums : []).map(String).slice(0, 200);
  if (!nums.length) return NextResponse.json({ error: 'No orders picked.' }, { status: 400 });
  const data: any = {};
  if (FULFIL.includes(body.fulfil)) data.fulfil = body.fulfil;
  if (typeof body.region === 'string' && (body.region === '' || REGIONS.some((r) => r.id === body.region))) data.region = body.region;
  if (!Object.keys(data).length) return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 });
  const res = await prisma.order.updateMany({ where: { num: { in: nums } }, data });
  return NextResponse.json({ ok: true, updated: res.count });
}
