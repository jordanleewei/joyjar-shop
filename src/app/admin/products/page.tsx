import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { AdminBar } from "../AdminBar";
import { ProductsClient } from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [products, bundles] = await Promise.all([
    prisma.product.findMany({ orderBy: [{ archived: "asc" }, { sortOrder: "asc" }] }),
    prisma.bundle.findMany(),
  ]);
  const single = bundles.find((b) => b.qty === 1)?.price ?? 15.8;
  const box = bundles.find((b) => b.qty > 1)?.price ?? 68;
  const rows = products.map((p) => ({
    id: p.id, flavorEn: p.flavorEn, flavorZh: p.flavorZh, name: p.name, tone: p.tone, cap: p.cap, imageVer: p.imageVer,
    price: p.price, available: p.available, archived: p.archived, stock: p.stock, tagline: p.tagline,
  }));
  return (
    <>
      <AdminBar />
      <ProductsClient rows={rows} single={single} box={box} />
    </>
  );
}
