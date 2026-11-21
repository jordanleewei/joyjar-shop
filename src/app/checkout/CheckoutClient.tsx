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
import Link from "next/link";
import { applyDiscount, maxBlocks, DiscountOptions, REDEEM_BLOCK, REDEEM_VALUE, pointsFor } from "@/lib/club";
import { REGIONS, regionFromPostal } from "@/lib/regions";
import { deliveryDates, dateParts, formatDate } from "@/lib/dates";


function Field({ id, label, zh, value, onChange, onBlur, placeholder, type = "text", wide, required, optional, error, inputMode, autoComplete, hint }: any) {
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
      {hint && !error && <span className="field-hint">{hint}</span>}
    </label>
  );
}

// What's still needed before paying (shown inline and in the summary)
function validate(form: any, region: string, date: string) {
  const e: Record<string, string> = {};
  const digits = (form.phone || "").replace(/\D/g, "");
  if (!form.name.trim()) e.name = "Add your name so we know who it's for.";
  if (!digits) e.phone = "Add a phone number so we can WhatsApp you about delivery.";
  else if (digits.length < 8) e.phone = "Looks like a digit or two is missing.";
  if (!form.email.trim()) e.email = "Add your email so we can send your order confirmation.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Just double-check this email.";
  if (!form.addr.trim()) e.addr = "Add your street and block number.";
  if (!/^\d{6}$/.test((form.postal || "").trim())) e.postal = form.postal.trim() ? "Singapore postal codes have 6 digits." : "Add your 6-digit postal code.";
  if (!region) e.region = "Pick the region you're in.";
  if (!date) e.date = "Pick a day for your delivery.";
  return e;
}
const FIELD_LABEL: Record<string, string> = { name: "Full name", phone: "Phone", email: "Email", addr: "Address", postal: "Postal code", region: "Region", date: "Delivery date" };
const FIELD_ORDER = ["name", "phone", "email", "addr", "postal", "region", "date"];
const VISIBLE_DATES = 5;

export function CheckoutClient({ products, bundles, deliveryConfig, member }: any) {
  const router = useRouter();
  const { cart, clearCart, prune } = useCartStore();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({ name: member?.name || "", phone: "", email: member?.email || "", addr: "", unit: "", postal: "", note: "" });
  const [region, setRegion] = useState("");
  const [regionPicked, setRegionPicked] = useState(false); // customer chose it themselves
  const [dates] = useState(() => deliveryDates());
  const [date, setDate] = useState("");
  const [dateOffset, setDateOffset] = useState(0);
  const [pay, setPay] = useState("paynow");
  const [swimming, setSwimming] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);
  // one discount per order: welcome 5% (first order) or points. The server re-checks.
  const [discKind, setDiscKind] = useState<"none" | "welcome" | "points">(() => member?.discounts?.welcome ? "welcome" : "none");
  const [blocks, setBlocks] = useState(1);

  useEffect(() => {
    prune(products.map((p: any) => p.id), bundles.map((b: any) => b.id));
    setMounted(true);
  }, []);
  
  const sub = cartSubtotal(cart, products, bundles);
  const opts: DiscountOptions | null = member?.discounts || null;
  const ship = deliveryFee(cart, null, deliveryConfig, products, bundles);
  const canBlocks = opts ? maxBlocks(opts.points, sub) : 0;
  const applied = applyDiscount(opts, { kind: discKind, blocks }, sub);
  const disc = applied.amount;
  const total = Math.round((sub - disc + ship) * 100) / 100;
  const earn = member ? pointsFor(sub - disc) : 0;

  if (!mounted) return null;

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setPostal = (v: string) => {
    setForm((f) => ({ ...f, postal: v }));
    const guess = regionFromPostal(v);
    if (guess && !regionPicked) setRegion(guess); // suggest; never override their own choice
  };
  const errors = validate(form, region, date);
  const missing = FIELD_ORDER.filter((k) => errors[k]);
  const ready = missing.length === 0;
  const err = (k: string) => (showAll || touched[k] ? errors[k] : undefined);
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));
  const contactDone = !errors.name && !errors.phone && !errors.email;
  const deliveryDone = !errors.addr && !errors.postal && !errors.region && !errors.date;
  const goTo = (k: string) => {
    const el = (k === "region" || k === "date" ? document.querySelector(`#f-${k} button:not(:disabled)`) : document.getElementById(`f-${k}`)) as HTMLInputElement | null;
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => el.focus({ preventScroll: true }), 350); }
  };
  const goSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const onPay = () => {
    if (!ready) { setShowAll(true); goTo(missing[0]); return; }
    placeOrder();
  };

  const placeOrder = async () => {
    setIsProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/create-hitpay-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, form, region, date, pay, discount: { kind: applied.kind, blocks } })
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
                <Field id="f-email" label="Email" zh="邮箱" value={form.email} onChange={set("email")} onBlur={blur("email")} placeholder="joyjar@email.com" type="email" wide required hint="For your order confirmation and delivery updates" error={err("email")} autoComplete="email" />
              </div>
            </section>

            <section className="ck-block" id="ck-delivery">
              <h3 className="ck-h"><span className={`ck-num ${deliveryDone ? "is-done" : ""}`}>{deliveryDone ? "✓" : "2"}</span>Delivery · 配送</h3>

              <p className="ck-sub">We deliver chilled, ourselves, all around Singapore. Pick a day and we&apos;ll WhatsApp you before we arrive.</p>
              <div className="field-grid">
                <Field id="f-addr" label="Address" zh="地址" value={form.addr} onChange={set("addr")} onBlur={blur("addr")} placeholder="Block 123, Joy Street 4" wide required error={err("addr")} autoComplete="street-address" />
                <Field id="f-unit" label="Unit" zh="单位" value={form.unit} onChange={set("unit")} placeholder="#12-34" optional />
                <Field id="f-postal" label="Postal code" zh="邮编" value={form.postal} onChange={setPostal} onBlur={blur("postal")} placeholder="123456" inputMode="numeric" required error={err("postal")} autoComplete="postal-code" />
              </div>
              <span className="opt-label">Region · 地区{region && !regionPicked && regionFromPostal(form.postal) === region ? <em className="opt-sub">picked from your postal code</em> : null}</span>
              <div className="region-grid" id="f-region" role="radiogroup" aria-label="Delivery region">
                {REGIONS.map((r) => (
                  <button key={r.id} type="button" role="radio" aria-checked={region === r.id} data-nofish="1"
                    className={`region ${region === r.id ? "is-on" : ""}`} onClick={() => { setRegion(r.id); setRegionPicked(true); }}>
                    <strong>{r.en} <span>{r.zh}</span></strong>
                    <small>{r.areas}</small>
                  </button>
                ))}
              </div>
              {err("region") && <span className="field-err">{errors.region}</span>}

              <span className="opt-label">Delivery date · 配送日期</span>
              <div className="date-picker-wrap" id="f-date">
                <button type="button" className="date-arrow" data-nofish="1" disabled={dateOffset === 0}
                  onClick={() => setDateOffset((o) => Math.max(0, o - VISIBLE_DATES))} aria-label="Earlier dates">‹</button>
                <div className="date-row" role="radiogroup" aria-label="Delivery date">
                  {dates.slice(dateOffset, dateOffset + VISIBLE_DATES).map((d) => {
                    const p = dateParts(d);
                    return (
                      <button key={d} type="button" role="radio" aria-checked={date === d} data-nofish="1"
                        className={`date-chip ${date === d ? "is-on" : ""}`} onClick={() => setDate(d)}>
                        <span className="date-day">{p.day}</span>
                        <span className="date-num">{p.date} {p.month}</span>
                        <small>{p.dayZh}</small>
                      </button>
                    );
                  })}
                </div>
                <button type="button" className="date-arrow" data-nofish="1" disabled={dateOffset + VISIBLE_DATES >= dates.length}
                  onClick={() => setDateOffset((o) => Math.min(dates.length - VISIBLE_DATES, o + VISIBLE_DATES))} aria-label="Later dates">›</button>
              </div>
              {err("date") && <span className="field-err">{errors.date}</span>}

              <Field id="f-note" label="Note for delivery" zh="备注" value={form.note} onChange={set("note")} placeholder="Gift message, buzzer code…" wide optional />
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
                    <span>{priceStr(L.total)}</span>
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
                <div className="review-head"><strong>Deliver to · 配送</strong><button type="button" className="review-edit" data-nofish="1" onClick={() => goSection("ck-delivery")}>Edit</button></div>
                <p className={errors.addr ? "review-empty" : ""}>{form.addr.trim() ? `${form.addr.trim()}${form.unit.trim() ? `, ${form.unit.trim()}` : ""}` : "Your address"}</p>
                <p className={errors.postal ? "review-empty" : ""}>{form.postal.trim() ? `Singapore ${form.postal.trim()}` : "Postal code"}</p>
                <p className={region ? "" : "review-empty"}>{region ? `${REGIONS.find((r) => r.id === region)?.en} region` : "Region"}</p>
                <p className={date ? "" : "review-empty"}>{date ? `Delivery on ${formatDate(date)}` : "Delivery date"}</p>
                {form.note.trim() && <p className="review-note">“{form.note.trim()}”</p>}
              </div>
              <div className="review-sec">
                <div className="review-head"><strong>Payment · 付款</strong><button type="button" className="review-edit" data-nofish="1" onClick={() => goSection("ck-payment")}>Edit</button></div>
                <p>{pay === "paynow" ? "PayNow" : "Card"} via HitPay</p>
              </div>
            </div>
            <div className="summary-row"><span>Subtotal 小计</span><span>{priceStr(sub)}</span></div>
            <div className="summary-row">
              <span>Delivery 运费</span>
              <span>{ship === 0 ? "Free 免费" : priceStr(ship)}</span>
            </div>
            {opts && (opts.welcome || opts.points > 0) && (
              <div className="disc-box">
                <div className="disc-head"><strong>Member savings · 会员优惠</strong><span>{opts.points} pts</span></div>
                <p className="disc-note">Choose one per order.</p>
                <label className="disc-row">
                  <input type="radio" name="disc" checked={discKind === "none"} onChange={() => setDiscKind("none")} />
                  <span>No discount this time</span><b></b>
                </label>
                {opts.welcome && (
                  <label className="disc-row">
                    <input type="radio" name="disc" checked={discKind === "welcome"} onChange={() => setDiscKind("welcome")} />
                    <span>{opts.welcome.label}</span><b>−{priceStr(Math.round(sub * opts.welcome.rate * 100) / 100)}</b>
                  </label>
                )}
                <label className={`disc-row ${canBlocks ? "" : "is-over"}`}>
                  <input type="radio" name="disc" disabled={!canBlocks} checked={discKind === "points"} onChange={() => setDiscKind("points")} />
                  <span>{canBlocks ? `Use points · ${REDEEM_BLOCK} pts = ${priceStr(REDEEM_VALUE)} off` : `Use points (${Math.max(0, REDEEM_BLOCK - opts.points)} more to unlock ${priceStr(REDEEM_VALUE)} off)`}</span>
                  <b>{discKind === "points" && applied.kind === "points" ? `−${priceStr(applied.amount)}` : ""}</b>
                </label>
                {discKind === "points" && canBlocks > 1 && (
                  <div className="pts-stepper">
                    <button type="button" data-nofish="1" onClick={() => setBlocks((b) => Math.max(1, Math.min(canBlocks, b) - 1))} disabled={blocks <= 1} aria-label="Use fewer points">−</button>
                    <span>{Math.min(blocks, canBlocks) * REDEEM_BLOCK} pts · −{priceStr(Math.min(blocks, canBlocks) * REDEEM_VALUE)}</span>
                    <button type="button" data-nofish="1" onClick={() => setBlocks((b) => Math.min(canBlocks, b + 1))} disabled={blocks >= canBlocks} aria-label="Use more points">+</button>
                  </div>
                )}
              </div>
            )}
            {disc > 0 && (
              <div className="summary-row member-disc"><span>{applied.kind === "points" ? `Points (${applied.pointsUsed})` : "Welcome 5%"}</span><span>−{priceStr(disc)}</span></div>
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
            {member ? (
              earn > 0 && <p className="summary-hint member-hint">You&apos;ll earn <strong>{earn} points</strong> with this order ✨</p>
            ) : (
              <p className="summary-hint member-hint">
                <Link href="/club" data-nofish="1">Join the JoyJar Club</Link> free: 5% off your first order, and 1 point for every $1.
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
