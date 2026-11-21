// New-order email to the shop owner, sent once when an order is paid.
// Needs RESEND_API_KEY and ORDER_EMAIL_TO in Vercel. Without them it quietly does nothing
// (orders are always in the admin page).
import { regionName } from "./regions";

const esc = (s: any) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const money = (n: number) => "$" + Number(n || 0).toFixed(2);

export function itemLines(itemsJson: string, flavour: (id: string) => string) {
  let items: any[] = [];
  try { items = JSON.parse(itemsJson || "[]"); } catch {}
  const sweet = (o: any) => (o?.sweet === "none" ? "No sugar" : o?.sweet ? "Less sugar" : "");
  return items.map((it) => {
    if (it.box) {
      const count: Record<string, number> = {};
      for (const c of it.contents || []) count[c.productId] = (count[c.productId] || 0) + 1;
      const mix = Object.entries(count).map(([id, n]) => `${n}× ${flavour(id)}`).join(", ");
      return `${it.qty}× Box of Six (${mix})${sweet(it.options) ? " · " + sweet(it.options) : ""}`;
    }
    return `${it.qty}× ${flavour(it.productId)}${sweet(it.options) ? " · " + sweet(it.options) : ""}`;
  });
}

export async function sendOrderEmail(order: any) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_EMAIL_TO;
  if (!key || !to) return;
  const from = process.env.ORDER_EMAIL_FROM || "JoyJar Orders <onboarding@resend.dev>";
  const site = process.env.SITE_URL || "https://joyjar-shop.vercel.app";
  let c: any = {};
  try { c = JSON.parse(order.customerDetails || "{}"); } catch {}
  const names: Record<string, string> = { pandan: "Pandan", noir: "Noir", calm: "Calm", rose: "Rose" };
  const lines = itemLines(order.items, (id) => names[id] || id);
  const html = `
  <div style="font-family:Arial,sans-serif;font-size:15px;color:#2c2823;max-width:560px">
    <h2 style="margin:0 0 4px">New order ${esc(order.num)} 🎉</h2>
    <p style="margin:0 0 16px;color:#6b6358">${money(order.total)} paid by ${order.method === "card" ? "card" : "PayNow"} · ${esc(regionName(order.region))}</p>
    <h3 style="margin:16px 0 6px">Deliver to</h3>
    <p style="margin:0;line-height:1.5"><b>${esc(c.name)}</b><br>${esc(c.phone)}${c.email ? "<br>" + esc(c.email) : ""}<br>
    ${esc(c.addr)}${c.unit ? ", " + esc(c.unit) : ""}<br>Singapore ${esc(c.postal)}</p>
    ${c.note ? `<p style="margin:8px 0 0;padding:8px 10px;background:#f6efe2;border-radius:6px">Note: ${esc(c.note)}</p>` : ""}
    <h3 style="margin:16px 0 6px">Items</h3>
    <ul style="margin:0;padding-left:18px;line-height:1.6">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
    <p style="margin:12px 0 0;line-height:1.6">Subtotal ${money(order.subtotal)}${order.discount ? `<br>Discount −${money(order.discount)}` : ""}<br>Delivery ${order.deliveryFee ? money(order.deliveryFee) : "Free"}<br><b>Total ${money(order.total)}</b></p>
    <p style="margin:20px 0 0"><a href="${site}/admin" style="background:#2f4a34;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none">Open orders · print label</a></p>
  </div>`;
  const text = [`New order ${order.num} · ${money(order.total)} · ${regionName(order.region)}`, "", c.name, c.phone, c.email || "",
    `${c.addr}${c.unit ? ", " + c.unit : ""}`, `Singapore ${c.postal}`, c.note ? `Note: ${c.note}` : "", "", ...lines, "", `${site}/admin`].filter((x) => x !== undefined).join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: to.split(",").map((s) => s.trim()).filter(Boolean), subject: `New JoyJar order ${order.num} · ${money(order.total)} · ${regionName(order.region)}`, html, text }),
  });
  if (!res.ok) console.error("Resend error", res.status, (await res.text()).slice(0, 300));
}
