// Mission state for a member + the AI proof check. Screenshots are only held in
// memory for the duration of the check and are never written anywhere.
import crypto from "crypto";
import { prisma } from "./db";
import { MISSIONS, Mission } from "./club";
import { availableVouchers } from "./discounts";

export const AI_MODEL = process.env.MISSION_AI_MODEL || "nvidia/nemotron-3.5-super-vl:free";
const DAILY_ATTEMPTS = 6;

export async function missionState(memberId: string) {
  const claims = await prisma.missionClaim.findMany({ where: { memberId }, orderBy: { createdAt: "desc" }, take: 60 });
  const vouchers = await availableVouchers(memberId);
  const now = Date.now();
  const missions = MISSIONS.map((m) => {
    const approved = claims.filter((c) => c.mission === m.id && c.status === "approved");
    let left = 1, done = false;
    if (m.repeat) {
      const days = m.repeat.days * 864e5;
      left = Math.max(0, m.repeat.max - approved.filter((c) => now - c.createdAt.getTime() < days).length);
    } else {
      done = approved.length > 0; left = done ? 0 : 1;
    }
    return { id: m.id, done, left };
  });
  return {
    missions,
    vouchers: vouchers.length,
    history: claims.slice(0, 12).map((c) => ({
      id: c.id, mission: c.mission, status: c.status, reason: c.reason,
      date: c.createdAt.toISOString(), used: !!c.usedOrderId && !vouchers.some((v) => v.id === c.id) && c.status === "approved",
    })),
  };
}

export async function canAttempt(memberId: string, m: Mission): Promise<string | null> {
  const since = new Date(Date.now() - 864e5);
  const tries = await prisma.missionClaim.count({ where: { memberId, createdAt: { gte: since } } });
  if (tries >= DAILY_ATTEMPTS) return "You've sent a lot of proofs today. Please try again tomorrow.";
  const approved = await prisma.missionClaim.findMany({ where: { memberId, mission: m.id, status: "approved" }, select: { createdAt: true } });
  if (!m.repeat && approved.length) return "You've already completed this mission.";
  if (m.repeat) {
    const days = m.repeat.days * 864e5;
    const inWindow = approved.filter((c) => Date.now() - c.createdAt.getTime() < days).length;
    if (inWindow >= m.repeat.max) return `You've used this mission ${m.repeat.max} times in the last ${m.repeat.days} days. Try again later.`;
  }
  return null;
}

export function hashImage(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

// Ask the vision model whether the screenshot is real proof. Returns null if the AI is unavailable.
export async function checkProof(m: Mission, mime: string, buf: Buffer): Promise<{ approved: boolean; reason: string } | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  const prompt = `You verify proof screenshots for JoyJar (小胶傲), a Singapore fish maw dessert brand sold in jars.
Mission: "${m.en}" — ${m.how}
Decide if this screenshot is genuine proof of that mission promoting JoyJar:
- It should look like a real ${m.platform} ${m.id === "refer" ? "chat message sent to someone" : "post/story/video"} (real app interface, not a blank, cropped-out or obviously edited image).
- It must clearly feature or mention JoyJar / 小胶傲 (name, logo, tag, jar or a link).
- ${m.id === "refer" ? "The message should recommend JoyJar to the other person." : `It should be on ${m.platform}.`}
Reply with ONLY JSON: {"approved": true or false, "reason": "<one short friendly sentence telling the member why. Never include names, usernames, handles, phone numbers or any personal details you see>"}`;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST", signal: ctrl.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Title": "JoyJar missions" },
      body: JSON.stringify({
        model: AI_MODEL, temperature: 0,
        messages: [{ role: "user", content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${mime};base64,${buf.toString("base64")}` } },
        ] }],
      }),
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const j = JSON.parse(match[0]);
    const reason = String(j.reason || "").replace(/^\s*(approved|not approved|denied|rejected)\s*[!.:,-]*\s*/i, "").replace(/@\S+/g, "").replace(/\+?\d[\d\s-]{6,}\d/g, "").trim().slice(0, 220);
    return { approved: j.approved === true, reason: reason || (j.approved ? "Looks great, thank you!" : "We couldn't confirm this as proof for the mission.") };
  } catch {
    return null;
  }
}
