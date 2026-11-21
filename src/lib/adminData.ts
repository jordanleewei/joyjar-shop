// Shapes orders for the admin screens (server only).
import { prisma } from "./db";
import { itemLines } from "./email";

export type AdminOrder = {
  num: string; createdAt: string; status: string; fulfil: string; region: string; method: string;
  name: string; phone: string; email: string; addr: string; unit: string; postal: string; note: string;
  lines: string[]; jars: number; subtotal: number; discount: number; deliveryFee: number; total: number; member: boolean;
};

export async function loadOrders(where: any = {}, take = 400): Promise<AdminOrder[]> {
  const [orders, products, bundles] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, take }),
    prisma.product.findMany({ select: { id: true, flavorEn: true } }),
    prisma.bundle.findMany({ select: { id: true, qty: true } }),
  ]);
  const name = (id: string) => products.find((p) => p.id === id)?.flavorEn || id;
  return orders.map((o) => {
    let c: any = {};
    try { c = JSON.parse(o.customerDetails || "{}"); } catch {}
    let items: any[] = [];
    try { items = JSON.parse(o.items || "[]"); } catch {}
    const jars = items.reduce((s, it) => s + (it.box ? (it.contents?.length || 6) : (bundles.find((b) => b.id === it.bundleId)?.qty || 1)) * (it.qty || 1), 0);
    return {
      num: o.num, createdAt: o.createdAt.toISOString(), status: o.status, fulfil: o.fulfil, region: o.region || (["central", "east", "north", "northeast", "west"].includes(o.zoneId) ? o.zoneId : ""),
      method: o.method, name: String(c.name || ""), phone: String(c.phone || ""), email: String(c.email || ""),
      addr: String(c.addr || ""), unit: String(c.unit || ""), postal: String(c.postal || ""), note: String(c.note || ""),
      lines: itemLines(o.items, name), jars, subtotal: o.subtotal, discount: o.discount, deliveryFee: o.deliveryFee, total: o.total, member: !!o.memberId,
    };
  });
}
