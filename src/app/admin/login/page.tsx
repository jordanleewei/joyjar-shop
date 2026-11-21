import { redirect } from "next/navigation";
import { isAdmin, adminReady } from "@/lib/admin";
import { AdminLogin } from "./AdminLogin";

export const dynamic = "force-dynamic";

export default async function Page() {
  if (await isAdmin()) redirect("/admin");
  return <AdminLogin ready={await adminReady()} />;
}
