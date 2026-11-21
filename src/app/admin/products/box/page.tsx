import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { AdminBar } from "../../AdminBar";
import { BoxForm } from "./BoxForm";

export const dynamic = "force-dynamic";

export default async function AdminBoxPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const b = await prisma.bundle.findFirst({ where: { qty: { gt: 1 } } });
  if (!b) notFound();
  return (
    <>
      <AdminBar />
      <BoxForm initial={{ id: b.id, qty: b.qty, title: b.title, titleZh: b.titleZh, note: b.note, noteZh: b.noteZh, blurb: b.blurb, blurbZh: b.blurbZh, price: b.price.toFixed(2), imageVer: b.imageVer }} />
    </>
  );
}
