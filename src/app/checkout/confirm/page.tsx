"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { checkoutSwim } from "@/components/ui/Fish";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@/components/ui/components";
import { Label, Btn } from "@/components/ui/components";
import { priceStr } from "@/components/ui/ShopBlocks";

type OrderView = {
  num: string; status: string; slot: string; total: number; discount: number;
  method: string; pickup: boolean; firstName: string; member: boolean;
};

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const num = searchParams.get("num") || "";
  const [order, setOrder] = useState<OrderView | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!num) { setErr("We couldn't find that order."); return; }
    let tries = 0;
    let timer: any;
    const load = async () => {
      const res = await fetch(`/api/orders/${encodeURIComponent(num)}`, { cache: "no-store" });
      if (!res.ok) { setErr("We couldn't find that order."); return; }
      const data: OrderView = await res.json();
      setOrder(data);
      // payment can take a few seconds to confirm — check again briefly
      if (data.status !== "paid" && tries++ < 5) timer = setTimeout(load, 2500);
    };
    load();
    return () => clearTimeout(timer);
  }, [num]);

  // celebrate a confirmed payment: schools of fish swim across the screen
  const celebrated = useRef(false);
  useEffect(() => {
    if (order?.status !== "paid" || celebrated.current) return;
    celebrated.current = true;
    const timers = [
      window.setTimeout(() => checkoutSwim(undefined, { count: 18, duration: 3400 }), 300),
      window.setTimeout(() => checkoutSwim(undefined, { count: 14, duration: 3800 }), 2200),
      window.setTimeout(() => checkoutSwim(undefined, { count: 10, duration: 4200 }), 4600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [order?.status]);

  if (err) {
    return (
      <div className="wrap confirm-wrap">
        <div className="confirm-card">
          <LogoMark size={104} style={{ margin: "0 auto 18px", display: "block" }} />
          <h1 className="confirm-title">{err}</h1>
          <p className="confirm-note">If you were charged, message us on WhatsApp and we&apos;ll sort it out right away.</p>
          <Btn onClick={() => router.push("/")}>Back to shop · 回到首页</Btn>
        </div>
      </div>
    );
  }
  if (!order) return <div className="wrap confirm-wrap"><div className="confirm-card"><p className="confirm-note">Checking your payment…</p></div></div>;

  const paid = order.status === "paid";
  return (
    <div className="wrap confirm-wrap">
      <div className="confirm-card">
        <LogoMark size={104} style={{ margin: "0 auto 18px", display: "block" }} />
        <Label zh={paid ? "订单已确认" : "等待付款确认"} className="center-eyebrow">{paid ? "Order Confirmed" : "Payment pending"}</Label>
        <h1 className="confirm-title">{paid ? "Thank you — your jars are on their way." : "We're waiting for your payment to clear."}</h1>
        <p className="confirm-zh">{paid ? "心意已收到，花胶甜品即将为您送上。" : "付款确认后，我们会马上为您准备。"}</p>

        <div className="confirm-meta">
          <div><span>Order 订单</span><strong>{order.num}</strong></div>
          <div><span>{order.pickup ? "Pick-up 自取" : "Delivery 配送"}</span><strong>{(order.slot || "").replace("Self Pick-up · ", "") || "TBC"}</strong></div>
          <div><span>{paid ? "Paid 已付" : "Amount 金额"}</span><strong>{priceStr(order.total)} · {order.method === "paynow" ? "PayNow" : "Card"}</strong></div>
        </div>

        {order.pickup ? (
          <p className="confirm-note">
            We&apos;ll WhatsApp you to confirm the exact pick-up address. Thank you{order.firstName ? `, ${order.firstName}` : ""}!
          </p>
        ) : (
          <p className="confirm-note">
            We self-deliver every jar by hand. {order.firstName ? `${order.firstName}, we` : "We"}&apos;ll text you before we arrive.
          </p>
        )}
        {paid && !order.member && (
          <p className="confirm-note">
            <Link href="/club" className="link-quiet">Join the JoyJar Club</Link> for 5% off your next order, free delivery at Diamond, and up to 35% off with missions.
          </p>
        )}
        {!paid && (
          <p className="confirm-note">Still pending after a few minutes? Message us with your order number.</p>
        )}
        <Btn onClick={() => router.push("/")}>Back to shop · 回到首页</Btn>
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
