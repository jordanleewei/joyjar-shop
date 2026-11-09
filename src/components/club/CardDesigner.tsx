"use client";

import React, { useState } from "react";
import {
  SKIN, HAIR_COLOURS, HAIR_STYLES, TOPS, LOOKS, FACIAL, DEFAULT_HAIR, CARD_THEMES, PET_COLOURS, ACCESSORIES, TIERS,
  CardDesign, unlockedAccessories,
} from "@/lib/club";
import { FishMawPet } from "./MemberCard";

function Swatches({ list, value, onChange, label }: { list: string[]; value: number; onChange: (i: number) => void; label: string }) {
  return (
    <div className="cd-row">
      <span className="cd-label">{label}</span>
      <div className="cd-swatches">
        {list.map((c, i) => (
          <button key={c} type="button" data-nofish="1" aria-label={`${label} ${i + 1}`}
            className={`cd-swatch ${value === i ? "is-on" : ""}`} style={{ background: c }} onClick={() => onChange(i)} />
        ))}
      </div>
    </div>
  );
}

export function CardDesigner({ d, onChange, tierIndex = 0 }: { d: CardDesign; onChange: (d: CardDesign) => void; tierIndex?: number }) {
  const [tab, setTab] = useState<"you" | "pet" | "card">("you");
  const set = (patch: Partial<CardDesign>) => onChange({ ...d, ...patch });
  const unlocked = unlockedAccessories(tierIndex);
  const unlockTier = (id: string) => TIERS.find((t) => t.unlocks.includes(id));

  return (
    <div className="cd">
      <div className="cd-tabs" role="tablist">
        {([["you", "You · 头像"], ["pet", "Pet · 宠物"], ["card", "Card · 卡面"]] as const).map(([id, l]) => (
          <button key={id} role="tab" aria-selected={tab === id} data-nofish="1" type="button"
            className={`cd-tab ${tab === id ? "is-on" : ""}`} onClick={() => setTab(id)}>{l}</button>
        ))}
      </div>

      {tab === "you" && (
        <div className="cd-panel">
          <div className="cd-row">
            <span className="cd-label">Look</span>
            <div className="cd-chips">
              {LOOKS.map((l) => (
                <button key={l.id} type="button" data-nofish="1" className={`chip ${d.look === l.id ? "is-on" : ""}`}
                  onClick={() => d.look !== l.id && set({ look: l.id, hair: DEFAULT_HAIR[l.id], facial: "none" })}>{l.en}<small>{l.zh}</small></button>
              ))}
            </div>
          </div>
          <div className="cd-row">
            <span className="cd-label">Hair</span>
            <div className="cd-chips">
              {HAIR_STYLES.filter((h) => h.look === d.look).map((h) => (
                <button key={h.id} type="button" data-nofish="1" className={`chip ${d.hair === h.id ? "is-on" : ""}`} onClick={() => set({ hair: h.id })}>{h.en}</button>
              ))}
            </div>
          </div>
          {d.look === "m" && (
            <div className="cd-row">
              <span className="cd-label">Facial hair</span>
              <div className="cd-chips">
                {FACIAL.map((f) => (
                  <button key={f.id} type="button" data-nofish="1" className={`chip ${d.facial === f.id ? "is-on" : ""}`} onClick={() => set({ facial: f.id })}>{f.en}</button>
                ))}
              </div>
            </div>
          )}
          <Swatches label="Hair colour" list={HAIR_COLOURS} value={d.hairColour} onChange={(i) => set({ hairColour: i })} />
          <Swatches label="Skin" list={SKIN} value={d.skin} onChange={(i) => set({ skin: i })} />
          <Swatches label="Top" list={TOPS} value={d.top} onChange={(i) => set({ top: i })} />
        </div>
      )}

      {tab === "pet" && (
        <div className="cd-panel">
          <label className="field">
            <span className="field-label">Pet name <em>宠物名字</em></span>
            <input value={d.petName} maxLength={16} onChange={(e) => set({ petName: e.target.value })} />
          </label>
          <div className="cd-row">
            <span className="cd-label">Colour</span>
            <div className="cd-chips">
              {PET_COLOURS.map((p) => (
                <button key={p.id} type="button" data-nofish="1" aria-label={p.id}
                  className={`cd-pet ${d.petColour === p.id ? "is-on" : ""}`} onClick={() => set({ petColour: p.id })}>
                  <FishMawPet colour={p.id} accessory="none" size={44} />
                </button>
              ))}
            </div>
          </div>
          <div className="cd-row">
            <span className="cd-label">Accessory</span>
            <div className="cd-chips">
              {ACCESSORIES.map((a) => {
                const ok = unlocked.includes(a.id);
                const t = unlockTier(a.id);
                return (
                  <button key={a.id} type="button" data-nofish="1" disabled={!ok}
                    title={ok ? a.en : `Unlocks at ${t?.en}`}
                    className={`chip ${d.accessory === a.id ? "is-on" : ""} ${ok ? "" : "is-locked"}`}
                    onClick={() => ok && set({ accessory: a.id })}>
                    {a.en}{!ok && <small>🔒 {t?.en}</small>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "card" && (
        <div className="cd-panel">
          <div className="cd-row">
            <span className="cd-label">Card colour</span>
            <div className="cd-chips">
              {CARD_THEMES.map((t) => (
                <button key={t.id} type="button" data-nofish="1" className={`chip cd-theme ${d.theme === t.id ? "is-on" : ""}`} onClick={() => set({ theme: t.id })}>
                  <i style={{ background: t.bg, borderColor: t.deep }} />{t.en}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
