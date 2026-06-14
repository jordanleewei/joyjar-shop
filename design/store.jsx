// store.jsx — JoyJar live data store. Persists to localStorage, mirrors to
// window.PRODUCTS / BUNDLES / DELIVERY, and notifies React subscribers.
const { useState: useStoreState, useEffect: useStoreEffect } = React;

const STORE_KEY = "joyjar_store_v2";

function freshDefaults() {
  return {
    products: JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)),
    bundles:  JSON.parse(JSON.stringify(DEFAULT_BUNDLES)),
    delivery: JSON.parse(JSON.stringify(DEFAULT_DELIVERY)),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return freshDefaults();
    const saved = JSON.parse(raw);
    const d = freshDefaults();
    return {
      products: Array.isArray(saved.products) && saved.products.length ? saved.products : d.products,
      bundles:  Array.isArray(saved.bundles) && saved.bundles.length ? saved.bundles : d.bundles,
      delivery: { ...d.delivery, ...(saved.delivery || {}) },
    };
  } catch (e) { return freshDefaults(); }
}

let state = loadState();
const subscribers = new Set();

function mirror() {
  window.PRODUCTS = state.products;
  window.BUNDLES = state.bundles;
  window.DELIVERY = state.delivery;
}
function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
}
function commit(next) {
  state = next;
  mirror(); persist();
  subscribers.forEach((fn) => fn());
}
mirror(); // initialise globals before first render

function useStore() {
  const [, force] = useStoreState(0);
  useStoreEffect(() => {
    const fn = () => force((n) => n + 1);
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }, []);
  return state;
}

const slug = (s) => (s || "flavour").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "flavour";
function uniqueId(base) {
  let id = slug(base), i = 2;
  while (state.products.some((p) => p.id === id)) id = slug(base) + "-" + i++;
  return id;
}

const Store = {
  get: () => state,
  useStore,

  // ---- products ----
  addProduct(p) {
    const id = uniqueId(p.flavorEn || p.name || "flavour");
    const product = { id, available: true, tone: "matcha", cap: "JOYJAR",
      notes: [], notesZh: [], options: { sweet: true, temp: true, milk: false }, ...p, id };
    commit({ ...state, products: [...state.products, product] });
    return id;
  },
  updateProduct(id, patch) {
    commit({ ...state, products: state.products.map((p) => p.id === id ? { ...p, ...patch } : p) });
  },
  deleteProduct(id) {
    commit({ ...state, products: state.products.filter((p) => p.id !== id) });
  },
  duplicateProduct(id) {
    const src = state.products.find((p) => p.id === id); if (!src) return;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = uniqueId(src.flavorEn + "-copy");
    copy.name = src.name + " (copy)";
    const idx = state.products.findIndex((p) => p.id === id);
    const next = [...state.products]; next.splice(idx + 1, 0, copy);
    commit({ ...state, products: next });
    return copy.id;
  },
  moveProduct(id, dir) {
    const idx = state.products.findIndex((p) => p.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= state.products.length) return;
    const next = [...state.products];
    [next[idx], next[j]] = [next[j], next[idx]];
    commit({ ...state, products: next });
  },
  toggleAvailable(id) {
    commit({ ...state, products: state.products.map((p) => p.id === id ? { ...p, available: !p.available } : p) });
  },

  // ---- pricing ----
  setBundlePrice(id, price) {
    commit({ ...state, bundles: state.bundles.map((b) => b.id === id ? { ...b, price: Number(price) || 0 } : b) });
  },

  // ---- delivery ----
  updateDelivery(patch) {
    commit({ ...state, delivery: { ...state.delivery, ...patch } });
  },
  addSlot(text) {
    commit({ ...state, delivery: { ...state.delivery, slots: [...state.delivery.slots, text || "New window · 新時段"] } });
  },
  updateSlot(i, text) {
    const slots = [...state.delivery.slots]; slots[i] = text;
    commit({ ...state, delivery: { ...state.delivery, slots } });
  },
  removeSlot(i) {
    commit({ ...state, delivery: { ...state.delivery, slots: state.delivery.slots.filter((_, k) => k !== i) } });
  },
  addZone() {
    const id = "zone-" + Date.now().toString(36);
    commit({ ...state, delivery: { ...state.delivery, zones: [...state.delivery.zones, { id, name: "New area", nameZh: "新區域", fee: state.delivery.baseFee }] } });
  },
  updateZone(id, patch) {
    commit({ ...state, delivery: { ...state.delivery, zones: state.delivery.zones.map((z) => z.id === id ? { ...z, ...patch } : z) } });
  },
  removeZone(id) {
    commit({ ...state, delivery: { ...state.delivery, zones: state.delivery.zones.filter((z) => z.id !== id) } });
  },

  // ---- data ----
  reset() { commit(freshDefaults()); },
  exportJSON() { return JSON.stringify(state, null, 2); },
  importJSON(str) {
    const parsed = JSON.parse(str);
    const d = freshDefaults();
    commit({
      products: Array.isArray(parsed.products) ? parsed.products : d.products,
      bundles:  Array.isArray(parsed.bundles) ? parsed.bundles : d.bundles,
      delivery: { ...d.delivery, ...(parsed.delivery || {}) },
    });
  },
};

Object.assign(window, { Store, useStore });
