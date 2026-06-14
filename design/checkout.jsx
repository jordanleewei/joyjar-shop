// checkout.jsx — Cart, Checkout, Confirmation screens. Exported to window.
const { useState: useStateCk } = React;

function lineFor(item) {
  const bundles = window.BUNDLES || [];
  if (item.box) {
    const b = bundles.find((x) => x.id === item.bundleId) || bundles.find((x) => x.qty > 1) || { price: 0 };
    return { box: true, b, total: (b.price || 0) * item.qty };
  }
  const p = (window.PRODUCTS || []).find((x) => x.id === item.productId);
  const b = bundles.find((x) => x.id === item.bundleId);
  const price = b ? b.price : 0;
  return { p, b, total: price * item.qty };
}
function boxSummary(contents) {
  const map = {};
  (contents || []).forEach((c) => {map[c.productId] = (map[c.productId] || 0) + 1;});
  return Object.keys(map).map((pid) => {
    const p = (window.PRODUCTS || []).find((x) => x.id === pid);
    return { count: map[pid], name: p ? p.flavorEn : pid, tone: p ? p.tone : "matcha" };
  });
}
function boxTitle(item, lang) {
  if (lang === "zh") return item.mode === "all" ? "六味禮盒 · 全六味" : "六味禮盒 · 自選";
  return item.mode === "all" ? "Wellness Box · All Flavours" : "Wellness Box · Mix & Match";
}
function BoxThumb({ contents }) {
  const allJars = (contents || []).map((c, i) => {
    const p = (window.PRODUCTS || []).find((x) => x.id === c.productId);
    return { tone: p ? p.tone : "matcha", key: c.productId + "-" + i };
  });
  const top = allJars.slice(0, 3);
  const btm = allJars.slice(3, 6);
  return (
    <div className="box-thumb-2">
      <div className="btr btr-back">{top.map((j) => <Jar key={j.key} tone={j.tone} size={0.22} label="" labelEn="" />)}</div>
      {btm.length > 0 && <div className="btr btr-front">{btm.map((j) => <Jar key={j.key} tone={j.tone} size={0.22} label="" labelEn="" />)}</div>}
    </div>);

}
// Unified cart-line image — renders either the gift-box thumbnail or a single jar
// inside the same wrapper, so both cart-line variants share one image component.
function CartImage({ it, p }) {
  return (
    <div className="cart-line-jar cart-image">
      {it.box
        ? <BoxThumb contents={it.contents} />
        : <Jar tone={p ? p.tone : "matcha"} size={0.5} label="小膠傲" labelEn={p ? p.cap : "JOYJAR"} />}
    </div>);

}
function cartSubtotal(cart) {
  return cart.reduce((s, it) => s + lineFor(it).total, 0);
}
function deliveryFee(cart, zone) {
  if (!cart.length) return 0;
  const D = window.DELIVERY || {};
  if (cartSubtotal(cart) >= (D.freeThreshold || 50)) return 0;
  if (zone && zone.fee != null) return Number(zone.fee);
  return Number(D.baseFee || 6);
}

function OptionTags({ options }) {
  const OPTION_GROUPS = window.OPTION_GROUPS || {};
  const OPTION_ORDER = window.OPTION_ORDER || [];
  const tags = OPTION_ORDER.filter((k) => options && options[k]).map((k) => {
    const g = OPTION_GROUPS[k];
    const ch = g ? g.choices.find((c) => c.id === options[k]) : null;
    return ch ? { key: k, label: ch.label, zh: ch.zh } : null;
  }).filter(Boolean);
  if (!tags.length) return null;
  return (
    <div className="cart-opt-tags" style={{ margin: "6px 0px" }}>
      {tags.map((t) =>
      <span className="cart-opt-tag" key={t.key} style={{ borderRadius: "999px" }}><b>{t.label}</b> {t.zh}</span>
      )}
    </div>);

}

function CartLineDesc({ b, p, options }) {
  return (
    <React.Fragment>
      <p className="cart-line-sub">{b ? b.title : ""}{p ? " · " + p.nameZh : ""}</p>
      <OptionTags options={options} />
    </React.Fragment>);

}

function CartScreen({ cart, cartCount, onHome, onCart, onQty, onRemove, onCheckout, onShop, onBrowse }) {
  const D = window.DELIVERY || {};
  const sub = cartSubtotal(cart);
  const ship = deliveryFee(cart);
  return (
    <div className="screen cart-screen">
      <Header cartCount={cartCount} onHome={onHome} onCart={onCart} />
      <div className="wrap cart-wrap">
        <div className="section-head" style={{ padding: "0px", margin: "0px 0px 40px 8px" }}>
          <div style={{ display: "flex", textAlign: "right", height: "20px", flexDirection: "row", alignItems: "baseline", gap: "7px" }}>
            <button className="back-link" data-nofish="1" onClick={onShop} style={{ padding: "0", margin: "0", lineHeight: 1 }}>←</button>
            <Label zh="購物籃">Your Cart</Label>
          </div>
          <h1 className="section-title" style={{ padding: "4px 0px 0px" }}>Ready when you are</h1>
        </div>
        {cart.length === 0 ?
        <div className="empty">
            <p className="empty-zh">購物籃是空的</p>
            <p className="empty-en">Your cart is empty.</p>
            <Btn onClick={onBrowse || onShop}>Shop the jars · 選購</Btn>
          </div> :

        <div className="cart-grid">
            <div className="cart-lines" style={{ padding: "0px 0px 0px 8px", gap: "8px" }}>
              {cart.map((it, i) => {
              const L = lineFor(it);
              if (it.box) {
                const summ = boxSummary(it.contents);
                const optSumm = optionSummary(it.options, "en");
                return (
                  <div className="cart-line cart-line-box" key={i}>
                      <CartImage it={it} />
                      <div className="cart-line-info" style={{ margin: "0px 0px 0px 8px" }}>
                        <h4>{boxTitle(it, "en")}</h4>
                        <p className="cart-contents">{summ.map((s) => s.count + "× " + s.name).join(" · ")}</p>
                        <OptionTags options={it.options} />
                        <div className="cart-line-foot">
                          <QtyStepper value={it.qty} onChange={(v) => onQty(i, v)} />
                          <button className="remove" data-nofish="1" onClick={() => onRemove(i)}>Remove · 移除</button>
                        </div>
                      </div>
                      <div className="cart-line-price">{priceStr(L.total)}</div>
                    </div>);

              }
              const { p, b } = L;
              return (
                <div className="cart-line" key={i} style={{ margin: "0px" }}>
                    <CartImage it={it} p={p} />
                    <div className="cart-line-info">
                      <h4>{p ? p.flavorEn : "Item"}</h4>
                      <CartLineDesc b={b} p={p} options={it.options} />
                      <div className="cart-line-foot">
                        <QtyStepper value={it.qty} onChange={(v) => onQty(i, v)} />
                        <button className="remove" data-nofish="1" onClick={() => onRemove(i)}>Remove · 移除</button>
                      </div>
                    </div>
                    <div className="cart-line-price">{priceStr((b ? b.price : 0) * it.qty)}</div>
                  </div>);

            })}
            </div>
            <aside className="summary">
              <h3 className="summary-title">Order summary · 摘要</h3>
              <div className="summary-row"><span>Subtotal 小計</span><span>{priceStr(sub)}</span></div>
              <div className="summary-row"><span>Delivery 運費</span><span>{ship === 0 ? "Free 免費" : priceStr(ship)}</span></div>
              {ship > 0 && <p className="summary-hint">Spend {priceStr((D.freeThreshold || 50) - sub)} more for free delivery · 再加可享免運</p>}
              <div className="summary-row total"><span>Total 總計</span><span>{priceStr(sub + ship)}</span></div>
              <Btn onClick={onCheckout}>Checkout · 結帳</Btn>
              <button className="link-quiet" data-nofish="1" onClick={onShop}>← Continue shopping</button>
            </aside>
          </div>
        }
      </div>
      <Footer />
    </div>);

}

function Field({ label, zh, value, onChange, placeholder, type = "text", wide }) {
  return (
    <label className={`field ${wide ? "field-wide" : ""}`}>
      <span className="field-label">{label} <em>{zh}</em></span>
      <input type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} />
    </label>);

}

function CheckoutScreen({ cart, cartCount, checkoutMode, onHome, onCart, onBack, onPlace }) {
  const D = window.DELIVERY || {};
  const slots = D.slots || [];
  const zones = D.zones || [];
  const [form, setForm] = useStateCk({ name: "", phone: "", email: "", addr: "", unit: "", postal: "", note: "" });
  const [slot, setSlot] = useStateCk(slots[0] || "");
  const [zoneId, setZoneId] = useStateCk((zones[0] || {}).id);
  const [pay, setPay] = useStateCk("card");
  const [card, setCard] = useStateCk({ num: "", exp: "", cvc: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const zone = zones.find((z) => z.id === zoneId);
  const sub = cartSubtotal(cart),ship = deliveryFee(cart, zone);
  const ready = form.name && form.phone && form.addr && (pay === "paynow" || card.num && card.exp && card.cvc);

  const Steps =
  <div className="ck-steps">
      <span className="ck-step is-on">1 · Cart</span>
      <span className="ck-step is-cur">2 · Checkout</span>
      <span className="ck-step">3 · Done</span>
    </div>;


  const PaymentCard =
  <div className="pay-body">
      {pay === "card" &&
    <div className="card-fields">
          <div className="stripe-badge">Secured by <strong>Stripe</strong></div>
          <Field label="Card number" zh="卡號" value={card.num} placeholder="4242 4242 4242 4242"
      onChange={(v) => setCard((c) => ({ ...c, num: v }))} wide />
          <div className="field-pair">
            <Field label="Expiry" zh="到期" value={card.exp} placeholder="MM / YY"
        onChange={(v) => setCard((c) => ({ ...c, exp: v }))} />
            <Field label="CVC" zh="安全碼" value={card.cvc} placeholder="123"
        onChange={(v) => setCard((c) => ({ ...c, cvc: v }))} />
          </div>
        </div>
    }
      {pay === "paynow" &&
    <div className="paynow-body">
          <div className="qr" aria-hidden="true">
            <div className="qr-grid">
              {Array.from({ length: 49 }).map((_, i) =>
          <span key={i} style={{ opacity: (i * 7 + i % 5 * 13) % 3 === 0 ? 1 : 0 }} />
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
    }
    </div>;


  return (
    <div className="screen checkout-screen">
      <Header cartCount={cartCount} onHome={onHome} onCart={onCart} />
      <div className="wrap ck-wrap">
        <button className="back-link" data-nofish="1" onClick={onBack}>← Back to cart · 返回</button>
        {Steps}
        <div className={`ck-grid ck-${checkoutMode}`}>
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
              {zones.length > 0 &&
              <React.Fragment>
                  <span className="opt-label">Area · 地區</span>
                  <div className="slot-row">
                    {zones.map((z) =>
                  <button key={z.id} data-nofish="1" className={`slot ${zoneId === z.id ? "is-on" : ""}`} onClick={() => setZoneId(z.id)}>
                        {z.name} · {z.nameZh}{sub < (D.freeThreshold || 50) ? ` · ${priceStr(z.fee)}` : ""}
                      </button>
                  )}
                  </div>
                </React.Fragment>
              }
              <span className="opt-label">Preferred window · 時段</span>
              <div className="slot-row">
                {slots.map((s) =>
                <button key={s} data-nofish="1" className={`slot ${slot === s ? "is-on" : ""}`} onClick={() => setSlot(s)}>{s}</button>
                )}
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
                const L = lineFor(it);
                if (it.box) {
                  const optSumm = optionSummary(it.options, "en");
                  return (
                    <div className="summary-item" key={i}>
                      <span>{it.qty}× {boxTitle(it, "en")}<em>{boxSummary(it.contents).map((s) => s.count + "× " + s.name).join(", ")}{optSumm ? " · " + optSumm : ""}</em></span>
                      <span>{priceStr(L.total)}</span>
                    </div>);

                }
                const { p, b } = L;
                const summ = optionSummary(it.options, "en");
                return (
                  <div className="summary-item" key={i}>
                    <span>{it.qty}× {p ? p.flavorEn : "Item"}<em>{b ? b.title : ""}{summ ? " · " + summ : ""}</em></span>
                    <span>{priceStr((b ? b.price : 0) * it.qty)}</span>
                  </div>);

              })}
            </div>
            <div className="summary-row"><span>Subtotal 小計</span><span>{priceStr(sub)}</span></div>
            <div className="summary-row"><span>Delivery 運費</span><span>{ship === 0 ? "Free 免費" : priceStr(ship)}</span></div>
            <div className="summary-row total"><span>Total 總計</span><span>{priceStr(sub + ship)}</span></div>
            <Btn disabled={!ready} onClick={() => ready && onPlace({ form, slot, zone, pay, total: sub + ship })}>
              {pay === "paynow" ? "I've paid · 完成付款" : `Pay ${priceStr(sub + ship)} · 付款`}
            </Btn>
            <p className="summary-secure">🔒 Encrypted · Stripe &amp; PayNow</p>
          </aside>
        </div>
      </div>
    </div>);

}

function ConfirmScreen({ order, onHome }) {
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
          <Btn onClick={onHome}>Back to shop · 回到首頁</Btn>
        </div>
      </div>
    </div>);

}

Object.assign(window, { CartScreen, CheckoutScreen, ConfirmScreen, cartSubtotal, deliveryFee });