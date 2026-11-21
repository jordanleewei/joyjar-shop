import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { loadOrders } from "@/lib/adminData";
import { LabelsClient } from "./LabelsClient";

export const dynamic = "force-dynamic";

export default async function LabelsPage({ searchParams }: { searchParams: Promise<{ nums?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { nums = "" } = await searchParams;
  const list = nums.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 200);
  const orders = list.length ? await loadOrders({ num: { in: list } }, 200) : [];
  const order = (n: string) => list.indexOf(n);
  orders.sort((a, b) => order(a.num) - order(b.num));
  return <LabelsClient orders={orders} />;
}
