import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { tierFor } from "./club";

const COOKIE = "jj_session";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days

function secret() {
  // Set SESSION_SECRET in Vercel. Falls back to a value derived from the DB URL so
  // sessions still work (and stay private) if it's missing.
  const s = process.env.SESSION_SECRET || process.env.DATABASE_URL;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return crypto.createHash("sha256").update("jj-session:" + s).digest();
}

export function hashPassword(pw: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64);
  return "scrypt$" + salt.toString("hex") + "$" + hash.toString("hex");
}

export function verifyPassword(pw: string, stored: string) {
  const [kind, saltHex, hashHex] = (stored || "").split("$");
  if (kind !== "scrypt" || !saltHex || !hashHex) return false;
  const hash = crypto.scryptSync(pw, Buffer.from(saltHex, "hex"), 64);
  const want = Buffer.from(hashHex, "hex");
  return want.length === hash.length && crypto.timingSafeEqual(hash, want);
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function startSession(memberId: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = memberId + "." + exp;
  const store = await cookies();
  store.set(COOKIE, payload + "." + sign(payload), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function sessionMemberId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  const want = sign(id + "." + exp);
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  return id;
}

export async function memberSpend(memberId: string) {
  const agg = await prisma.order.aggregate({ where: { memberId, status: "paid" }, _sum: { total: true } });
  return agg._sum.total || 0;
}

// Public view of the signed-in member (or null)
export async function currentMember() {
  const id = await sessionMemberId();
  if (!id) return null;
  const m = await prisma.member.findUnique({ where: { id } });
  if (!m) return null;
  const spend = await memberSpend(m.id);
  const t = tierFor(spend);
  return {
    id: m.id, num: m.num, email: m.email, name: m.name, card: m.card,
    spend, tierIndex: t.index, discount: t.tier.discount, createdAt: m.createdAt.toISOString(),
  };
}

export type PublicMember = NonNullable<Awaited<ReturnType<typeof currentMember>>>;
