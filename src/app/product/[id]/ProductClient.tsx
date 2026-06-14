"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout/Shared";
import { Label, Btn, QtyStepper } from "@/components/ui/components";
import { Jar } from "@/components/ui/Jars";
import { GiftBox3D } from "@/components/ui/GiftBox3D";
import { OPTION_GROUPS, OPTION_ORDER, optionDefaults, TONES } from "@/lib/constants";
import { useCartStore } from "@/store/cartStore";
import { priceStr } from "@/components/ui/ShopBlocks";

export function ProductClient({ initialProduct, initialBundle, products, bundles }: any) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addToCart);

  const boxB = bundles.find((b: any) => b.qty > 1) || { id: "jar-6", price: 68, qty: 6 };
  const singleB = bundles.find((b: any) => b.qty === 1) || { id: "jar-1", price: 15.8, qty: 1 };
  const target = boxB.qty || 6;
  const swatch = (p: any) => (TONES[p.tone] || {}).swatch || "#cdd9b4";

  const PACKS = [
    { id: "box-all", title: "Box of Six", sub: "All 6 Flavours", titleZh: "全六味", price: boxB.price },
    { id: "box-mix", title: "Box of Six", sub: "Mix & Match", titleZh: "自選搭配", price: boxB.price },
    { id: "single", title: "Single Jar", sub: "One flavour", titleZh: "單瓶", price: singleB.price }
  ];

  const initMode = initialBundle && initialBundle.qty > 1 ? "box-all" : "single";
  const [packMode, setPackMode] = useState(initMode);
  const [pid, setPid] = useState(initialProduct.id);
  const [qty, setQty] = useState(1);
  const [opts, setOpts] = useState(() => ({ milk: OPTION_GROUPS.milk.def, ...optionDefaults(initialProduct) }));
  const [mix, setMix] = useState<Record<string, number>>({});

  const live = products.find((x: any) => x.id === pid) || initialProduct;
  
  // Need to parse the JSON strings for notes and options from Prisma
  const liveNotes = typeof live.notes === "string" ? JSON.parse(live.notes) : live.notes;
  const liveNotesZh = typeof live.notesZh === "string" ? JSON.parse(live.notesZh) : live.notesZh;
  const liveOptions = typeof live.options === "string" ? JSON.parse(live.options) : live.options;

  useEffect(() => {
    setOpts(optionDefaults({ ...live, options: liveOptions }));
  }, [pid]);

  const mixTotal = products.reduce((s: number, p: any) => s + (mix[p.id] || 0), 0);
  const isBox = packMode !== "single";
  const optKeys = isBox ?
    OPTION_ORDER.filter((k) => k === "sweet" || k === "temp" || k === "milk") :
    OPTION_ORDER.filter((k) => liveOptions && liveOptions[k]);

  // build gift-box slots
  let slots: any = null;
  if (packMode === "box-all") {
    slots = products.slice(0, target).map((p: any) => ({ tone: p.tone, key: p.id }));
    while (slots.length < target) slots.push(null);
  } else if (packMode === "box-mix") {
    const picked: any[] = [];
    products.forEach((p: any) => { for (let i = 0; i < (mix[p.id] || 0); i++) picked.push({ tone: p.tone, key: p.id + "-" + i }); });
    slots = [];
    for (let i = 0; i < target; i++) slots.push(picked[i] || null);
  }

  const price = packMode === "single" ? singleB.price * qty : boxB.price;
  const canAdd = packMode === "single" ? true : packMode === "box-all" ? true : mixTotal === target;
  const remaining = target - mixTotal;

  const inc = (id: string) => setMix((m) => mixTotal >= target ? m : { ...m, [id]: (m[id] || 0) + 1 });
  const dec = (id: string) => setMix((m) => ({ ...m, [id]: Math.max(0, (m[id] || 0) - 1) }));

  const doAdd = () => {
    if (packMode === "single") {
      addToCart({ productId: live.id, bundleId: singleB.id, qty, options: opts, box: false });
    } else {
      const boxOpts = { sweet: opts.sweet, temp: opts.temp, milk: opts.milk };
      const contents: any[] = [];
      if (packMode === "box-all") {
        products.slice(0, target).forEach((p: any) => contents.push({ productId: p.id }));
      } else {
        products.forEach((p: any) => { for (let i = 0; i < (mix[p.id] || 0); i++) contents.push({ productId: p.id }); });
      }
      addToCart({ box: true, mode: packMode === "box-all" ? "all" : "mix", bundleId: boxB.id, qty: 1, options: boxOpts, contents });
    }
    router.push("/cart");
  };

  return (
    <div className="screen product-screen">
      <Header />
      <div className="wrap pdp">
        <button className="back-link" data-nofish="1" onClick={() => router.back()} style={{ padding: "8px 0px 8px 8px" }}>← Back · 返回</button>
        <div className="pdp-grid">
          <div className={`pdp-art ${isBox ? "pdp-art-box" : ""}`}>
            {packMode === "single" ?
              <React.Fragment>
                <div className="hero-halo" />
                <Jar tone={live.tone} size={1.4} floating label="小膠傲" labelEn={live.cap} />
              </React.Fragment> :
              <GiftBox3D slots={slots} fill={packMode === "box-mix"} />
            }
          </div>
          <div className="pdp-info">
            <Label zh="花膠甜品">Fish Maw Dessert</Label>
            {packMode === "single" ?
              <React.Fragment>
                <h1 className="pdp-name">{live.name}</h1>
                <p className="pdp-zh">{live.nameZh}</p>
                <p className="pdp-blurb">{live.blurb}<br /><span className="pdp-blurb-zh">{live.blurbZh}</span></p>
              </React.Fragment> :
              <React.Fragment>
                <h1 className="pdp-name">The Wellness Box</h1>
                <p className="pdp-zh">小膠傲 · 六味花膠禮盒</p>
                <p className="pdp-blurb">
                  Six collagen-rich jars, gift-ready with free delivery.{" "}
                  {packMode === "box-mix" ? "Pick any six — mix and match your favourites." : "One of every flavour, beautifully boxed."}
                </p>
              </React.Fragment>
            }

            {/* PACK — first */}
            <div className="opt-group">
              <span className="opt-label">Pack · 規格</span>
              <div className="opt-row pack-row">
                {PACKS.map((pk) =>
                  <button key={pk.id} data-nofish="1"
                    className={`chip chip-pack ${packMode === pk.id ? "is-on" : ""}`}
                    onClick={() => setPackMode(pk.id)}>
                    <span className="pack-title">{pk.title}</span>
                    <small className="pack-sub">{pk.sub}</small>
                    <small className="pack-price">{priceStr(pk.price)}</small>
                  </button>
                )}
              </div>
            </div>

            {/* FLAVOUR — adapts to pack */}
            {packMode === "single" &&
              <div className="opt-group">
                <span className="opt-label">Flavour · 風味</span>
                <div className="opt-row opt-row-wrap">
                  {products.map((x: any) =>
                    <button key={x.id} data-nofish="1"
                      className={`chip ${pid === x.id ? "is-on" : ""}`}
                      onClick={() => setPid(x.id)}>
                      {x.flavorEn}<small>{x.flavorZh}</small>
                    </button>
                  )}
                </div>
              </div>
            }

            {packMode === "box-all" &&
              <div className="opt-group">
                <span className="opt-label">Includes · 包含 <em className="opt-sub">one of each</em></span>
                <div className="flavor-pills">
                  {products.map((x: any) =>
                    <span className="flavor-pill" key={x.id}>
                      <i className="pill-dot" style={{ background: swatch(x) }} />{x.flavorEn}<b>×1</b>
                    </span>
                  )}
                </div>
              </div>
            }

            {packMode === "box-mix" &&
              <div className="opt-group">
                <div className="mix-head">
                  <span className="opt-label">Choose six · 自選六瓶</span>
                  <span className={`mix-count ${mixTotal === target ? "is-done" : ""}`}>{mixTotal} / {target}</span>
                </div>
                <div className="mix-list">
                  {products.map((x: any) => {
                    const c = mix[x.id] || 0;
                    return (
                      <div className={`mix-row ${c > 0 ? "is-picked" : ""}`} key={x.id}>
                        <i className="mix-swatch" style={{ background: swatch(x) }} />
                        <div className="mix-name"><strong>{x.flavorEn}</strong><small>{x.flavorZh}</small></div>
                        <div className="mix-stepper">
                          <button className="mix-btn" data-nofish="1" onClick={() => dec(x.id)} disabled={c === 0} aria-label={"Remove " + x.flavorEn}>−</button>
                          <span className="mix-qty">{c}</span>
                          <button className="mix-btn mix-btn-add" data-fish="1" onClick={() => inc(x.id)} disabled={mixTotal >= target} aria-label={"Add " + x.flavorEn}>+</button>
                        </div>
                      </div>);
                  })}
                </div>
              </div>
            }

            {/* OPTIONS */}
            {optKeys.map((k) => {
              const g = OPTION_GROUPS[k];
              return (
                <div className="opt-group" key={k}>
                  <span className="opt-label">{g.label} · {g.labelZh}{isBox ? <em className="opt-sub">whole box</em> : null}</span>
                  <div className="opt-row">
                    {g.choices.map((ch: any) =>
                      <button key={ch.id} data-nofish="1"
                        className={`chip ${opts[k as keyof typeof opts] === ch.id ? "is-on" : ""}`}
                        onClick={() => setOpts((o: any) => ({ ...o, [k]: ch.id }))}>
                        {ch.label}<small>{ch.zh}</small>
                      </button>
                    )}
                  </div>
                </div>);
            })}

            {/* QUANTITY (single only) */}
            {packMode === "single" ?
              <div className="opt-group">
                <span className="opt-label">Quantity · 數量</span>
                <QtyStepper value={qty} onChange={setQty} />
              </div> :
              <p className="box-note">1 gift box · {target} jars · free delivery 免運</p>
            }

            <div className="pdp-buy">
              <span className="pdp-total">{priceStr(price)}</span>
              <Btn disabled={!canAdd} onClick={doAdd}>
                {packMode === "box-mix" && mixTotal < target ?
                  `Pick ${remaining} more · 還差 ${remaining}` :
                  "Add to cart · 加入購物籃"}
              </Btn>
            </div>

            {packMode === "single" && Array.isArray(liveNotes) &&
              <ul className="pdp-notes">
                {liveNotes.map((n: string, i: number) => <li key={i}><span>{n}</span><em>{liveNotesZh[i]}</em></li>)}
              </ul>
            }
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
