// Order emails: a confirmation to the customer and an alert to the shop when an order is paid,
// then "on its way" and "delivered" emails when the admin marks the order.
import { prisma } from "./db";
import { regionName } from "./regions";
import { formatDate } from "./dates";
import { sendMail, shopInbox, mailProvider } from "./mailer";

const SITE = () => process.env.SITE_URL || "https://joyjar-shop.vercel.app";
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

async function details(order: any) {
  let c: any = {};
  try { c = JSON.parse(order.customerDetails || "{}"); } catch {}
  const products = await prisma.product.findMany({ select: { id: true, flavorEn: true } });
  const lines = itemLines(order.items, (id) => products.find((p) => p.id === id)?.flavorEn || id);
  return { c, lines, date: formatDate(order.slot), first: String(c.name || "").trim().split(/\s+/)[0] || "there" };
}

// One simple, friendly layout for every email.
function layout(title: string, body: string, preheader = "") {
  return `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#2c2823">
  <span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr><td style="background:#2f4a34;color:#f6efe2;padding:18px 24px;border-bottom:3px solid #c9a24f;font-size:15px;letter-spacing:2px">
        <b style="font-size:18px;letter-spacing:4px">小胶傲</b> &nbsp;JOYJAR</td></tr>
      <tr><td style="padding:24px">
        <h1 style="margin:0 0 12px;font-size:22px;font-family:Georgia,serif;font-weight:normal">${title}</h1>
        ${body}
      </td></tr>
      <tr><td style="padding:16px 24px;background:#f6efe2;font-size:12px;color:#766c5f;line-height:1.6">
        Questions? Just reply to this email or WhatsApp us with your order number.<br>
        小胶傲 JoyJar · Made fresh in Singapore · <a href="${SITE()}" style="color:#2f4a34">${SITE().replace(/^https?:\/\//, "")}</a>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

const box = (inner: string) => `<div style="background:#f6efe2;border-radius:12px;padding:14px 16px;margin:14px 0;line-height:1.6;font-size:14px">${inner}</div>`;
const button = (href: string, label: string) => `<p style="margin:20px 0 4px"><a href="${href}" style="background:#2f4a34;color:#ffffff;padding:11px 18px;border-radius:999px;text-decoration:none;font-weight:bold;font-size:14px">${esc(label)}</a></p>`;
const itemsHtml = (lines: string[]) => `<ul style="margin:6px 0 0;padding-left:18px">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
const addressHtml = (c: any) => `${esc(c.name)}<br>${esc(c.addr)}${c.unit ? ", " + esc(c.unit) : ""}<br>Singapore ${esc(c.postal)}<br>${esc(c.phone)}`;
const STORAGE = "Keep your jars in the fridge (0–4°C) and enjoy within 6–7 days. Please don't freeze. To enjoy warm, open the cap, rest it back on loosely and steam for 10–15 minutes.";

// ---- when an order is paid ----
export async function sendOrderEmail(order: any) {
  if (!mailProvider()) return;
  const { c, lines, date, first } = await details(order);
  const reply = shopInbox() || undefined;
  const totals = `Subtotal ${money(order.subtotal)}${order.discount ? `<br>Discount −${money(order.discount)}` : ""}<br>Delivery ${order.deliveryFee ? money(order.deliveryFee) : "Free"}<br><b>Total paid ${money(order.total)}</b>`;

  // 1) the customer
  if (c.email) {
    const pts = order.memberId && order.pointsEarned ? `<p style="margin:12px 0">✨ You earned <b>${order.pointsEarned} JoyJar Club points</b> with this order.</p>` : "";
    const html = layout(`Thank you, ${esc(first)}! Your order is confirmed 🎉`, `
      <p style="margin:0 0 6px;font-size:15px;line-height:1.6">We've received your payment and we're getting your jars ready.${date ? ` We'll deliver on <b>${esc(date)}</b> and WhatsApp you before we arrive.` : " We'll WhatsApp you before we arrive."}</p>
      ${box(`<b>Order ${esc(order.num)}</b>${itemsHtml(lines)}<p style="margin:10px 0 0">${totals}</p>`)}
      ${box(`<b>Delivering to</b><br>${addressHtml(c)}${c.note ? `<br><i>Note: ${esc(c.note)}</i>` : ""}`)}
      ${pts}
      <p style="font-size:13px;color:#766c5f;line-height:1.6">${STORAGE}</p>
      ${order.memberId ? button(`${SITE()}/account#orders`, "View my orders") : button(`${SITE()}/club`, "Join the JoyJar Club · 5% off your first order")}`,
      `Order ${order.num} confirmed${date ? ` · delivery ${date}` : ""}`);
    const text = [`Thank you, ${first}! Your JoyJar order ${order.num} is confirmed.`, date ? `Delivery on ${date}. We'll WhatsApp you before we arrive.` : "We'll WhatsApp you before we arrive.", "", ...lines, "",
      `Total paid ${money(order.total)}`, "", "Delivering to:", c.name, `${c.addr}${c.unit ? ", " + c.unit : ""}`, `Singapore ${c.postal}`, "", STORAGE].join("\n");
    await sendMail({ to: c.email, subject: `Your JoyJar order ${order.num} is confirmed${date ? ` · delivery ${date}` : ""}`, html, text, replyTo: reply });
  }

  // 2) the shop
  const inbox = shopInbox();
  if (inbox) {
    const html = layout(`New order ${esc(order.num)} 🎉`, `
      <p style="margin:0 0 4px;color:#766c5f">${money(order.total)} paid by ${order.method === "card" ? "card" : "PayNow"} · ${esc(regionName(order.region))}</p>
      ${date ? `<p style="margin:0 0 4px;font-size:17px"><b>Deliver on ${esc(date)}</b></p>` : ""}
      ${box(`<b>Deliver to</b><br>${addressHtml(c)}${c.email ? `<br>${esc(c.email)}` : ""}${c.note ? `<br><i>Note: ${esc(c.note)}</i>` : ""}`)}
      ${box(`<b>Items</b>${itemsHtml(lines)}<p style="margin:10px 0 0">${totals}</p>`)}
      ${button(`${SITE()}/admin`, "Open orders · print label")}`);
    const text = [`New order ${order.num} · ${money(order.total)} · ${regionName(order.region)}`, date ? `Deliver on ${date}` : "", "", c.name, c.phone, c.email || "",
      `${c.addr}${c.unit ? ", " + c.unit : ""}`, `Singapore ${c.postal}`, c.note ? `Note: ${c.note}` : "", "", ...lines, "", `${SITE()}/admin`].join("\n");
    await sendMail({ to: inbox, subject: `New JoyJar order ${order.num} · ${date ? date + " · " : ""}${regionName(order.region)}`, html, text, replyTo: c.email || undefined });
  }
}

// ---- when the admin marks an order "packed" (on its way) or "delivered" ----
export async function sendStatusEmail(order: any, kind: "ship" | "done") {
  if (!mailProvider()) return false;
  const { c, lines, date, first } = await details(order);
  if (!c.email) return false;
  const reply = shopInbox() || undefined;
  if (kind === "ship") {
    const when = date ? `on <b>${esc(date)}</b>` : "soon";
    const html = layout(`Your jars are packed and on the way 📦`, `
      <p style="margin:0 0 6px;font-size:15px;line-height:1.6">Hi ${esc(first)}, your order <b>${esc(order.num)}</b> is packed and chilled. We'll deliver it ${when} and WhatsApp you before we arrive.</p>
      ${box(`<b>Delivering to</b><br>${addressHtml(c)}`)}
      ${box(`<b>In your order</b>${itemsHtml(lines)}`)}
      <p style="font-size:13px;color:#766c5f">Not going to be home? Just reply to this email or WhatsApp us.</p>`,
      `Order ${order.num} is on the way`);
    const text = `Hi ${first}, your JoyJar order ${order.num} is packed and on the way. We'll deliver it ${date ? "on " + date : "soon"} and WhatsApp you before we arrive.\n\n${lines.join("\n")}`;
    await sendMail({ to: c.email, bcc: reply, subject: `Your JoyJar order ${order.num} is on the way${date ? ` · ${date}` : ""}`, html, text, replyTo: reply });
    return true;
  }
  const html = layout(`Delivered! Enjoy your JoyJar 💛`, `
    <p style="margin:0 0 6px;font-size:15px;line-height:1.6">Hi ${esc(first)}, your order <b>${esc(order.num)}</b> has been delivered. We hope it brings you a little joy.</p>
    ${box(`<b>How to enjoy</b><br>${STORAGE}`)}
    <p style="margin:12px 0;font-size:14px;line-height:1.6">Loved it? Post about JoyJar or recommend us to a friend${order.memberId ? " and earn <b>5 points</b> for each mission" : ""}. If the lid button was already up when it arrived, please don't eat it: reply to this email and we'll sort it out.</p>
    ${order.memberId ? button(`${SITE()}/account#missions`, "Earn points with missions") : button(`${SITE()}/club`, "Join the JoyJar Club")}`,
    `Order ${order.num} delivered`);
  const text = `Hi ${first}, your JoyJar order ${order.num} has been delivered. Enjoy!\n\n${STORAGE}\n\nIf the lid button was already up when it arrived, please don't eat it: reply to this email and we'll sort it out.`;
  await sendMail({ to: c.email, bcc: reply, subject: `Delivered: your JoyJar order ${order.num}`, html, text, replyTo: reply });
  return true;
}

// ---- admin "send a test email" ----
export async function sendTestEmail(to: string) {
  const html = layout("Your JoyJar emails are working ✓", `<p style="font-size:15px;line-height:1.6">This is a test from your shop's admin page. Customers will get their order confirmation, "on the way" and "delivered" emails from this address.</p>`);
  return sendMail({ to, subject: "JoyJar test email ✓", html, text: "Your JoyJar emails are working." });
}
