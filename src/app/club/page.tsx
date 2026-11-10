import React from "react";
import type { Metadata } from "next";
import { currentMember } from "@/lib/auth";
import { ClubClient } from "./ClubClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "JoyJar Club · 小胶傲俱乐部",
  description: "Free to join. Design your member card, adopt a fish maw pet and save up to 15% on every jar.",
  openGraph: {
    title: "JoyJar Club · 小胶傲俱乐部",
    description: "Free to join. Design your member card, adopt a fish maw pet and save up to 15% on every jar.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default async function ClubPage() {
  // members manage everything from their account page
  const member = await currentMember();
  if (member) redirect("/account");
  return <ClubClient member={null} orders={[]} />;
}
