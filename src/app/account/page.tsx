import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AccountClient } from "./AccountClient";
import { petInventory } from "@/lib/points";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My account · JoyJar Club 小胶傲俱乐部" };

export default async function AccountPage() {
  const member = await currentMember();
  if (!member) redirect("/account/login");
  const [rows, paidCount, inv] = await Promise.all([
    prisma.order.findMany({
      where: { memberId: member.id, status: { in: ["paid", "pending"] } },
      orderBy: { createdAt: "desc" }, take: 20,
    }),
    prisma.order.count({ where: { memberId: member.id, status: "paid" } }),
    petInventory(member.id, member.petState),
  ]);
  const orders = rows.map((o) => ({
    num: o.num, total: o.total, discount: o.discount, status: o.status, pointsEarned: o.pointsEarned,
    date: o.createdAt.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" }),
  }));
  const pet = { balance: member.balance, lifetime: member.points, tierIndex: member.tierIndex, owned: inv.owned, treats: inv.treats };
  return <AccountClient member={member} orders={orders} perks={{ welcome: paidCount === 0 }} pet={pet} />;
}
