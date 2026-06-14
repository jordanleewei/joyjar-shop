"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout/Shared";
import { Label, Btn, QtyStepper } from "@/components/ui/components";
import { Jar } from "@/components/ui/Jars";
import { OPTION_GROUPS, OPTION_ORDER, optionSummary } from "@/lib/constants";
import { useCartStore } from "@/store/cartStore";
import { priceStr } from "@/components/ui/ShopBlocks";
import { lineFor, boxSummary, boxTitle, cartSubtotal, deliveryFee } from "@/lib/cartUtils";

function BoxThumb({ contents, products }: any) {
  const allJars = (contents || []).map((c: any, i: number) => {
    const p = products.find((x: any) => x.id === c.productId);
    return { tone: p ? p.tone : "matcha", key: c.productId + "-" + i };
  });
  const top = allJars.slice(0, 3);
  const btm = allJars.slice(3, 6);
  return (
    <div className="box-thumb-2">
      <div className="btr btr-back">{top.map((j: any) => <Jar key={j.key} tone={j.tone} size={0.22} label="" labelEn="" />)}</div>
      {btm.length > 0 && <div className="btr btr-front">{btm.map((j: any) => <Jar key={j.key} tone={j.tone} size={0.22} label="" labelEn="" />)}</div>}
    </div>
  );
}

function CartImage({ it, p, products }: any) {
  return (
    <div className="cart-line-jar cart-image">
      {it.box
        ? <BoxThumb contents={it.contents} products={products} />
        : <Jar tone={p ? p.tone : "matcha"} size={0.5} label="小膠傲" labelEn={p ? p.cap : "JOYJAR"} />}
    </div>
  );
}

function OptionTags({ options }: any) {
  const tags = OPTION_ORDER.filter((k) => options && options[k]).map((k) => {
    const g = OPTION_GROUPS[k];
    const ch = g ? g.choices.find((c: any) => c.id === options[k]) : null;
    return ch ? { key: k, label: ch.label, zh: ch.zh } : null;
  }).filter(Boolean);
  if (!tags.length) return null;
  return (
    <div className="cart-opt-tags" style={{ margin: "6px 0px" }}>
      {tags.map((t: any) =>
        <span className="cart-opt-tag" key={t.key} style={{ borderRadius: "999px" }}><b>{t.label}</b> {t.zh}</span>
      )}
    </div>
  );
}

function CartLineDesc({ b, p, options }: any) {
  return (
    <React.Fragment>
      <p className="cart-line-sub">{b ? b.title : ""}{p ? " · " + p.nameZh : ""}</p>
      <OptionTags options={options} />
    </React.Fragment>
  );
}

export function CartClient({ products, bundles, deliveryConfig }: any) {
  const router = useRouter();
  const { cart, updateQty, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sub = cartSubtotal(cart, products, bundles);
  const ship = deliveryFee(cart, null, deliveryConfig, products, bundles);

  return (
    <div className="screen cart-screen">
      <Header />
      <div className="wrap cart-wrap">
        <div className="section-head" style={{ padding: "0px", margin: "0px 0px 40px 8px" }}>
          <div style={{ display: "flex", textAlign: "right", height: "20px", flexDirection: "row", alignItems: "baseline", gap: "7px" }}>
            <button className="back-link" data-nofish="1" onClick={() => router.back()} style={{ padding: "0", margin: "0", lineHeight: 1 }}>←</button>
            <Label zh="購物籃">Your Cart</Label>
          </div>
          <h1 className="section-title" style={{ padding: "4px 0px 0px" }}>Ready when you are</h1>
        </div>
        
        {cart.length === 0 ? (
          <div className="empty">
            <p className="empty-zh">購物籃是空的</p>
            <p className="empty-en">Your cart is empty.</p>
            <Btn onClick={() => router.push("/")}>Shop the jars · 選購</Btn>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-lines" style={{ padding: "0px 0px 0px 8px", gap: "8px" }}>
              {cart.map((it, i) => {
                const L = lineFor(it, products, bundles);
                if (it.box) {
                  const summ = boxSummary(it.contents || [], products);
                  return (
                    <div className="cart-line cart-line-box" key={i}>
                      <CartImage it={it} products={products} />
                      <div className="cart-line-info" style={{ margin: "0px 0px 0px 8px" }}>
                        <h4>{boxTitle(it, "en")}</h4>
                        <p className="cart-contents">{summ.map((s) => s.count + "× " + s.name).join(" · ")}</p>
                        <OptionTags options={it.options} />
                        <div className="cart-line-foot">
                          <QtyStepper value={it.qty} onChange={(v) => updateQty(i, v)} />
                          <button className="remove" data-nofish="1" onClick={() => removeItem(i)}>Remove · 移除</button>
                        </div>
                      </div>
                      <div className="cart-line-price">{priceStr(L.total)}</div>
                    </div>
                  );
                }
                const { p, b } = L;
                return (
                  <div className="cart-line" key={i} style={{ margin: "0px" }}>
                    <CartImage it={it} p={p} />
                    <div className="cart-line-info">
                      <h4>{p ? p.flavorEn : "Item"}</h4>
                      <CartLineDesc b={b} p={p} options={it.options} />
                      <div className="cart-line-foot">
                        <QtyStepper value={it.qty} onChange={(v) => updateQty(i, v)} />
                        <button className="remove" data-nofish="1" onClick={() => removeItem(i)}>Remove · 移除</button>
                      </div>
                    </div>
                    <div className="cart-line-price">{priceStr((b ? b.price : 0) * it.qty)}</div>
                  </div>
                );
              })}
            </div>
            
            <aside className="summary">
              <h3 className="summary-title">Order summary · 摘要</h3>
              <div className="summary-row"><span>Subtotal 小計</span><span>{priceStr(sub)}</span></div>
              <div className="summary-row"><span>Delivery 運費</span><span>{ship === 0 ? "Free 免費" : priceStr(ship)}</span></div>
              {ship > 0 && <p className="summary-hint">Spend {priceStr((deliveryConfig?.freeThreshold || 50) - sub)} more for free delivery · 再加可享免運</p>}
              <div className="summary-row total"><span>Total 總計</span><span>{priceStr(sub + ship)}</span></div>
              <Btn onClick={() => router.push("/checkout")}>Checkout · 結帳</Btn>
              <button className="link-quiet" data-nofish="1" onClick={() => router.push("/")}>← Continue shopping</button>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
