import crypto from "crypto";
import { prisma } from "./db";
import { cartSubtotal, deliveryFee } from "./cartUtils";
import { sendOrderEmail } from "./email";
import { revalidatePath } from "next/cache";

// product pages are cached for an hour; refresh them when stock changes
export function refreshShop() {
  try { revalidatePath("/"); revalidatePath("/product/[id]", "page"); } catch {}
}

export const HITPAY_API = process.env.HITPAY_API_URL || "https://api.sandbox.hit-pay.com/v1";

const clampQty = (n: any) => Math.max(1, Math.min(99, Math.floor(Number(n) || 0)));

// Re-check a cart from the browser against the database and price it on the server.
// Delivery only (no self-collection). Throws a friendly message if something's off or sold out.
export async function priceCart(rawCart: any[]) {
  const [products, bundles, config] = await Promise.all([
    prisma.product.findMany({ where: { available: true } }),
    prisma.bundle.findMany(),
    prisma.deliveryConfig.findUnique({ where: { id: 1 } }),
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

  // stock: only for flavours we're counting
  const need = jarsByProduct(cart, bundles);
  for (const p of products) {
    if (p.stock == null || !need[p.id]) continue;
    if (p.stock <= 0) throw new Error(`Sorry, ${p.flavorEn} is sold out right now. Please remove it from your cart.`);
    if (need[p.id] > p.stock) throw new Error(`Sorry, we only have ${p.stock} ${p.flavorEn} jar${p.stock === 1 ? "" : "s"} left.`);
  }

  const subtotal = cartSubtotal(cart, products, bundles);
  const ship = deliveryFee(cart, null, config, products, bundles);
  return { cart, subtotal, ship, products };
}

// How many jars of each flavour a cart uses.
export function jarsByProduct(cart: any[], bundles: { id: string; qty: number }[]) {
  const need: Record<string, number> = {};
  for (const it of cart) {
    if (it.box) for (const c of it.contents || []) need[c.productId] = (need[c.productId] || 0) + it.qty;
    else {
      const per = bundles.find((b) => b.id === it.bundleId)?.qty || 1;
      need[it.productId] = (need[it.productId] || 0) + per * it.qty;
    }
  }
  return need;
}

// The only place an order becomes paid (webhook or confirmation page, whichever is first).
// Takes stock off once and emails the shop once.
export async function markPaid(num: string) {
  const res = await prisma.order.updateMany({ where: { num, status: { not: "paid" } }, data: { status: "paid" } });
  if (!res.count) return;
  const order = await prisma.order.findUnique({ where: { num } });
  if (!order) return;
  try {
    const claim = await prisma.order.updateMany({ where: { id: order.id, stockApplied: false }, data: { stockApplied: true } });
    if (claim.count) {
      const bundles = await prisma.bundle.findMany({ select: { id: true, qty: true } });
      const need = jarsByProduct(JSON.parse(order.items || "[]"), bundles);
      const done = await Promise.all(Object.entries(need).map(([id, n]) =>
        prisma.product.updateMany({ where: { id, stock: { not: null } }, data: { stock: { decrement: n } } })));
      if (done.some((d) => d.count)) refreshShop();
    }
  } catch (e) { console.error("stock update failed", order.num, e); }
  try {
    const first = await prisma.order.updateMany({ where: { id: order.id, notified: false }, data: { notified: true } });
    if (first.count) await sendOrderEmail(order);
  } catch (e) { console.error("order email failed", order.num, e); }
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
