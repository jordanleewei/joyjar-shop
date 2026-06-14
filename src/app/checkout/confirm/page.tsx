"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/ui/components";
import { Label, Btn } from "@/components/ui/components";
import { priceStr } from "@/components/ui/ShopBlocks";

// Typically order would be fetched from server based on URL ID
// For now, static presentation to mirror the original
export default function ConfirmScreen() {
  const router = useRouter();
  
  const order = {
    num: "JJ-" + Math.floor(100000 + Math.random() * 899999),
    slot: "Saturday 1pm - 5pm",
    total: 80,
    pay: "card",
    form: { name: "Valued Guest", phone: "+65 8000 0000" }
  };
  
  const num = order.num;

  return (
    <div className="screen confirm-screen">
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
          
          <p className="confirm-note">
            We self-deliver every jar by hand. {order.form.name ? order.form.name.split(" ")[0] + ", we" : "We"}'ll
            text {order.form.phone || "you"} before we arrive.
          </p>
          <Btn onClick={() => router.push("/")}>Back to shop · 回到首頁</Btn>
        </div>
      </div>
    </div>
  );
}
