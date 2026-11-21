import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { AdminBar } from "../../AdminBar";
import { ProductForm } from "./ProductForm";

export const dynamic = "force-dynamic";

const list = (s: string) => { try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a.join("\n") : ""; } catch { return ""; } };

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const single = (await prisma.bundle.findFirst({ where: { qty: 1 } }))?.price ?? 15.8;
  if (id === "new") return (<><AdminBar /><ProductForm initial={null} single={single} /></>);
  const p = await prisma.product.findUnique({ where: { id: decodeURIComponent(id) } });
  if (!p) notFound();
  let sweet = true;
  try { sweet = !!JSON.parse(p.options || "{}").sweet; } catch {}
  const initial = {
    id: p.id, flavorEn: p.flavorEn, flavorZh: p.flavorZh, name: p.name, nameZh: p.nameZh,
    tagline: p.tagline, taglineZh: p.taglineZh, blurb: p.blurb, blurbZh: p.blurbZh,
    ingredients: p.ingredients, ingredientsZh: p.ingredientsZh, allergens: p.allergens,
    notes: list(p.notes), notesZh: list(p.notesZh), sweet, tone: p.tone, cap: p.cap,
    available: p.available, sortOrder: p.sortOrder, price: p.price == null ? "" : p.price.toFixed(2), imageVer: p.imageVer,
  };
  return (<><AdminBar /><ProductForm initial={initial} single={single} /></>);
}
