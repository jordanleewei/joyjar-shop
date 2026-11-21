import { NextResponse } from 'next/server';
import { checkAdminPassword, startAdmin } from '@/lib/admin';

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'Admin password is not set up yet (ADMIN_PASSWORD in Vercel).' }, { status: 503 });
  if (!checkAdminPassword(String(password || ''))) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return NextResponse.json({ error: 'That password isn’t right.' }, { status: 401 });
  }
  await startAdmin();
  return NextResponse.json({ ok: true });
}
