import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { jarsByProduct } from "@/lib/orders";
import { AdminBar } from "../AdminBar";
import { StockClient } from "./StockClient";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const [products, bundles, paid, toPack] = await Promise.all([
    prisma.product.findMany({ where: { archived: false }, orderBy: { sortOrder: "asc" } }),
    prisma.bundle.findMany({ select: { id: true, qty: true } }),
    prisma.order.findMany({ where: { status: "paid", createdAt: { gte: since } }, select: { items: true } }),
    prisma.order.findMany({ where: { status: "paid", fulfil: "new" }, select: { items: true } }),
  ]);
  const tally = (rows: { items: string }[]) => {
    const t: Record<string, number> = {};
    for (const r of rows) {
      let items: any[] = [];
      try { items = JSON.parse(r.items || "[]"); } catch {}
      for (const [id, n] of Object.entries(jarsByProduct(items, bundles))) t[id] = (t[id] || 0) + n;
    }
    return t;
  };
  const sold = tally(paid), pending = tally(toPack);
  const rows = products.map((p) => ({
    id: p.id, name: p.flavorEn, zh: p.flavorZh, tone: p.tone, stock: p.stock, available: p.available,
    sold30: sold[p.id] || 0, toPack: pending[p.id] || 0,
  }));
  return (
    <>
      <AdminBar />
      <StockClient rows={rows} />
    </>
  );
}
