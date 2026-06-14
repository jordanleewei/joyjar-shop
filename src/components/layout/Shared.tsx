"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "../ui/Brand";
import { useCartStore } from "@/store/cartStore";

export function Header() {
  const cart = useCartStore((state) => state.cart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = cart.reduce((s, it) => s + it.qty, 0);

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/cart" className="cart-btn" data-nofish="1" aria-label="View cart">
          <span className="cart-zh">購物籃</span>
          <span className="cart-en">Cart</span>
          {mounted && cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
      </div>
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
        <p className="footer-zh">小膠傲 · JoyJar — 花膠甜品，瓶中心意</p>
        <p className="footer-fine">Self-delivered with care · Stripe &amp; PayNow accepted</p>
        <Link href="/admin" className="manage-link" data-nofish="1">
          店主管理 · Shopkeeper
        </Link>
      </div>
    </footer>
  );
}
