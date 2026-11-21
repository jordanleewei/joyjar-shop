import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { AdminBar } from "../AdminBar";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <>
      <AdminBar />
      <SettingsClient />
    </>
  );
}
