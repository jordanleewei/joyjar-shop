// Admin sign-in: one shared password, kept as a signed cookie.
// The password can be changed on /admin/settings (stored hashed in the database).
// Until then, ADMIN_PASSWORD in Vercel is used.
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { hashPassword, verifyPassword } from "./auth";

const COOKIE = "jj_admin";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days
const KEY = "admin_password";

async function storedHash() {
  const row = await prisma.setting.findUnique({ where: { key: KEY } }).catch(() => null);
  return row?.value || "";
}

export async function adminReady() {
  return !!(process.env.ADMIN_PASSWORD || (await storedHash()));
}

// signing key changes whenever the password changes, so old sign-ins stop working
async function key() {
  const s = process.env.SESSION_SECRET || process.env.DATABASE_URL || "";
  const pw = (await storedHash()) || process.env.ADMIN_PASSWORD || "";
  return crypto.createHash("sha256").update("jj-admin:" + s + ":" + pw).digest();
}
const sign = async (p: string) => crypto.createHmac("sha256", await key()).update(p).digest("base64url");

export async function checkAdminPassword(pw: string) {
  const hash = await storedHash();
  if (hash) return verifyPassword(String(pw || ""), hash);
  const want = process.env.ADMIN_PASSWORD || "";
  if (!want) return false;
  const a = crypto.createHash("sha256").update(String(pw || "")).digest();
  const b = crypto.createHash("sha256").update(want).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function setAdminPassword(pw: string) {
  const value = hashPassword(pw);
  await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value }, update: { value } });
}

export async function startAdmin() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(COOKIE, exp + "." + (await sign(exp)), {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE,
  });
}

export async function endAdmin() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!(await adminReady())) return false;
  const raw = (await cookies()).get(COOKIE)?.value || "";
  const [exp, sig] = raw.split(".");
  if (!exp || !sig) return false;
  const want = await sign(exp);
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return false;
  return Number(exp) > Date.now() / 1000;
}
