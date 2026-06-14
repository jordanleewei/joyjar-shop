"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Shared";
import { Btn } from "@/components/ui/components";
import { Seal } from "@/components/ui/components";
import { useCartStore } from "@/store/cartStore";
import { priceStr } from "@/components/ui/ShopBlocks";
import { lineFor, boxSummary, boxTitle, cartSubtotal, deliveryFee } from "@/lib/cartUtils";
import { optionSummary } from "@/lib/constants";
import { checkoutSwim } from "@/components/ui/Fish";

function Field({ label, zh, value, onChange, placeholder, type = "text", wide }: any) {
  return (
    <label className={`field ${wide ? "field-wide" : ""}`}>
      <span className="field-label">{label} <em>{zh}</em></span>
      <input type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function CheckoutClient({ products, bundles, deliveryConfig, slots, zones }: any) {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", email: "", addr: "", unit: "", postal: "", note: "" });
  const [slot, setSlot] = useState(slots[0]?.label || "");
  const [zoneId, setZoneId] = useState(zones[0]?.id);
  const [pay, setPay] = useState("card");
  const [card, setCard] = useState({ num: "", exp: "", cvc: "" });
  const [swimming, setSwimming] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const zone = zones.find((z: any) => z.id === zoneId);
  const sub = cartSubtotal(cart, products, bundles);
  const ship = deliveryFee(cart, zone, deliveryConfig, products, bundles);
  const ready = form.name && form.phone && form.addr && (pay === "paynow" || (card.num && card.exp && card.cvc));

  const placeOrder = () => {
    setSwimming(true);
    // In a real app, we would make a POST request to a server-side route
    // Here we just trigger the animation and go to the confirm screen.
    const num = "JJ-" + Math.floor(100000 + Math.random() * 899999);
    
    checkoutSwim(() => {
      setSwimming(false);
      clearCart();
      // Normally we pass order id, for now just generic confirm
      router.push("/checkout/confirm");
    }, { duration: 2600 });
  };

  const Steps = (
    <div className="ck-steps">
      <span className="ck-step is-on">1 · Cart</span>
      <span className="ck-step is-cur">2 · Checkout</span>
      <span className="ck-step">3 · Done</span>
    </div>
  );

  const PaymentCard = (
    <div className="pay-body">
      {pay === "card" && (
        <div className="card-fields">
          <div className="stripe-badge">Secured by <strong>Stripe</strong></div>
          <Field label="Card number" zh="卡號" value={card.num} placeholder="4242 4242 4242 4242"
            onChange={(v: string) => setCard((c) => ({ ...c, num: v }))} wide />
          <div className="field-pair">
            <Field label="Expiry" zh="到期" value={card.exp} placeholder="MM / YY"
              onChange={(v: string) => setCard((c) => ({ ...c, exp: v }))} />
            <Field label="CVC" zh="安全碼" value={card.cvc} placeholder="123"
              onChange={(v: string) => setCard((c) => ({ ...c, cvc: v }))} />
          </div>
        </div>
      )}
      {pay === "paynow" && (
        <div className="paynow-body">
          <div className="qr" aria-hidden="true">
            <div className="qr-grid">
              {Array.from({ length: 49 }).map((_, i) =>
                <span key={i} style={{ opacity: (i * 7 + (i % 5) * 13) % 3 === 0 ? 1 : 0 }} />
              )}
            </div>
            <div className="qr-mark"><Seal size={34} /></div>
          </div>
          <div className="paynow-info">
            <p className="paynow-zh">PayNow 掃碼付款</p>
            <p>Scan with any Singapore bank app to pay <strong>{priceStr(sub + ship)}</strong>.</p>
            <p className="paynow-uen">UEN · 小膠傲 JoyJar Pte Ltd · 20260613A</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="screen checkout-screen">
      <Header />
      <div className="wrap ck-wrap">
        <button className="back-link" data-nofish="1" onClick={() => router.back()}>← Back to cart · 返回</button>
        {Steps}
        <div className="ck-grid ck-two-col">
          <div className="ck-forms">
            <section className="ck-block">
              <h3 className="ck-h">Contact · 聯絡</h3>
              <div className="field-grid">
                <Field label="Full name" zh="姓名" value={form.name} onChange={set("name")} placeholder="Jane Tan" />
                <Field label="Phone" zh="電話" value={form.phone} onChange={set("phone")} placeholder="+65 ····" />
                <Field label="Email" zh="電郵" value={form.email} onChange={set("email")} placeholder="jane@email.com" type="email" wide />
              </div>
            </section>

            <section className="ck-block">
              <h3 className="ck-h">Delivery · 配送 <span className="ck-tag">Self-delivered 自家配送</span></h3>
              <div className="field-grid">
                <Field label="Address" zh="地址" value={form.addr} onChange={set("addr")} placeholder="Street & block" wide />
                <Field label="Unit" zh="單位" value={form.unit} onChange={set("unit")} placeholder="#12-34" />
                <Field label="Postal" zh="郵編" value={form.postal} onChange={set("postal")} placeholder="123456" />
              </div>
              {zones.length > 0 && (
                <React.Fragment>
                  <span className="opt-label">Area · 地區</span>
                  <div className="slot-row">
                    {zones.map((z: any) => (
                      <button key={z.id} data-nofish="1" className={`slot ${zoneId === z.id ? "is-on" : ""}`} onClick={() => setZoneId(z.id)}>
                        {z.name} · {z.nameZh}{sub < (deliveryConfig?.freeThreshold || 50) ? ` · ${priceStr(z.fee)}` : ""}
                      </button>
                    ))}
                  </div>
                </React.Fragment>
              )}
              <span className="opt-label">Preferred window · 時段</span>
              <div className="slot-row">
                {slots.map((s: any) => (
                  <button key={s.id} data-nofish="1" className={`slot ${slot === s.label ? "is-on" : ""}`} onClick={() => setSlot(s.label)}>{s.label}</button>
                ))}
              </div>
              <Field label="Note for delivery" zh="備註" value={form.note} onChange={set("note")} placeholder="Gift message, buzzer code…" wide />
            </section>

            <section className="ck-block">
              <h3 className="ck-h">Payment · 付款</h3>
              <div className="pay-tabs">
                <button data-nofish="1" className={`pay-tab ${pay === "card" ? "is-on" : ""}`} onClick={() => setPay("card")}>Card 信用卡</button>
                <button data-nofish="1" className={`pay-tab ${pay === "paynow" ? "is-on" : ""}`} onClick={() => setPay("paynow")}>PayNow</button>
              </div>
              {PaymentCard}
            </section>
          </div>

          <aside className="summary summary-sticky">
            <h3 className="summary-title">Order summary · 摘要</h3>
            <div className="summary-lines">
              {cart.map((it, i) => {
                const L = lineFor(it, products, bundles);
                if (it.box) {
                  const optSumm = optionSummary(it.options, "en");
                  return (
                    <div className="summary-item" key={i}>
                      <span>{it.qty}× {boxTitle(it, "en")}<em>{boxSummary(it.contents || [], products).map((s) => s.count + "× " + s.name).join(", ")}{optSumm ? " · " + optSumm : ""}</em></span>
                      <span>{priceStr(L.total)}</span>
                    </div>
                  );
                }
                const { p, b } = L;
                const summ = optionSummary(it.options, "en");
                return (
                  <div className="summary-item" key={i}>
                    <span>{it.qty}× {p ? p.flavorEn : "Item"}<em>{b ? b.title : ""}{summ ? " · " + summ : ""}</em></span>
                    <span>{priceStr((b ? b.price : 0) * it.qty)}</span>
                  </div>
                );
              })}
            </div>
            <div className="summary-row"><span>Subtotal 小計</span><span>{priceStr(sub)}</span></div>
            <div className="summary-row"><span>Delivery 運費</span><span>{ship === 0 ? "Free 免費" : priceStr(ship)}</span></div>
            <div className="summary-row total"><span>Total 總計</span><span>{priceStr(sub + ship)}</span></div>
            <Btn disabled={!ready} onClick={() => ready && placeOrder()}>
              {pay === "paynow" ? "I've paid · 完成付款" : `Pay ${priceStr(sub + ship)} · 付款`}
            </Btn>
            <p className="summary-secure">🔒 Encrypted · Stripe &amp; PayNow</p>
          </aside>
        </div>
      </div>
      {swimming && <div className="swim-veil" />}
    </div>
  );
}
