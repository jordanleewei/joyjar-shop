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
import Link from "next/link";
import { TIERS, stackDiscounts, DiscountOptions } from "@/lib/club";


function Field({ id, label, zh, value, onChange, onBlur, placeholder, type = "text", wide, required, optional, error, inputMode, autoComplete }: any) {
  return (
    <label className={`field ${wide ? "field-wide" : ""} ${error ? "is-error" : ""} ${value && !error ? "is-ok" : ""}`} htmlFor={id}>
      <span className="field-label">
        {label} <em>{zh}</em>
        {optional && <i className="opt">optional</i>}
      </span>
      <input id={id} type={type} value={value} placeholder={placeholder} inputMode={inputMode} autoComplete={autoComplete}
        aria-required={required || undefined} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
      {error && <span className="field-err" id={`${id}-err`}>{error}</span>}
    </label>
  );
}

// What's still needed before paying (shown inline and in the summary)
function validate(form: any, isPickup: boolean) {
  const e: Record<string, string> = {};
  const digits = (form.phone || "").replace(/\D/g, "");
  if (!form.name.trim()) e.name = "Add your name so we know who it's for.";
  if (!digits) e.phone = "Add a phone number so we can WhatsApp you about delivery.";
  else if (digits.length < 8) e.phone = "Looks like a digit or two is missing.";
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Just double-check this email.";
  if (!isPickup) {
    if (!form.addr.trim()) e.addr = "Add your street and block number.";
    if (!/^\d{6}$/.test((form.postal || "").trim())) e.postal = form.postal.trim() ? "Singapore postal codes have 6 digits." : "Add your 6-digit postal code.";
  }
  return e;
}
const FIELD_LABEL: Record<string, string> = { name: "Full name", phone: "Phone", email: "Email", addr: "Address", postal: "Postal code" };
const FIELD_ORDER = ["name", "phone", "email", "addr", "postal"];

/* ── helpers for dynamic date generation ── */
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_ZH = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
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

export function CheckoutClient({ products, bundles, deliveryConfig, slots, zones, member }: any) {
  const router = useRouter();
  const { cart, clearCart, prune } = useCartStore();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({ name: member?.name || "", phone: "", email: member?.email || "", addr: "", unit: "", postal: "", note: "" });
  const [deliveryMode, setDeliveryMode] = useState<"deliver" | "pickup">("deliver");
  const dateOptions = useMemo(() => buildDateOptions(), []);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.key || "");
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0].id);
  const [zoneId, setZoneId] = useState(zones[0]?.id);
  const [pay, setPay] = useState("paynow");
  const [swimming, setSwimming] = useState(false);
  const [dateOffset, setDateOffset] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);
  // which member discounts to use (all on by default; the server re-checks and caps at 35%)
  const [useDisc, setUseDisc] = useState<{ tier: boolean; welcome: boolean; vouchers: string[] }>(() => ({
    tier: true, welcome: true, vouchers: (member?.discounts?.vouchers || []).map((v: any) => v.id),
  }));

  useEffect(() => {
    prune(products.map((p: any) => p.id), bundles.map((b: any) => b.id));
    setMounted(true);
  }, []);
  
  const sub = cartSubtotal(cart, products, bundles);
  const zone = zones.find((z: any) => z.id === zoneId);
  const isPickup = deliveryMode === "pickup";
  const opts: DiscountOptions | null = member?.discounts || null;
  const freeShip = !!opts?.freeDelivery;
  const ship = isPickup || freeShip ? 0 : deliveryFee(cart, zone, deliveryConfig, products, bundles);
  const stacked = opts ? stackDiscounts(opts, useDisc) : { rate: 0, parts: [] as any[] };
  const rate = stacked.rate;
  const disc = Math.round(sub * rate * 100) / 100;
  const total = Math.round((sub - disc + ship) * 100) / 100;
  const tier = member ? TIERS[member.tierIndex] : null;
  const usedIds = new Set(stacked.parts.map((p: any) => p.id).filter(Boolean));

  if (!mounted) return null;

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const errors = validate(form, isPickup);
  const missing = FIELD_ORDER.filter((k) => errors[k]);
  const ready = missing.length === 0;
  const err = (k: string) => (showAll || touched[k] ? errors[k] : undefined);
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));
  const contactDone = !errors.name && !errors.phone && !errors.email;
  const deliveryDone = isPickup || (!errors.addr && !errors.postal);
  const goTo = (k: string) => {
    const el = document.getElementById(`f-${k}`) as HTMLInputElement | null;
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => el.focus({ preventScroll: true }), 350); }
  };
  const goSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const onPay = () => {
    if (!ready) { setShowAll(true); goTo(missing[0]); return; }
    placeOrder();
  };
  const dateObj = dateOptions.find((d) => d.key === selectedDate);
  const timeObj = TIME_SLOTS.find((ts) => ts.id === selectedTime);

  const placeOrder = async () => {
    setIsProcessing(true);
    setError("");

    const selectedDateObj = dateOptions.find((d) => d.key === selectedDate);
    const dateLabel = selectedDateObj ? selectedDateObj.label : "";
    const timeLabel = TIME_SLOTS.find((ts) => ts.id === selectedTime)?.label || "";
    const slotString = isPickup ? `Self Pick-up · ${dateLabel} ${timeLabel}` : `${dateLabel} ${timeLabel}`;

    try {
      const res = await fetch("/api/create-hitpay-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, form, pickup: isPickup, zoneId, slot: slotString, pay, discounts: useDisc })
      });
      const data = await res.json();

      if (data.url) {
        setSwimming(true);
        checkoutSwim(() => {
          setSwimming(false);
          clearCart();
          window.location.href = data.url;
        }, { duration: 2600 });
      } else {
        setError(data.error || "Payment initialization failed");
        setIsProcessing(false);
      }
    } catch (err) {
      setError("Error contacting payment gateway. Please try again.");
      setIsProcessing(false);
    }
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
      <div className="hitpay-info">
        <div className="stripe-badge" style={{marginBottom: "16px"}}>Secured by <strong>HitPay</strong></div>
        <p style={{marginBottom: "8px", fontSize: "0.95rem"}}>You will be safely redirected to HitPay to complete your {pay === "paynow" ? "PayNow" : "Credit Card"} payment.</p>
        <p style={{color: "var(--fg-muted)", fontSize: "0.85rem"}}>UEN · 小胶傲 JoyJar · 53532057D</p>
      </div>
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
            <p className="ck-intro">Just a few details and your jars are on their way. Your summary on the right updates as you go, so you can check everything before paying.</p>
            <section className="ck-block" id="ck-contact">
              <h3 className="ck-h"><span className={`ck-num ${contactDone ? "is-done" : ""}`}>{contactDone ? "✓" : "1"}</span>Contact · 联系</h3>
              <div className="field-grid">
                <Field id="f-name" label="Full name" zh="姓名" value={form.name} onChange={set("name")} onBlur={blur("name")} placeholder="JoyJar" required error={err("name")} autoComplete="name" />
                <Field id="f-phone" label="Phone" zh="电话" value={form.phone} onChange={set("phone")} onBlur={blur("phone")} placeholder="+65 8123 4567" type="tel" inputMode="tel" required error={err("phone")} autoComplete="tel" />
                <Field id="f-email" label="Email" zh="邮箱" value={form.email} onChange={set("email")} onBlur={blur("email")} placeholder="joyjar@email.com" type="email" wide optional error={err("email")} autoComplete="email" />
              </div>
            </section>

            <section className="ck-block" id="ck-delivery">
              <h3 className="ck-h"><span className={`ck-num ${deliveryDone ? "is-done" : ""}`}>{deliveryDone ? "✓" : "2"}</span>Delivery · 配送</h3>

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
                    <small>自取 · 免运费</small>
                  </span>
                </button>
              </div>

              {/* ── Address fields (hidden for self pick-up) ── */}
              {isPickup ? (
                <div className="pickup-info">
                  <p className="pickup-addr">📍 JoyJar Studio · 小胶傲工作室</p>
                  <p className="pickup-detail">Pick up at our studio. We'll confirm the exact address via WhatsApp after order.</p>
                  <p className="pickup-detail pickup-zh">下单后我们会通过 WhatsApp 确认取货地址。</p>
                </div>
              ) : (
                <>
                  <div className="field-grid">
                    <Field id="f-addr" label="Address" zh="地址" value={form.addr} onChange={set("addr")} onBlur={blur("addr")} placeholder="Block 123, Joy Street 4" wide required error={err("addr")} autoComplete="street-address" />
                    <Field id="f-unit" label="Unit" zh="单位" value={form.unit} onChange={set("unit")} placeholder="#12-34" optional />
                    <Field id="f-postal" label="Postal code" zh="邮编" value={form.postal} onChange={set("postal")} onBlur={blur("postal")} placeholder="123456" inputMode="numeric" required error={err("postal")} autoComplete="postal-code" />
                  </div>
                  {zones.length > 0 && (
                    <React.Fragment>
                      <span className="opt-label">Area · 地区</span>
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
              <span className="opt-label">Preferred time · 时段</span>
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

              <Field id="f-note" label={isPickup ? "Note" : "Note for delivery"} zh="备注" value={form.note} onChange={set("note")} placeholder="Gift message, buzzer code…" wide optional />
            </section>

            <section className="ck-block" id="ck-payment">
              <h3 className="ck-h"><span className="ck-num is-done">✓</span>Payment · 付款</h3>
              <div className="pay-tabs">
                <button data-nofish="1" className={`pay-tab ${pay === "paynow" ? "is-on" : ""}`} onClick={() => setPay("paynow")}>PayNow</button>
                <button data-nofish="1" className={`pay-tab ${pay === "card" ? "is-on" : ""}`} onClick={() => setPay("card")}>Card 信用卡</button>
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
            <div className="review">
              <div className="review-sec">
                <div className="review-head"><strong>Contact · 联系</strong><button type="button" className="review-edit" data-nofish="1" onClick={() => goSection("ck-contact")}>Edit</button></div>
                <p className={form.name.trim() ? "" : "review-empty"}>{form.name.trim() || "Your name"}</p>
                <p className={errors.phone ? "review-empty" : ""}>{form.phone.trim() || "Your phone number"}</p>
                {form.email.trim() && <p>{form.email}</p>}
              </div>
              <div className="review-sec">
                <div className="review-head"><strong>{isPickup ? "Self pick-up · 自取" : "Deliver to · 配送"}</strong><button type="button" className="review-edit" data-nofish="1" onClick={() => goSection("ck-delivery")}>Edit</button></div>
                {isPickup ? (
                  <p>JoyJar Studio (we&apos;ll WhatsApp you the address)</p>
                ) : (
                  <>
                    <p className={errors.addr ? "review-empty" : ""}>{form.addr.trim() ? `${form.addr.trim()}${form.unit.trim() ? `, ${form.unit.trim()}` : ""}` : "Your address"}</p>
                    <p className={errors.postal ? "review-empty" : ""}>{form.postal.trim() ? `Singapore ${form.postal.trim()}` : "Postal code"}{zone ? ` · ${zone.name}` : ""}</p>
                  </>
                )}
                <p>{dateObj ? dateObj.label : ""} · {timeObj ? `${timeObj.label} ${timeObj.time}` : ""}</p>
                {form.note.trim() && <p className="review-note">“{form.note.trim()}”</p>}
              </div>
              <div className="review-sec">
                <div className="review-head"><strong>Payment · 付款</strong><button type="button" className="review-edit" data-nofish="1" onClick={() => goSection("ck-payment")}>Edit</button></div>
                <p>{pay === "paynow" ? "PayNow" : "Card"} via HitPay</p>
              </div>
            </div>
            <div className="summary-row"><span>Subtotal 小计</span><span>{priceStr(sub)}</span></div>
            <div className="summary-row">
              <span>{isPickup ? "Self pick-up 自取" : "Delivery 运费"}</span>
              <span>{isPickup ? "Free 免费" : (ship === 0 ? "Free 免费" : priceStr(ship))}</span>
            </div>
            {opts && (opts.tier || opts.welcome || opts.vouchers.length > 0 || freeShip) && (
              <div className="disc-box">
                <div className="disc-head"><strong>Your member discounts · 会员优惠</strong><span>{Math.round(rate * 100)}% of {Math.round(opts.cap * 100)}% max</span></div>
                <div className="disc-meter"><span style={{ width: `${(rate / opts.cap) * 100}%` }} /></div>
                {opts.tier && (
                  <label className="disc-row">
                    <input type="checkbox" checked={useDisc.tier} onChange={(e) => setUseDisc((d) => ({ ...d, tier: e.target.checked }))} />
                    <span>{opts.tier.label}</span><b>{Math.round(opts.tier.rate * 100)}%</b>
                  </label>
                )}
                {opts.welcome && (
                  <label className="disc-row">
                    <input type="checkbox" checked={useDisc.welcome} onChange={(e) => setUseDisc((d) => ({ ...d, welcome: e.target.checked }))} />
                    <span>{opts.welcome.label}</span><b>{Math.round(opts.welcome.rate * 100)}%</b>
                  </label>
                )}
                {opts.vouchers.map((v) => {
                  const on = useDisc.vouchers.includes(v.id);
                  const wontFit = on && !usedIds.has(v.id);
                  return (
                    <label className={`disc-row ${wontFit ? "is-over" : ""}`} key={v.id}>
                      <input type="checkbox" checked={on} onChange={(e) => setUseDisc((d) => ({ ...d, vouchers: e.target.checked ? [...d.vouchers, v.id] : d.vouchers.filter((x) => x !== v.id) }))} />
                      <span>Voucher · {v.label}{wontFit ? " (over the 35% cap, saved for later)" : ""}</span><b>{Math.round(v.rate * 100)}%</b>
                    </label>
                  );
                })}
                {freeShip && !isPickup && <p className="disc-note">🚚 Free delivery with your {tier?.en} membership</p>}
                <p className="disc-note">Untick anything you&apos;d like to save for another order.</p>
              </div>
            )}
            {disc > 0 && (
              <div className="summary-row member-disc"><span>Member discount −{Math.round(rate * 100)}%</span><span>−{priceStr(disc)}</span></div>
            )}
            <div className="summary-row total"><span>Total 总计</span><span>{priceStr(total)}</span></div>
            {error && <p className="form-err" role="alert">{error}</p>}
            {!ready && (
              <div className="todo" role="status">
                <strong>Almost ready ✨ just add:</strong>
                <ul>
                  {missing.map((k) => (
                    <li key={k}><button type="button" data-nofish="1" onClick={() => { setShowAll(true); goTo(k); }}>{FIELD_LABEL[k]}</button></li>
                  ))}
                </ul>
              </div>
            )}
            <Btn className={!ready ? "is-incomplete" : ""} disabled={isProcessing || cart.length === 0} onClick={onPay} aria-describedby={!ready ? "pay-hint" : undefined}>
              {isProcessing ? "Redirecting..." : ready ? `Pay ${priceStr(total)} · 付款` : `Continue · 继续`}
            </Btn>
            {!ready && <p className="pay-hint" id="pay-hint">We&apos;ll take you to anything still to fill in.</p>}
            {!member && (
              <p className="summary-hint member-hint">
                <Link href="/club" data-nofish="1">Join the JoyJar Club</Link> free: 5% off your first order, plus up to 35% off with tiers and missions.
              </p>
            )}
            <p className="summary-secure">🔒 Secure Checkout by HitPay</p>
          </aside>
        </div>
      </div>
      {swimming && <div className="swim-veil" />}
    </div>
  );
}
