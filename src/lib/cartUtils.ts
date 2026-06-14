export function lineFor(item: any, products: any[], bundles: any[]) {
  if (item.box) {
    const b = bundles.find((x) => x.id === item.bundleId) || bundles.find((x) => x.qty > 1) || { price: 0 };
    return { box: true, b, total: (b.price || 0) * item.qty };
  }
  const p = products.find((x) => x.id === item.productId);
  const b = bundles.find((x) => x.id === item.bundleId);
  const price = b ? b.price : 0;
  return { p, b, total: price * item.qty };
}

export function boxSummary(contents: any[], products: any[]) {
  const map: Record<string, number> = {};
  (contents || []).forEach((c) => { map[c.productId] = (map[c.productId] || 0) + 1; });
  return Object.keys(map).map((pid) => {
    const p = products.find((x) => x.id === pid);
    return { count: map[pid], name: p ? p.flavorEn : pid, tone: p ? p.tone : "matcha" };
  });
}

export function boxTitle(item: any, lang: string) {
  if (lang === "zh") return item.mode === "all" ? "六味禮盒 · 全六味" : "六味禮盒 · 自選";
  return item.mode === "all" ? "Wellness Box · All Flavours" : "Wellness Box · Mix & Match";
}

export function cartSubtotal(cart: any[], products: any[], bundles: any[]) {
  return cart.reduce((s, it) => s + lineFor(it, products, bundles).total, 0);
}

export function deliveryFee(cart: any[], zone: any, deliveryConfig: any, products: any[], bundles: any[]) {
  if (!cart.length) return 0;
  if (cartSubtotal(cart, products, bundles) >= (deliveryConfig?.freeThreshold || 50)) return 0;
  if (zone && zone.fee != null) return Number(zone.fee);
  return Number(deliveryConfig?.baseFee || 6);
}
