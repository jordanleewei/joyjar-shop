import React from "react";
import type { Metadata } from "next";
import { currentMember } from "@/lib/auth";
import { ClubClient } from "./ClubClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "JoyJar Club · 小胶傲俱乐部",
  description: "Free to join. 5% off your first order, 1 point for every $1, 100 points = $5 off, and a fish maw pet to play with.",
  openGraph: {
    title: "JoyJar Club · 小胶傲俱乐部",
    description: "Free to join. 5% off your first order, 1 point for every $1, 100 points = $5 off, and a fish maw pet to play with.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default async function ClubPage() {
  // members manage everything from their account page
  const member = await currentMember();
  if (member) redirect("/account");
  return <ClubClient member={null} orders={[]} />;
}
