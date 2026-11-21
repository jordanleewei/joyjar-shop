"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AdminBar() {
  const path = usePathname();
  const router = useRouter();
  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); router.refresh(); };
  return (
    <header className="adm-bar">
      <div className="adm-wrap adm-bar-inner">
        <Link href="/admin" className="adm-brand" data-nofish="1"><b>小胶傲</b> JoyJar Admin</Link>
        <nav className="adm-nav">
          <Link href="/admin" data-nofish="1" className={path === "/admin" ? "is-on" : ""}>Orders · 订单</Link>
          <Link href="/admin/products" data-nofish="1" className={path.startsWith("/admin/products") ? "is-on" : ""}>Products · 产品</Link>
          <Link href="/admin/stock" data-nofish="1" className={path === "/admin/stock" ? "is-on" : ""}>Stock · 库存</Link>
          <Link href="/admin/settings" data-nofish="1" className={path === "/admin/settings" ? "is-on" : ""}>Settings · 设置</Link>
          <a href="/" target="_blank" rel="noreferrer" data-nofish="1">View shop ↗</a>
          <button type="button" data-nofish="1" onClick={logout}>Log out</button>
        </nav>
      </div>
    </header>
  );
}
