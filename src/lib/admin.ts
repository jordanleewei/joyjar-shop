// Admin sign-in: one shared password (ADMIN_PASSWORD in Vercel), kept as a signed cookie.
import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "jj_admin";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function key() {
  const s = process.env.SESSION_SECRET || process.env.DATABASE_URL || "";
  return crypto.createHash("sha256").update("jj-admin:" + s + ":" + (process.env.ADMIN_PASSWORD || "")).digest();
}
const sign = (p: string) => crypto.createHmac("sha256", key()).update(p).digest("base64url");

export function checkAdminPassword(pw: string) {
  const want = process.env.ADMIN_PASSWORD || "";
  if (!want) return false;
  const a = crypto.createHash("sha256").update(String(pw || "")).digest();
  const b = crypto.createHash("sha256").update(want).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function startAdmin() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(COOKIE, exp + "." + sign(exp), {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE,
  });
}

export async function endAdmin() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const raw = (await cookies()).get(COOKIE)?.value || "";
  const [exp, sig] = raw.split(".");
  if (!exp || !sig) return false;
  const want = sign(exp);
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return false;
  return Number(exp) > Date.now() / 1000;
}
