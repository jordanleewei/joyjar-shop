import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { loadOrders } from "@/lib/adminData";
import { AdminBar } from "./AdminBar";
import { OrdersClient } from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 120); // last 4 months
  const [paid, unpaid] = await Promise.all([
    loadOrders({ status: "paid", createdAt: { gte: since } }, 600),
    loadOrders({ status: "pending", createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } }, 100),
  ]);
  return (
    <>
      <AdminBar />
      <OrdersClient paid={paid} unpaid={unpaid} />
    </>
  );
}
