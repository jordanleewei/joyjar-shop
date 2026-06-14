"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogoMark } from "@/components/ui/components";
import { Label, Btn } from "@/components/ui/components";
import { priceStr } from "@/components/ui/ShopBlocks";

// Typically order would be fetched from server based on URL ID
// For now, static presentation reading from URL query parameters
function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const order = {
    num: searchParams.get("num") || "JJ-" + Math.floor(100000 + Math.random() * 899999),
    slot: searchParams.get("slot") || "Saturday 1pm - 5pm",
    total: searchParams.get("total") ? parseFloat(searchParams.get("total") as string) : 80,
    pay: searchParams.get("pay") || "card",
    form: { 
      name: searchParams.get("name") || "Valued Guest", 
      phone: searchParams.get("phone") || "+65 8000 0000" 
    }
  };
  
  const num = order.num;

  return (
    <div className="wrap confirm-wrap">
      <div className="confirm-card">
        <LogoMark size={104} style={{ margin: "0 auto 18px", display: "block" }} />
        <Label zh="訂單已確認" className="center-eyebrow">Order Confirmed</Label>
        <h1 className="confirm-title">Thank you — your jars are on their way.</h1>
        <p className="confirm-zh">心意已收到，花膠甜品即將為您送上。</p>
        
        <div className="confirm-meta">
          <div><span>Order 訂單</span><strong>{num}</strong></div>
          <div><span>Delivery 配送</span><strong>{(order.slot || "").split("  ")[0] || "TBC"}</strong></div>
          <div><span>Paid 已付</span><strong>{priceStr(order.total)} · {order.pay === "paynow" ? "PayNow" : "Card"}</strong></div>
        </div>
        
        {order.slot === "Self Pick-up" ? (
          <p className="confirm-note">
            We will contact you via WhatsApp at {order.form.phone || "your number"} to confirm the exact pick-up address.
            Thank you, {order.form.name ? order.form.name.split(" ")[0] : "valued guest"}!
          </p>
        ) : (
          <p className="confirm-note">
            We self-deliver every jar by hand. {order.form.name ? order.form.name.split(" ")[0] + ", we" : "We"}'ll
            text {order.form.phone || "you"} before we arrive.
          </p>
        )}
        <Btn onClick={() => router.push("/")}>Back to shop · 回到首頁</Btn>
      </div>
    </div>
  );
}

export default function ConfirmScreen() {
  return (
    <div className="screen confirm-screen">
      <Suspense fallback={<div className="wrap confirm-wrap">Loading...</div>}>
        <ConfirmContent />
      </Suspense>
    </div>
  );
}
