// shop.jsx — Shop landing + Product detail screens. Exported to window.
const { useState: useStateShop, useEffect: useEffectShop } = React;

function priceStr(n) {
  return "$" + (Number.isInteger(n) ? n : Number(n).toFixed(2));
}

function Header({ cartCount, onHome, onCart }) {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Logo onClick={onHome} />
        <button className="cart-btn" data-nofish="1" onClick={onCart} aria-label="View cart">
          <span className="cart-zh">購物籃</span>
          <span className="cart-en">Cart</span>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>
    </header>);

}

function Hero({ heroLayout, onShop, onGift }) {
  const bundles = window.BUNDLES || [];
  const D = window.DELIVERY || {};
  const six = bundles.find((b) => b.qty > 1) || bundles[0] || { price: 68 };
  const one = bundles.find((b) => b.qty === 1) || bundles[0] || { price: 15.8 };
  return (
    <section className={`hero hero-${heroLayout}`}>
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <Label zh="花膠 · 甜品">Fish Maw Dessert, in a Jar</Label>
          <h1 className="hero-title">
            Collagen of the<br /><em>Eight Treasures</em>,<br />gently stewed.
          </h1>
          <p className="hero-zh">小膠傲 · 六款花膠甜品 · 瓶中心意</p>
          <p className="hero-lede">
            Six recipes — matcha, black sesame, red date, ginseng, coconut and osmanthus —
            slow-stewed with collagen-rich fish maw. A beauty ritual sealed in a jar.
          </p>
          <div className="hero-cta">
            <Btn onClick={onShop}>Shop the Jars · 選購</Btn>
            <Btn variant="ghost" onClick={onGift}>Gifting · 送禮</Btn>
          </div>
          <div className="hero-meta">
            <span><strong>{priceStr(six.price)}</strong> / box of 6</span>
            <span className="dot">·</span>
            <span>{priceStr(one.price)} / single jar</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-halo" />
          <Jar tone="matcha" size={1.15} floating label="小膠傲" labelEn="MATCHA" />
          <Jar tone="sesame" size={0.82} floating label="小膠傲" labelEn="SESAME" />
        </div>
      </div>
    </section>);

}

function BundleCard({ b, onChoose }) {
  const D = window.DELIVERY || {};
  const free = b.price >= (D.freeThreshold || 50);
  return (
    <div className={`bundle-card ${b.featured ? "is-featured" : ""}`}>
      {b.featured && <span className="ribbon">最超值 · Best Value</span>}
      <div className="bundle-top">
        <span className="bundle-zh">{b.titleZh}</span>
        <h3 className="bundle-title">{b.title}</h3>
      </div>
      <div className="bundle-price">
        <span className="bundle-amt">{priceStr(b.price)}</span>
        <span className="bundle-unit">/ {b.qty} {b.qty > 1 ? "jars" : "jar"}</span>
      </div>
      <p className="bundle-note">{b.note}</p>
      <p className="bundle-ship">{free ?
        "Free delivery 免運費" :
        `+ ${priceStr(D.baseFee || 6)} delivery · free over ${priceStr(D.freeThreshold || 50)}`}</p>
      <Btn variant={b.featured ? "primary" : "ghost"} onClick={() => onChoose(b)}>Choose · 選擇</Btn>
    </div>);

}

function FlavorCard({ p, onView }) {
  return (
    <button className="flavor-card" data-nofish="1" onClick={() => onView(p)}>
      <div className="flavor-jar"><Jar tone={p.tone} size={0.72} label="小膠傲" labelEn={p.cap} /></div>
      <div className="flavor-body">
        <h3 className="flavor-name">{p.flavorEn}</h3>
        <p className="flavor-zh">{p.flavorZh}</p>
        <p className="flavor-blurb">{p.blurb}</p>
        <span className="flavor-cta">View jar · 查看 →</span>
      </div>
    </button>);

}

function Benefits() {
  return (
    <section className="benefits" id="benefits">
      <div className="wrap">
        <div className="section-head">
          <Label zh="海八珍">The Eight Treasures of the Sea</Label>
          <h2 className="section-title">Why fish maw, four ways</h2>
          <p className="section-lede">
            Fish maw — dried fish bladder — is prized among the sea's eight treasures for its
            high-grade collagen, vitamins, and trace calcium and zinc.
          </p>
        </div>
        <div className="benefit-grid">
          {BENEFITS.map((b, i) =>
          <div className="benefit-card" key={i}>
              <span className="benefit-num">{String(i + 1).padStart(2, "0")}</span>
              <h4 className="benefit-zh">{b.zh}</h4>
              <p className="benefit-en-title">{b.en}</p>
              <p className="benefit-body">{b.body}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}

function GiftBlock({ onShop, onGiftBox }) {
  return (
    <section className="gift" id="gift">
      <div className="wrap gift-inner">
        <div className="gift-art">
          <WellnessGiftBox />
        </div>
        <div className="gift-copy">
          <Label zh="送禮 · 心意">A Gift of Wellness</Label>
          <h2 className="section-title">Sealed with intention, ready to give.</h2>
          <p className="section-lede">
            A box of six arrives gift-ready with free delivery — a considered gesture for the
            women in your life who treasure beauty and care, and for partners gifting on their behalf.
          </p>
          <Btn onClick={onGiftBox || onShop}>Send a box · 送出禮盒</Btn>
        </div>
      </div>
    </section>);

}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <Logo compact />
        <p className="footer-zh">小膠傲 · JoyJar — 花膠甜品，瓶中心意</p>
        <p className="footer-fine">Self-delivered with care · Stripe &amp; PayNow accepted</p>
        <button className="manage-link" data-nofish="1" onClick={() => window.__goAdmin && window.__goAdmin()}>
          店主管理 · Shopkeeper
        </button>
      </div>
    </footer>);

}

function ShopScreen({ heroLayout, cartCount, onHome, onCart, onView, onChooseBundle, gotoSection }) {
  const products = (window.PRODUCTS || []).filter((p) => p.available);
  const bundles = window.BUNDLES || [];
  return (
    <div className="screen shop-screen">
      <Header cartCount={cartCount} onHome={onHome} onCart={onCart} />
      <Hero heroLayout={heroLayout} onShop={() => gotoSection("bundles")} onGift={() => gotoSection("gift")} />
      <Wave className="wave-sep" />
      <section className="bundles" id="bundles">
        <div className="wrap">
          <div className="section-head center">
            <Label zh="選購方案">Choose Your Jars</Label>
            <h2 className="section-title">Two ways to begin</h2>
          </div>
          <div className="bundle-grid">
            {[...bundles].sort((a, b) => b.qty - a.qty).map((b) => <BundleCard key={b.id} b={b} onChoose={onChooseBundle} />)}
          </div>
        </div>
      </section>
      <section className="products" id="products">
        <div className="wrap">
          <div className="section-head center">
            <Label zh="六款風味">Six Flavours</Label>
            <h2 className="section-title">Choose your stew</h2>
            <p className="section-lede">Every jar can be made with sugar or none, served hot or cold.</p>
          </div>
          <div className="flavor-grid">
            {products.map((p) => <FlavorCard key={p.id} p={p} onView={onView} />)}
          </div>
        </div>
      </section>
      <Wave className="wave-sep" />
      <Benefits />
      <GiftBlock onShop={() => gotoSection("products")} onGiftBox={() => onChooseBundle && onChooseBundle((window.BUNDLES || []).find((b) => b.qty > 1) || {})} />
      <Footer />
    </div>);

}

function ProductScreen({ product, cartCount, onHome, onCart, onBack, onAdd, initialPackMode, initialFlavourId, restore }) {
  const products = (window.PRODUCTS || []).filter((p) => p.available);
  const bundles = window.BUNDLES || [];
  const TONES = window.TONES || {};
  const boxB = bundles.find((b) => b.qty > 1) || { id: "jar-6", price: 68, qty: 6 };
  const singleB = bundles.find((b) => b.qty === 1) || { id: "jar-1", price: 15.8, qty: 1 };
  const target = boxB.qty || 6;
  const swatch = (p) => (TONES[p.tone] || {}).swatch || "#cdd9b4";

  const PACKS = [
  { id: "box-all", title: "Box of Six", sub: "All 6 Flavours", titleZh: "全六味", price: boxB.price },
  { id: "box-mix", title: "Box of Six", sub: "Mix & Match", titleZh: "自選搭配", price: boxB.price },
  { id: "single", title: "Single Jar", sub: "One flavour", titleZh: "單瓶", price: singleB.price }];


  const [packMode, setPackMode] = useStateShop((restore && restore.packMode) || initialPackMode || "box-all");
  const [pid, setPid] = useStateShop((restore && restore.pid) || initialFlavourId || product.id);
  const [qty, setQty] = useStateShop((restore && restore.qty) || 1);
  const [opts, setOpts] = useStateShop(() => (restore && restore.opts) || ({ milk: OPTION_GROUPS.milk.def, ...optionDefaults(product) }));
  const [mix, setMix] = useStateShop((restore && restore.mix) || {});

  const live = products.find((x) => x.id === pid) || product;
  // Reset options when the flavour changes — but keep a restored selection intact on first mount.
  const firstRunRef = React.useRef(true);
  useEffectShop(() => { if (firstRunRef.current) { firstRunRef.current = false; return; } setOpts(optionDefaults(live)); }, [pid]);

  const mixTotal = products.reduce((s, p) => s + (mix[p.id] || 0), 0);
  const isBox = packMode !== "single";
  const optKeys = isBox ?
  OPTION_ORDER.filter((k) => k === "sweet" || k === "temp" || k === "milk") :
  OPTION_ORDER.filter((k) => live.options && live.options[k]);

  // build gift-box slots
  let slots = null;
  if (packMode === "box-all") {
    slots = products.slice(0, target).map((p) => ({ tone: p.tone, key: p.id }));
    while (slots.length < target) slots.push(null);
  } else if (packMode === "box-mix") {
    const picked = [];
    products.forEach((p) => {for (let i = 0; i < (mix[p.id] || 0); i++) picked.push({ tone: p.tone, key: p.id + "-" + i });});
    slots = [];
    for (let i = 0; i < target; i++) slots.push(picked[i] || null);
  }

  const price = packMode === "single" ? singleB.price * qty : boxB.price;
  const canAdd = packMode === "single" ? true : packMode === "box-all" ? true : mixTotal === target;
  const remaining = target - mixTotal;

  const inc = (id) => setMix((m) => mixTotal >= target ? m : { ...m, [id]: (m[id] || 0) + 1 });
  const dec = (id) => setMix((m) => ({ ...m, [id]: Math.max(0, (m[id] || 0) - 1) }));

  const doAdd = () => {
    const selection = { packMode, pid, qty, opts: { ...opts }, mix: { ...mix } };
    if (packMode === "single") {
      onAdd({ productId: live.id, bundleId: singleB.id, qty, options: opts }, selection);
    } else {
      const boxOpts = { sweet: opts.sweet, temp: opts.temp, milk: opts.milk };
      const contents = [];
      if (packMode === "box-all") products.slice(0, target).forEach((p) => contents.push({ productId: p.id }));else
      products.forEach((p) => {for (let i = 0; i < (mix[p.id] || 0); i++) contents.push({ productId: p.id });});
      onAdd({ box: true, mode: packMode === "box-all" ? "all" : "mix", bundleId: boxB.id, qty: 1, options: boxOpts, contents }, selection);
    }
  };

  return (
    <div className="screen product-screen">
      <Header cartCount={cartCount} onHome={onHome} onCart={onCart} />
      <div className="wrap pdp">
        <button className="back-link" data-nofish="1" onClick={onBack} style={{ padding: "8px 0px 8px 8px" }}>← Back · 返回</button>
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
                  {products.map((x) =>
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
                  {products.map((x) =>
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
                  {products.map((x) => {
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
                    {g.choices.map((ch) =>
                    <button key={ch.id} data-nofish="1"
                    className={`chip ${opts[k] === ch.id ? "is-on" : ""}`}
                    onClick={() => setOpts((o) => ({ ...o, [k]: ch.id }))}>
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

            {packMode === "single" &&
            <ul className="pdp-notes">
                {live.notes.map((n, i) => <li key={i}><span>{n}</span><em>{live.notesZh[i]}</em></li>)}
              </ul>
            }
          </div>
        </div>
      </div>
      <Footer />
    </div>);

}

Object.assign(window, { Header, Footer, ShopScreen, ProductScreen, priceStr, FlavorCard });