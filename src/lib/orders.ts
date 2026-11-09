import crypto from "crypto";
import { prisma } from "./db";
import { cartSubtotal, deliveryFee } from "./cartUtils";

export const HITPAY_API = process.env.HITPAY_API_URL || "https://api.sandbox.hit-pay.com/v1";

const clampQty = (n: any) => Math.max(1, Math.min(99, Math.floor(Number(n) || 0)));

// Re-check a cart from the browser against the database and price it on the server.
export async function priceCart(rawCart: any[], opts: { pickup: boolean; zoneId?: string; discountRate: number }) {
  const [products, bundles, config, zones] = await Promise.all([
    prisma.product.findMany({ where: { available: true } }),
    prisma.bundle.findMany(),
    prisma.deliveryConfig.findUnique({ where: { id: 1 } }),
    prisma.deliveryZone.findMany(),
  ]);
  const productIds = new Set(products.map((p) => p.id));
  if (!Array.isArray(rawCart) || rawCart.length === 0) throw new Error("Your cart is empty.");

  const cart = rawCart.map((it: any) => {
    const qty = clampQty(it.qty);
    const options = it.options && typeof it.options === "object" ? { sweet: String(it.options.sweet || "") } : {};
    if (it.box) {
      const b = bundles.find((x) => x.id === it.bundleId && x.qty > 1);
      if (!b) throw new Error("A box in your cart is no longer available.");
      const contents = (Array.isArray(it.contents) ? it.contents : []).map((c: any) => ({ productId: String(c.productId) }));
      if (contents.length !== b.qty || contents.some((c: any) => !productIds.has(c.productId)))
        throw new Error("A box in your cart has a flavour we no longer make. Please rebuild it.");
      return { box: true, mode: it.mode === "all" ? "all" : "mix", bundleId: b.id, qty, options, contents };
    }
    const b = bundles.find((x) => x.id === it.bundleId);
    if (!b || !productIds.has(it.productId)) throw new Error("A jar in your cart is no longer available.");
    return { box: false, productId: String(it.productId), bundleId: b.id, qty, options };
  });

  const subtotal = cartSubtotal(cart, products, bundles);
  const zone = zones.find((z) => z.id === opts.zoneId) || zones[0];
  const ship = opts.pickup ? 0 : deliveryFee(cart, zone, config, products, bundles);
  const discount = Math.round(subtotal * (opts.discountRate || 0) * 100) / 100;
  const total = Math.round((subtotal - discount + ship) * 100) / 100;
  return { cart, subtotal, discount, ship, total, zone };
}

export function newOrderNum() {
  return "JJ-" + crypto.randomInt(100000, 999999) + crypto.randomBytes(1).toString("hex").toUpperCase();
}

export async function hitpayStatus(paymentRequestId: string) {
  const key = process.env.HITPAY_API_KEY;
  if (!key) return null;
  const res = await fetch(`${HITPAY_API}/payment-requests/${encodeURIComponent(paymentRequestId)}`, {
    headers: { "X-BUSINESS-API-KEY": key }, cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return String(data.status || "").toLowerCase();
}

// HitPay webhook signature: HMAC-SHA256 (salt) over keys sorted A→Z, each as key+value, excluding "hmac".
export function verifyHitpayHmac(fields: Record<string, string>) {
  const salt = process.env.HITPAY_SALT;
  if (!salt || !fields.hmac) return false;
  const msg = Object.keys(fields).filter((k) => k !== "hmac").sort().map((k) => k + (fields[k] ?? "")).join("");
  const want = crypto.createHmac("sha256", salt).update(msg).digest("hex");
  return want.length === fields.hmac.length && crypto.timingSafeEqual(Buffer.from(want), Buffer.from(fields.hmac));
}
