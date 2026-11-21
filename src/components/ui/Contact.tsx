import React from "react";
import { CONTACT, waLink, mailLink } from "@/lib/constants";

// WhatsApp + email buttons, used in the footer, FAQ, account and confirmation pages.
export function ContactButtons({ message = "Hi JoyJar! ", subject = "Hello JoyJar", compact = false, className = "" }: { message?: string; subject?: string; compact?: boolean; className?: string }) {
  return (
    <div className={`contact-btns ${compact ? "is-compact" : ""} ${className}`}>
      <a className="contact-btn contact-wa" href={waLink(message)} target="_blank" rel="noreferrer" data-fish="1">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>
        <span>WhatsApp <b>{CONTACT.whatsappLabel}</b></span>
      </a>
      <a className="contact-btn contact-mail" href={mailLink(subject)} data-fish="1">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.8" d="M3 6h18v12H3z M3 7l9 6 9-6"/></svg>
        <span>Email <b>{CONTACT.email}</b></span>
      </a>
    </div>
  );
}
