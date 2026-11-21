import React from "react";
import { Jar } from "./Jars";

export const photoUrl = (p: { id: string; imageVer?: number }) => `/api/product-image/${encodeURIComponent(p.id)}?v=${p.imageVer || 0}`;

// The product's photo if one has been uploaded in the admin, otherwise the illustrated jar.
export function ProductPhoto({ p, size = 0.7, floating = false, className = "" }: { p: any; size?: number; floating?: boolean; className?: string }) {
  if (p && p.imageVer > 0) {
    return <img className={`product-photo ${className}`} src={photoUrl(p)} alt={`${p.flavorEn || p.name} fish maw dessert`} loading="lazy" decoding="async" />;
  }
  return <Jar tone={p ? p.tone : "matcha"} size={size} floating={floating} label="小胶傲" labelEn={p ? p.cap : "JOYJAR"} />;
}
