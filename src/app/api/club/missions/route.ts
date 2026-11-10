import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentMember } from '@/lib/auth';
import { MISSIONS } from '@/lib/club';
import { missionState, canAttempt, hashImage, checkProof } from '@/lib/missions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024;

export async function GET() {
  const m = await currentMember();
  if (!m) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  return NextResponse.json(await missionState(m.id));
}

// Submit a screenshot as proof. The image is checked in memory and then discarded;
// only a fingerprint (hash) and the verdict are kept.
export async function POST(request: Request) {
  const m = await currentMember();
  if (!m) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const missionId = String(form?.get('mission') || '');
  const file = form?.get('proof');
  const mission = MISSIONS.find((x) => x.id === missionId);
  if (!mission) return NextResponse.json({ error: 'Unknown mission.' }, { status: 400 });
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'Please attach a screenshot.' }, { status: 400 });
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return NextResponse.json({ error: 'Please upload a PNG, JPG or WebP screenshot.' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'That image is too large (max 4MB).' }, { status: 400 });

  const blocked = await canAttempt(m.id, mission);
  if (blocked) return NextResponse.json({ error: blocked }, { status: 429 });

  let buf: Buffer | null = Buffer.from(await file.arrayBuffer());
  const imageHash = hashImage(buf);

  const reused = await prisma.missionClaim.findFirst({ where: { imageHash, status: 'approved' }, select: { id: true } });
  let verdict: { approved: boolean; reason: string } | null;
  if (reused) {
    verdict = { approved: false, reason: 'This screenshot has already been used for a mission. Please share a new post or message.' };
  } else {
    verdict = await checkProof(mission, file.type, buf);
  }
  buf = null; // drop the image

  if (!verdict) return NextResponse.json({ error: "We couldn't check your screenshot right now. Please try again in a minute." }, { status: 503 });

  await prisma.missionClaim.create({
    data: { memberId: m.id, mission: mission.id, status: verdict.approved ? 'approved' : 'denied', reason: verdict.reason, imageHash },
  });
  return NextResponse.json({ ...verdict, state: await missionState(m.id) });
}
