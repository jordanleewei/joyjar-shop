import React from "react";
import type { Metadata } from "next";
import { currentMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ClubClient } from "./ClubClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "JoyJar Club · 小胶傲俱乐部",
  description: "Free to join. Design your member card, adopt a fish maw pet and save up to 15% on every jar.",
};

export default async function ClubPage() {
  const member = await currentMember();
  const orders = member
    ? (await prisma.order.findMany({
        where: { memberId: member.id, status: { in: ["paid", "pending"] } },
        orderBy: { createdAt: "desc" }, take: 8,
      })).map((o) => ({
        num: o.num, total: o.total, status: o.status,
        date: o.createdAt.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" }),
      }))
    : [];
  return <ClubClient member={member} orders={orders} />;
}
