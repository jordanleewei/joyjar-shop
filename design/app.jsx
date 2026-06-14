// app.jsx — JoyJar routing, cart state, tweaks, checkout swim. Mounts the app.
const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "classic",
  "displayType": "serif",
  "logoStyle": "seal",
  "jarStyle": "classic",
  "heroLayout": "split",
  "fishMotion": "auto",
  "checkoutMode": "two-col"
}/*EDITMODE-END*/;

// read by the global click handler
window.__fishMotion = TWEAK_DEFAULTS.fishMotion;
window.__logoStyle = TWEAK_DEFAULTS.logoStyle;
window.__jarStyle = TWEAK_DEFAULTS.jarStyle;

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 64;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useStore(); // re-render when the catalog / delivery config changes
  const [screen, setScreen] = useState("shop");
  const [product, setProduct] = useState(() => (window.PRODUCTS || [])[0]);
  const [initialPackMode, setInitialPackMode] = useState("box-all");
  const [initialFlavourId, setInitialFlavourId] = useState(null);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [sel, setSel] = useState(null); // last product configuration, restored on back-nav
  const [swimming, setSwimming] = useState(false);
  const popping = React.useRef(false);

  // keep globals current before children render
  window.__logoStyle = t.logoStyle;
  window.__jarStyle = t.jarStyle;

  useEffect(() => { window.__goAdmin = () => setScreen("admin"); }, []);
  useEffect(() => { window.__fishMotion = t.fishMotion; }, [t.fishMotion]);
  useEffect(() => {
    document.documentElement.dataset.theme = t.theme;
    document.documentElement.dataset.display = t.displayType;
  }, [t.theme, t.displayType]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  // Browser / phone back button mirrors the in-app back navigation.
  useEffect(() => {
    history.replaceState({ screen: "shop" }, "");
    const onPop = (e) => {
      popping.current = true;
      setScreen((e.state && e.state.screen) || "shop");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (popping.current) { popping.current = false; return; }
    if (history.state && history.state.screen === screen) return;
    history.pushState({ screen }, "");
  }, [screen]);

  const cartCount = cart.reduce((s, it) => s + it.qty, 0);
  const go = (s) => setScreen(s);
  const goBack = () => history.back();
  const keyOf = (it) => it.box
    ? "box|" + it.mode + "|" + JSON.stringify(it.contents) + "|" + JSON.stringify(it.options || {})
    : it.productId + "|" + it.bundleId + "|" + JSON.stringify(it.options || {});

  const addToCart = (item, selection) => {
    setCart((c) => {
      const k = keyOf(item);
      const idx = c.findIndex((x) => keyOf(x) === k);
      if (idx >= 0) { const n = [...c]; n[idx] = { ...n[idx], qty: n[idx].qty + item.qty }; return n; }
      return [...c, item];
    });
    if (selection) setSel(selection);
    go("cart");
  };
  const chooseBundle = (b) => {
    setProduct((window.PRODUCTS || [])[0]);
    setInitialPackMode(b.qty === 1 ? "single" : "box-all");
    setInitialFlavourId(null);
    setSel(null);
    go("product");
  };
  const viewProduct = (p) => {
    setProduct(p);
    setInitialPackMode("single");
    setInitialFlavourId(p.id);
    setSel(null);
    go("product");
  };
  const setQty = (i, v) => setCart((c) => c.map((it, idx) => idx === i ? { ...it, qty: Math.max(1, v) } : it));
  const removeItem = (i) => setCart((c) => c.filter((_, idx) => idx !== i));

  const placeOrder = (payload) => {
    const num = "JJ-" + Math.floor(100000 + Math.random() * 899999);
    setSwimming(true);
    checkoutSwim(() => {
      setOrder({ ...payload, num });
      setCart([]);
      setSwimming(false);
      go("confirm");
    }, { duration: 2600 });
  };

  const common = { cartCount, onHome: () => go("shop"), onCart: () => go("cart") };

  return (
    <React.Fragment>
      {screen === "shop" && (
        <ShopScreen heroLayout={t.heroLayout} {...common}
          onView={viewProduct} onChooseBundle={chooseBundle} gotoSection={scrollToId} />
      )}
      {screen === "product" && product && (
        <ProductScreen product={product} {...common}
          initialPackMode={initialPackMode} initialFlavourId={initialFlavourId} restore={sel}
          onBack={goBack} onAdd={addToCart} />
      )}
      {screen === "cart" && (
        <CartScreen cart={cart} {...common}
          onQty={setQty} onRemove={removeItem}
          onCheckout={() => go("checkout")} onShop={goBack}
          onBrowse={() => chooseBundle((window.BUNDLES || []).find((b) => b.qty > 1) || { qty: 6 })} />
      )}
      {screen === "checkout" && (
        <CheckoutScreen cart={cart} checkoutMode={t.checkoutMode} {...common}
          onBack={goBack} onPlace={placeOrder} />
      )}
      {screen === "confirm" && order && (
        <ConfirmScreen order={order} onHome={() => go("shop")} />
      )}

      {screen === "admin" && (
        <AdminScreen onHome={() => go("shop")} />
      )}

      {swimming && <div className="swim-veil" />}

      <TweaksPanel>
        <TweakSection label="Look & feel" />
        <TweakRadio label="Theme" value={t.theme}
          options={["classic", "jade", "ink"]} onChange={(v) => setTweak("theme", v)} />
        <TweakRadio label="Display type" value={t.displayType}
          options={["serif", "modern"]} onChange={(v) => setTweak("displayType", v)} />
        <TweakSection label="Brand" />
        <TweakSelect label="Logo" value={t.logoStyle}
          options={[
            { value: "seal", label: "Cinnabar Seal" },
            { value: "circle", label: "Circle Seal" },
            { value: "jar", label: "Jar Mark" },
            { value: "monogram", label: "Monogram J" },
            { value: "wave", label: "Wave Badge" },
            { value: "stacked", label: "Serif Stack" },
            { value: "handmade", label: "Handmade Logo" },
          ]} onChange={(v) => setTweak("logoStyle", v)} />
        <TweakSelect label="Jar design" value={t.jarStyle}
          options={[
            { value: "classic", label: "Classic" },
            { value: "jam", label: "Jam (handmade)" },
            { value: "apothecary", label: "Apothecary" },
            { value: "premium", label: "Premium (gold)" },
            { value: "mason", label: "Mason" },
            { value: "minimal", label: "Minimal" },
          ]} onChange={(v) => setTweak("jarStyle", v)} />
        <TweakSection label="Hero" />
        <TweakRadio label="Layout" value={t.heroLayout}
          options={["split", "centered", "stacked"]} onChange={(v) => setTweak("heroLayout", v)} />
        <TweakSection label="Fish motion" />
        <TweakRadio label="On button press" value={t.fishMotion}
          options={["auto", "bubble", "swim"]} onChange={(v) => setTweak("fishMotion", v)} />
        <TweakButton label="Preview a school" onClick={() => checkoutSwim(null, { duration: 2600 })}>
          Send the fish swimming →
        </TweakButton>
        <TweakSection label="Checkout" />
        <TweakRadio label="Layout" value={t.checkoutMode}
          options={["two-col", "stacked"]} onChange={(v) => setTweak("checkoutMode", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

// global fish-burst on any [data-fish] click (skip [data-nofish])
bindFishClicks(() => window.__fishMotion || "auto");

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
