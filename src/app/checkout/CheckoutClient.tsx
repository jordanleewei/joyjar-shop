"use client";

import React, { useState, useEffect, useMemo } from "react";
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

/* ── helpers for dynamic date generation ── */
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_ZH = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildDateOptions() {
  const dates: { key: string; label: string; labelZh: string; iso: string }[] = [];
  const now = new Date();
  // start from tomorrow (1 day in advance) up to 1 month ahead
  for (let d = 1; d <= 30; d++) {
    const dt = new Date(now);
    dt.setDate(now.getDate() + d);
    const dayEn = DAY_NAMES_EN[dt.getDay()];
    const dayZh = DAY_NAMES_ZH[dt.getDay()];
    const mon = MONTH_NAMES[dt.getMonth()];
    const date = dt.getDate();
    const iso = dt.toISOString().slice(0, 10);
    const label = `${dayEn}, ${mon} ${date}`;
    dates.push({ key: iso, label, labelZh: `${dayZh} ${dt.getMonth() + 1}/${date}`, iso });
  }
  return dates;
}

const TIME_SLOTS = [
  { id: "afternoon", label: "Afternoon", zh: "下午", time: "13:00 – 18:00" },
  { id: "evening",   label: "Evening",   zh: "傍晚", time: "18:00 – 22:00" },
];

export function CheckoutClient({ products, bundles, deliveryConfig, slots, zones }: any) {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", email: "", addr: "", unit: "", postal: "", note: "" });
  const [deliveryMode, setDeliveryMode] = useState<"deliver" | "pickup">("deliver");
  const dateOptions = useMemo(() => buildDateOptions(), []);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.key || "");
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0].id);
  const [zoneId, setZoneId] = useState(zones[0]?.id);
  const [pay, setPay] = useState("card");
  const [card, setCard] = useState({ num: "", exp: "", cvc: "" });
  const [swimming, setSwimming] = useState(false);
  const [dateOffset, setDateOffset] = useState(0);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const zone = zones.find((z: any) => z.id === zoneId);
  const sub = cartSubtotal(cart, products, bundles);
  const isPickup = deliveryMode === "pickup";
  const ship = isPickup ? 0 : deliveryFee(cart, zone, deliveryConfig, products, bundles);
  const ready = form.name && form.phone && (isPickup || form.addr) && (pay === "paynow" || (card.num && card.exp && card.cvc));

  const placeOrder = () => {
    setSwimming(true);
    // In a real app, we would make a POST request to a server-side route
    // Here we just trigger the animation and go to the confirm screen.
    const num = "JJ-" + Math.floor(100000 + Math.random() * 899999);
    
    // Find the readable date and time
    const selectedDateObj = dateOptions.find((d) => d.key === selectedDate);
    const dateLabel = selectedDateObj ? selectedDateObj.label : "";
    const timeLabel = TIME_SLOTS.find((ts) => ts.id === selectedTime)?.label || "";
    const slotString = isPickup ? "Self Pick-up" : `${dateLabel} ${timeLabel}`;

    checkoutSwim(() => {
      setSwimming(false);
      clearCart();
      const query = new URLSearchParams({
        num,
        slot: slotString,
        total: (sub + ship).toString(),
        pay,
        name: form.name,
        phone: form.phone
      }).toString();
      router.push(`/checkout/confirm?${query}`);
    }, { duration: 2600 });
  };

  /* ── visible date window: show 5 at a time with scroll arrows ── */
  const VISIBLE_DATES = 5;
  const maxOffset = Math.max(0, dateOptions.length - VISIBLE_DATES);
  const visibleDates = dateOptions.slice(dateOffset, dateOffset + VISIBLE_DATES);

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
              <h3 className="ck-h">Delivery · 配送</h3>

              {/* ── Delivery mode toggle ── */}
              <span className="opt-label">Method · 方式</span>
              <div className="dm-toggle-row">
                <button
                  data-nofish="1"
                  className={`dm-toggle ${deliveryMode === "deliver" ? "is-on" : ""}`}
                  onClick={() => setDeliveryMode("deliver")}
                >
                  <span className="dm-icon">🚚</span>
                  <span className="dm-text">
                    <strong>Deliver</strong>
                    <small>配送到府</small>
                  </span>
                </button>
                <button
                  data-nofish="1"
                  className={`dm-toggle ${deliveryMode === "pickup" ? "is-on" : ""}`}
                  onClick={() => setDeliveryMode("pickup")}
                >
                  <span className="dm-icon">🏪</span>
                  <span className="dm-text">
                    <strong>Self Pick-up</strong>
                    <small>自取 · 免運費</small>
                  </span>
                </button>
              </div>

              {/* ── Address fields (hidden for self pick-up) ── */}
              {isPickup ? (
                <div className="pickup-info">
                  <p className="pickup-addr">📍 JoyJar Studio · 小膠傲工作室</p>
                  <p className="pickup-detail">Pick up at our studio. We'll confirm the exact address via WhatsApp after order.</p>
                  <p className="pickup-detail pickup-zh">下單後我們會透過 WhatsApp 確認取貨地址。</p>
                </div>
              ) : (
                <>
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
                </>
              )}

              {/* ── Preferred date ── */}
              <span className="opt-label">Preferred date · 日期</span>
              <div className="date-picker-wrap">
                <button
                  className="date-arrow"
                  data-nofish="1"
                  disabled={dateOffset === 0}
                  onClick={() => setDateOffset((o) => Math.max(0, o - 1))}
                  aria-label="Previous dates"
                >‹</button>
                <div className="date-row">
                  {visibleDates.map((d) => (
                    <button
                      key={d.key}
                      data-nofish="1"
                      className={`date-chip ${selectedDate === d.key ? "is-on" : ""}`}
                      onClick={() => setSelectedDate(d.key)}
                    >
                      <span className="date-day">{d.label.split(",")[0]}</span>
                      <span className="date-num">{d.label.split(", ")[1]}</span>
                      <small>{d.labelZh}</small>
                    </button>
                  ))}
                </div>
                <button
                  className="date-arrow"
                  data-nofish="1"
                  disabled={dateOffset >= maxOffset}
                  onClick={() => setDateOffset((o) => Math.min(maxOffset, o + 1))}
                  aria-label="Next dates"
                >›</button>
              </div>

              {/* ── Preferred time slot ── */}
              <span className="opt-label">Preferred time · 時段</span>
              <div className="slot-row">
                {TIME_SLOTS.map((ts) => (
                  <button
                    key={ts.id}
                    data-nofish="1"
                    className={`slot time-slot ${selectedTime === ts.id ? "is-on" : ""}`}
                    onClick={() => setSelectedTime(ts.id)}
                  >
                    <span className="ts-label">{ts.label}</span>
                    <span className="ts-zh">{ts.zh}</span>
                    <span className="ts-time">{ts.time}</span>
                  </button>
                ))}
              </div>

              <Field label={isPickup ? "Note" : "Note for delivery"} zh="備註" value={form.note} onChange={set("note")} placeholder="Gift message, buzzer code…" wide />
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
            <div className="summary-row">
              <span>{isPickup ? "Self pick-up 自取" : "Delivery 運費"}</span>
              <span>{isPickup ? "Free 免費" : (ship === 0 ? "Free 免費" : priceStr(ship))}</span>
            </div>
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
