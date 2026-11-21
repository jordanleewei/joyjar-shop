// Points ledger, worked out from orders, missions and pet-shop purchases (no separate balance to drift).
import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./db";
import { MISSION_POINTS, ACCESSORIES, FREE_ACCESSORIES, TREATS } from "./club";

type Db = PrismaClient | Prisma.TransactionClient;
export const HOLD_MS = 2 * 60 * 60 * 1000; // points on an unpaid order are held for 2h, then freed

export async function pointsSummary(memberId: string, db: Db = prisma) {
  const [paid, held, missions, spentShop] = await Promise.all([
    db.order.aggregate({ where: { memberId, status: "paid" }, _sum: { pointsEarned: true, pointsUsed: true } }),
    db.order.aggregate({ where: { memberId, status: "pending", createdAt: { gte: new Date(Date.now() - HOLD_MS) } }, _sum: { pointsUsed: true } }),
    db.missionClaim.count({ where: { memberId, status: "approved" } }),
    db.petPurchase.aggregate({ where: { memberId }, _sum: { cost: true } }),
  ]);
  const fromOrders = paid._sum.pointsEarned || 0;
  const fromMissions = missions * MISSION_POINTS;
  const lifetime = fromOrders + fromMissions;
  const spent = (paid._sum.pointsUsed || 0) + (held._sum.pointsUsed || 0) + (spentShop._sum.cost || 0);
  return { lifetime, balance: Math.max(0, lifetime - spent), fromOrders, fromMissions };
}

// Lock the member row so two purchases/orders can't spend the same points at once.
export async function lockMember(tx: Prisma.TransactionClient, memberId: string) {
  await tx.$queryRaw`SELECT id FROM "Member" WHERE id = ${memberId} FOR UPDATE`;
}

export function parsePetState(raw: string) {
  try { const j = JSON.parse(raw || "{}"); return { fed: (j.fed && typeof j.fed === "object" ? j.fed : {}) as Record<string, number> }; }
  catch { return { fed: {} as Record<string, number> }; }
}

// What the member owns: accessories and treats left.
export async function petInventory(memberId: string, petStateRaw?: string, db: Db = prisma) {
  const [buys, member] = await Promise.all([
    db.petPurchase.findMany({ where: { memberId }, select: { item: true } }),
    petStateRaw === undefined ? db.member.findUnique({ where: { id: memberId }, select: { petState: true } }) : null,
  ]);
  const state = parsePetState(petStateRaw ?? member?.petState ?? "{}");
  const owned = new Set<string>(FREE_ACCESSORIES);
  const bought: Record<string, number> = {};
  for (const b of buys) {
    if (ACCESSORIES.some((a) => a.id === b.item)) owned.add(b.item);
    else if (b.item.startsWith("treat:")) { const id = b.item.slice(6); bought[id] = (bought[id] || 0) + 1; }
  }
  const treats: Record<string, number> = {};
  for (const t of TREATS) treats[t.id] = Math.max(0, (bought[t.id] || 0) * t.pack - (state.fed[t.id] || 0));
  return { owned: [...owned], treats, fed: state.fed };
}
