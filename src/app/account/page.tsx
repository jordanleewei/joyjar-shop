import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AccountClient } from "./AccountClient";
import { discountOptions } from "@/lib/discounts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My account · JoyJar Club 小胶傲俱乐部" };

export default async function AccountPage() {
  const member = await currentMember();
  if (!member) redirect("/account/login");
  const orders = (await prisma.order.findMany({
    where: { memberId: member.id, status: { in: ["paid", "pending"] } },
    orderBy: { createdAt: "desc" }, take: 20,
  })).map((o) => ({
    num: o.num, total: o.total, discount: o.discount, status: o.status,
    date: o.createdAt.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" }),
  }));
  const opts = await discountOptions(member);
  const perks = { vouchers: opts.vouchers.length, welcome: !!opts.welcome };
  return <AccountClient member={member} orders={orders} perks={perks} />;
}
