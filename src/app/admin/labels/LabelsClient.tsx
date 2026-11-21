"use client";

import { useState } from "react";
import { REGIONS } from "@/lib/regions";
import { formatDate } from "@/lib/dates";
import type { AdminOrder } from "@/lib/adminData";

// Two layouts: one 4×6" (100×150mm) label per page for label printers, or 8 per A4 sticker sheet.
export function LabelsClient({ orders }: { orders: AdminOrder[] }) {
  const [size, setSize] = useState<"label" | "a4">("label");
  const region = (id: string) => REGIONS.find((r) => r.id === id);
  return (
    <div className={`lbl-page lbl-${size}`}>
      <style>{size === "label"
        ? "@page { size: 100mm 150mm; margin: 0; }"
        : "@page { size: A4; margin: 13mm 5mm; }"}</style>
      <div className="lbl-toolbar">
        <strong>{orders.length} label{orders.length === 1 ? "" : "s"}</strong>
        <div className="lbl-sizes" role="radiogroup" aria-label="Label size">
          <button type="button" data-nofish="1" className={size === "label" ? "is-on" : ""} onClick={() => setSize("label")}>4×6&quot; label printer</button>
          <button type="button" data-nofish="1" className={size === "a4" ? "is-on" : ""} onClick={() => setSize("a4")}>A4 sheet · 8 per page</button>
        </div>
        <button type="button" className="adm-btn" data-nofish="1" onClick={() => window.print()}>🖨 Print</button>
        <span className="lbl-tip">Tip: in the print window, set scale to 100% and turn off headers and footers.</span>
      </div>
      {orders.length === 0 && <p className="adm-empty">No orders picked. Go back and choose some orders first.</p>}
      <div className="lbl-sheet">
        {orders.map((o) => {
          const r = region(o.region);
          return (
            <div className="lbl" key={o.num}>
              <div className="lbl-top">
                <span className="lbl-region">{r ? <>{r.en.toUpperCase()} <small>{r.zh}</small></> : "NO REGION"}</span>
                <span className="lbl-num">{o.date ? formatDate(o.date) + " · " : ""}{o.num}</span>
              </div>
              <div className="lbl-to">
                <span className="lbl-k">TO</span>
                <p className="lbl-name">{o.name}</p>
                <p className="lbl-phone">{o.phone}</p>
                <p className="lbl-addr">{o.addr}{o.unit ? `, ${o.unit}` : ""}</p>
                <p className="lbl-postal">Singapore {o.postal}</p>
              </div>
              <div className="lbl-items">
                <span className="lbl-k">{o.jars} JAR{o.jars === 1 ? "" : "S"}</span>
                <ul>{o.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
                {o.note && <p className="lbl-note">Note: {o.note}</p>}
              </div>
              <div className="lbl-from">
                <span><b>FROM</b> 小胶傲 JoyJar</span>
                <span>❄ Keep chilled · 请冷藏</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
