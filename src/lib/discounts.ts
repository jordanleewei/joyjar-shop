// Member discounts: tier %, first-order welcome %, and one-time 5% mission vouchers.
// Everything here runs on the server; the checkout page only sends what the member ticked.
import { prisma } from "./db";
import { MISSIONS, MAX_STACKED, WELCOME_RATE, VOUCHER_RATE, FREE_DELIVERY_FROM_TIER, tierFor, DiscountOptions } from "./club";
export { stackDiscounts } from "./club";
export type { DiscountChoice, DiscountOptions } from "./club";

const HOLD_MS = 2 * 60 * 60 * 1000; // a voucher on an unpaid order frees up again after 2h

export async function availableVouchers(memberId: string) {
  const claims = await prisma.missionClaim.findMany({
    where: { memberId, status: "approved" }, orderBy: { createdAt: "asc" },
  });
  const orderIds = claims.map((c) => c.usedOrderId).filter(Boolean) as string[];
  const orders = orderIds.length ? await prisma.order.findMany({ where: { id: { in: orderIds } }, select: { id: true, status: true, createdAt: true } }) : [];
  const byId = new Map(orders.map((o) => [o.id, o]));
  const now = Date.now();
  return claims.filter((c) => {
    if (!c.usedOrderId) return true;
    const o = byId.get(c.usedOrderId);
    if (!o) return true;
    if (o.status === "paid") return false;
    if (o.status === "failed") return true;
    return now - o.createdAt.getTime() > HOLD_MS; // pending and abandoned
  });
}

export async function discountOptions(member: { id: string; spend: number }): Promise<DiscountOptions> {
  const t = tierFor(member.spend);
  const paidCount = await prisma.order.count({ where: { memberId: member.id, status: "paid" } });
  const vouchers = await availableVouchers(member.id);
  const label = (m: string) => MISSIONS.find((x) => x.id === m)?.en || "Mission";
  return {
    tier: t.tier.discount ? { rate: t.tier.discount, label: `${t.tier.en} member` } : null,
    welcome: paidCount === 0 ? { rate: WELCOME_RATE, label: "Welcome (first order)" } : null,
    vouchers: vouchers.map((v) => ({ id: v.id, rate: VOUCHER_RATE, label: label(v.mission) })),
    freeDelivery: t.index >= FREE_DELIVERY_FROM_TIER,
    cap: MAX_STACKED,
  };
}

