// Sends email through your own Gmail (GMAIL_USER + GMAIL_APP_PASSWORD), or Resend if that's set up instead.
// With neither, emails are skipped quietly — orders always show in the admin page.
import nodemailer from "nodemailer";

export type Mail = { to: string | string[]; subject: string; html: string; text: string; replyTo?: string; bcc?: string };

let transport: nodemailer.Transporter | null = null;

export function mailProvider(): "gmail" | "resend" | null {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) return "gmail";
  if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) return "resend";
  return null;
}

// where shop alerts go (defaults to the Gmail account itself)
export function shopInbox() {
  return process.env.ORDER_EMAIL_TO || process.env.GMAIL_USER || "";
}

export async function sendMail(m: Mail): Promise<boolean> {
  const to = (Array.isArray(m.to) ? m.to : String(m.to).split(",")).map((s) => s.trim()).filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
  if (!to.length) return false;
  const provider = mailProvider();
  if (provider === "gmail") {
    transport ||= nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: String(process.env.GMAIL_APP_PASSWORD).replace(/\s+/g, "") },
    });
    await transport.sendMail({
      from: { name: "JoyJar 小胶傲", address: String(process.env.GMAIL_USER) },
      to, bcc: m.bcc || undefined, subject: m.subject, html: m.html, text: m.text, replyTo: m.replyTo,
    });
    return true;
  }
  if (provider === "resend") {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, bcc: m.bcc || undefined, subject: m.subject, html: m.html, text: m.text, reply_to: m.replyTo }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return true;
  }
  return false;
}
