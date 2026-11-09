"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../ui/Brand";
import { useCartStore } from "@/store/cartStore";
import { DISCLAIMER, DISCLAIMER_ZH } from "@/lib/constants";

const NAV = [
  { href: "/#shop", en: "Shop", zh: "选购" },
  { href: "/#kitchen", en: "Our kitchen", zh: "制作" },
  { href: "/#pop", en: "Freshness", zh: "锁鲜" },
  { href: "/club", en: "Club", zh: "会员" },
  { href: "/#faq", en: "FAQ", zh: "问答" },
];

export function Header() {
  const cart = useCartStore((state) => state.cart);
  const [mounted, setMounted] = useState(false);
  const [memberName, setMemberName] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    fetch("/api/club/me").then((r) => r.json()).then((d) => setMemberName(d.member ? d.member.name : null)).catch(() => {});
  }, []);

  const cartCount = cart.reduce((s, it) => s + it.qty, 0);

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="site-nav" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} data-nofish="1"
              className={`nav-link ${pathname === n.href ? "is-on" : ""}`}>
              {n.en}<span className="nav-zh">{n.zh}</span>
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/club" className={`member-btn ${memberName ? "is-member" : ""}`} data-nofish="1">
            {memberName ? <>My card<span className="member-dot" /></> : <>Join<span className="nav-zh"> 入会</span></>}
          </Link>
          <Link href="/cart" className="cart-btn" data-nofish="1" aria-label="View cart">
            <span className="cart-zh">购物篮</span>
            <span className="cart-en">Cart</span>
            {mounted && cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
        </div>
      </div>
      <nav className="site-nav-mobile" aria-label="Main">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} data-nofish="1" className={`nav-pill ${pathname === n.href ? "is-on" : ""}`}>
            {n.en}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <Link href="/">
          <Logo compact />
        </Link>
        <p className="footer-zh">小胶傲 · JoyJar — 一罐花胶，满满胶傲</p>
        <nav className="footer-nav">
          <Link href="/#shop">Shop</Link><Link href="/#kitchen">Our kitchen</Link>
          <Link href="/club">JoyJar Club</Link><Link href="/#faq">FAQ</Link>
        </nav>
        <p className="footer-fine">Made fresh in Singapore · Self-delivered with care · PayNow &amp; cards via HitPay</p>
        <p className="footer-disclaimer">{DISCLAIMER}<br />{DISCLAIMER_ZH}</p>
      </div>
    </footer>
  );
}
