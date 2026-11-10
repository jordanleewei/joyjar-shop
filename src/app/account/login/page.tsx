import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentMember } from "@/lib/auth";
import { LoginClient } from "./LoginClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Log in · JoyJar Club 小胶傲俱乐部" };

export default async function LoginPage() {
  if (await currentMember()) redirect("/account");
  return <LoginClient />;
}
