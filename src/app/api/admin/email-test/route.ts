import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { sendTestEmail } from '@/lib/email';
import { mailProvider, shopInbox } from '@/lib/mailer';

export const maxDuration = 30;

// Send a test email to the shop inbox (or the address given).
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (!mailProvider()) return NextResponse.json({ error: 'Email isn’t switched on yet. Add the Gmail app password first.' }, { status: 400 });
  const { to } = await request.json().catch(() => ({}));
  const dest = String(to || shopInbox()).trim();
  try {
    const ok = await sendTestEmail(dest);
    if (!ok) return NextResponse.json({ error: 'That email address doesn’t look right.' }, { status: 400 });
    return NextResponse.json({ ok: true, to: dest });
  } catch (e: any) {
    const m = String(e?.message || '');
    const hint = /535|Username and Password|BadCredentials|Invalid login/i.test(m)
      ? 'Gmail didn’t accept the app password. Check it was copied fully (16 letters) and that 2-Step Verification is on.'
      : 'Couldn’t send the test email. Please try again in a minute.';
    console.error('test email failed', m.slice(0, 200));
    return NextResponse.json({ error: hint }, { status: 502 });
  }
}
