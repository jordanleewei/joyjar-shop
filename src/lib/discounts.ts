// What a member can take off an order. One discount per order: welcome 5% (first order) or points.
import { prisma } from "./db";
import { WELCOME_RATE, DiscountOptions } from "./club";
import { pointsSummary } from "./points";
export { applyDiscount } from "./club";
export type { DiscountChoice, DiscountOptions } from "./club";

export async function discountOptions(member: { id: string }): Promise<DiscountOptions> {
  const [paidCount, pts] = await Promise.all([
    prisma.order.count({ where: { memberId: member.id, status: "paid" } }),
    pointsSummary(member.id),
  ]);
  return {
    welcome: paidCount === 0 ? { rate: WELCOME_RATE, label: "Welcome 5% (first order)" } : null,
    points: pts.balance,
  };
}
