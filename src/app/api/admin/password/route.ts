import { NextResponse } from 'next/server';
import { isAdmin, checkAdminPassword, setAdminPassword, startAdmin } from '@/lib/admin';

// { current, next } — changes the admin password. Signs out every other device.
export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const { current, next } = await request.json().catch(() => ({}));
  if (!(await checkAdminPassword(String(current || '')))) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: 'Your current password isn’t right.' }, { status: 400 });
  }
  const pw = String(next || '');
  if (pw.length < 8) return NextResponse.json({ error: 'The new password needs at least 8 characters.' }, { status: 400 });
  if (pw.length > 200) return NextResponse.json({ error: 'That password is too long.' }, { status: 400 });
  await setAdminPassword(pw);
  await startAdmin(); // keep this device signed in with the new password
  return NextResponse.json({ ok: true });
}
