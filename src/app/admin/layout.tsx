import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JoyJar Admin · 小胶傲后台",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell">{children}</div>;
}
