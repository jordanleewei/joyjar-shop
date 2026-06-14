// admin.jsx — JoyJar Shopkeeper panel: product, pricing & delivery management.
const { useState: useAdminState } = React;

function ToneSwatch({ tone, active, onClick }) {
  const t = (window.TONES || {})[tone] || {};
  return (
    <button type="button" data-nofish="1" className={`tone-swatch ${active ? "is-on" : ""}`}
      onClick={onClick} title={t.nameEn}>
      <span className="tone-dot" style={{ background: t.swatch }} />
      <span className="tone-name">{t.nameEn}</span>
    </button>
  );
}

function OptionToggleRow({ value, onChange }) {
  return (
    <div className="opt-toggle-row">
      {OPTION_ORDER.map((k) => {
        const g = OPTION_GROUPS[k];
        const on = !!(value && value[k]);
        return (
          <button type="button" key={k} data-nofish="1"
            className={`opt-toggle ${on ? "is-on" : ""}`}
            onClick={() => onChange({ ...value, [k]: !on })}>
            <span className="opt-toggle-check">{on ? "✓" : ""}</span>
            {g.label} · {g.labelZh}
          </button>
        );
      })}
    </div>
  );
}

function ProductEditor({ initial, isNew, onSave, onClose }) {
  const blank = { flavorEn: "", flavorZh: "", name: "", nameZh: "", cap: "JOYJAR",
    tone: "matcha", blurb: "", blurbZh: "", notes: [], notesZh: [],
    options: { sweet: true, temp: true, milk: false }, available: true };
  const [p, setP] = useAdminState({ ...blank, ...initial });
  const up = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const notesStr = (p.notes || []).join(", ");
  const notesZhStr = (p.notesZh || []).join(", ");
  const splitNotes = (s) => s.split(/[,，]/).map((x) => x.trim()).filter(Boolean);

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{isNew ? "Add flavour · 新增風味" : "Edit flavour · 編輯風味"}</h3>
          <button className="modal-x" data-nofish="1" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <div className="editor-preview">
            <Jar tone={p.tone} size={0.78} label="小膠傲" labelEn={p.cap || "JOYJAR"} />
          </div>
          <div className="editor-fields">
            <div className="afield-grid">
              <AdminField label="Flavour" zh="風味(英)" value={p.flavorEn} onChange={(v) => up("flavorEn", v)} placeholder="Matcha · Lily · Lotus" />
              <AdminField label="Flavour ZH" zh="風味(中)" value={p.flavorZh} onChange={(v) => up("flavorZh", v)} placeholder="抹茶百合蓮子" />
              <AdminField label="Full name" zh="全名(英)" value={p.name} onChange={(v) => up("name", v)} placeholder="Matcha … Fish Maw" wide />
              <AdminField label="Full name ZH" zh="全名(中)" value={p.nameZh} onChange={(v) => up("nameZh", v)} placeholder="抹茶…花膠" wide />
              <AdminField label="Jar label" zh="瓶身標籤" value={p.cap} onChange={(v) => up("cap", v.toUpperCase())} placeholder="MATCHA" />
            </div>

            <span className="afield-label">Jar colour · 瓶身顏色</span>
            <div className="tone-grid">
              {Object.keys(window.TONES || {}).map((tk) => (
                <ToneSwatch key={tk} tone={tk} active={p.tone === tk} onClick={() => up("tone", tk)} />
              ))}
            </div>

            <AdminField label="Description" zh="描述(英)" value={p.blurb} onChange={(v) => up("blurb", v)} textarea wide />
            <AdminField label="Description ZH" zh="描述(中)" value={p.blurbZh} onChange={(v) => up("blurbZh", v)} textarea wide />
            <AdminField label="Ingredient tags" zh="標籤(英，逗號分隔)" value={notesStr} onChange={(v) => up("notes", splitNotes(v))} placeholder="Stone-ground matcha, Lotus seed" wide />
            <AdminField label="Ingredient tags ZH" zh="標籤(中，逗號分隔)" value={notesZhStr} onChange={(v) => up("notesZh", splitNotes(v))} placeholder="石磨抹茶, 蓮子" wide />

            <span className="afield-label">Options offered · 可選項目</span>
            <OptionToggleRow value={p.options} onChange={(v) => up("options", v)} />

            <div className="editor-foot">
              <div className="avail-toggle">
                <Toggle on={p.available} onChange={(v) => up("available", v)} labels={["On the shop", "Hidden"]} />
              </div>
              <div className="editor-actions">
                <button className="btn btn-ghost" data-nofish="1" onClick={onClose}><span className="btn-label">Cancel</span></button>
                <button className="btn btn-primary" data-nofish="1"
                  onClick={() => onSave({ ...p, notes: splitNotes(notesStr), notesZh: splitNotes(notesZhStr) })}>
                  <span className="btn-label">{isNew ? "Add flavour" : "Save changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsPanel() {
  useStore();
  const products = window.PRODUCTS || [];
  const bundles = window.BUNDLES || [];
  const [editing, setEditing] = useAdminState(null); // null | {product} | "new"

  const onSave = (data) => {
    if (editing === "new") Store.addProduct(data);
    else Store.updateProduct(editing.id, data);
    setEditing(null);
  };

  return (
    <div className="admin-panel">
      <div className="admin-tip">
        <strong>Tip ·</strong> Edits save instantly and show on the shop. Hide a flavour with its toggle instead of
        deleting, or <em>Duplicate</em> one as a starting template for the next season.
      </div>

      <section className="admin-card">
        <h3 className="admin-h">Pricing · 定價</h3>
        <div className="price-row">
          {bundles.map((b) => (
            <label className="price-input" key={b.id}>
              <span>{b.title} · {b.titleZh} <em>({b.qty} {b.qty > 1 ? "jars" : "jar"})</em></span>
              <div className="price-field">
                <span className="price-dollar">$</span>
                <input type="number" step="0.1" min="0" value={b.price}
                  onChange={(e) => Store.setBundlePrice(b.id, e.target.value)} />
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <h3 className="admin-h">Flavours · 風味 <span className="count-pill">{products.length}</span></h3>
          <button className="btn btn-primary btn-sm" data-nofish="1" onClick={() => setEditing("new")}>
            <span className="btn-label">+ Add flavour</span>
          </button>
        </div>
        <div className="prod-list">
          {products.map((p, i) => (
            <div className={`prod-row ${p.available ? "" : "is-hidden"}`} key={p.id}>
              <div className="prod-reorder">
                <button data-nofish="1" disabled={i === 0} onClick={() => Store.moveProduct(p.id, -1)} aria-label="Move up">▲</button>
                <button data-nofish="1" disabled={i === products.length - 1} onClick={() => Store.moveProduct(p.id, 1)} aria-label="Move down">▼</button>
              </div>
              <span className="prod-swatch" style={{ background: ((window.TONES || {})[p.tone] || {}).swatch }} />
              <div className="prod-main">
                <h4>{p.flavorEn}{!p.available && <span className="hidden-tag">Hidden</span>}</h4>
                <p>{p.flavorZh} · {priceStr((bundles[0] || {}).price || 0)} <span className="prod-opts">{OPTION_ORDER.filter((k) => p.options && p.options[k]).map((k) => OPTION_GROUPS[k].label).join(" · ") || "no options"}</span></p>
              </div>
              <div className="prod-actions">
                <Toggle on={p.available} onChange={() => Store.toggleAvailable(p.id)} labels={["Live", "Off"]} />
                <button className="row-btn" data-nofish="1" onClick={() => setEditing(p)}>Edit</button>
                <button className="row-btn" data-nofish="1" onClick={() => Store.duplicateProduct(p.id)}>Duplicate</button>
                <button className="row-btn row-btn-danger" data-nofish="1"
                  onClick={() => { if (confirm(`Delete "${p.flavorEn}"?`)) Store.deleteProduct(p.id); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {editing && (
        <ProductEditor
          initial={editing === "new" ? {} : editing}
          isNew={editing === "new"}
          onSave={onSave}
          onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function DeliveryPanel() {
  useStore();
  const D = window.DELIVERY || {};
  return (
    <div className="admin-panel">
      <div className="admin-tip">
        <strong>Tip ·</strong> Set one free-delivery threshold and a flat fee, then keep your <em>time windows</em> and
        <em> areas</em> current. Areas can carry their own fee for routes that are further out.
      </div>

      <section className="admin-card">
        <h3 className="admin-h">Fees · 運費</h3>
        <div className="price-row">
          <label className="price-input">
            <span>Free delivery over · 免運門檻</span>
            <div className="price-field"><span className="price-dollar">$</span>
              <input type="number" step="1" min="0" value={D.freeThreshold}
                onChange={(e) => Store.updateDelivery({ freeThreshold: Number(e.target.value) || 0 })} /></div>
          </label>
          <label className="price-input">
            <span>Standard fee · 標準運費</span>
            <div className="price-field"><span className="price-dollar">$</span>
              <input type="number" step="0.5" min="0" value={D.baseFee}
                onChange={(e) => Store.updateDelivery({ baseFee: Number(e.target.value) || 0 })} /></div>
          </label>
        </div>
        <AdminField label="Delivery note shown to customers" zh="配送說明" value={D.note || ""}
          onChange={(v) => Store.updateDelivery({ note: v })} textarea wide />
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <h3 className="admin-h">Time windows · 配送時段 <span className="count-pill">{(D.slots || []).length}</span></h3>
          <button className="btn btn-ghost btn-sm" data-nofish="1" onClick={() => Store.addSlot()}>
            <span className="btn-label">+ Add window</span>
          </button>
        </div>
        <div className="slot-list">
          {(D.slots || []).map((s, i) => (
            <div className="slot-edit" key={i}>
              <input value={s} onChange={(e) => Store.updateSlot(i, e.target.value)} />
              <button className="row-btn row-btn-danger" data-nofish="1" onClick={() => Store.removeSlot(i)}>Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <h3 className="admin-h">Areas · 配送地區 <span className="count-pill">{(D.zones || []).length}</span></h3>
          <button className="btn btn-ghost btn-sm" data-nofish="1" onClick={() => Store.addZone()}>
            <span className="btn-label">+ Add area</span>
          </button>
        </div>
        <div className="zone-list">
          {(D.zones || []).map((z) => (
            <div className="zone-edit" key={z.id}>
              <input className="zone-name" value={z.name} placeholder="Area" onChange={(e) => Store.updateZone(z.id, { name: e.target.value })} />
              <input className="zone-name-zh" value={z.nameZh} placeholder="中文" onChange={(e) => Store.updateZone(z.id, { nameZh: e.target.value })} />
              <div className="price-field zone-fee"><span className="price-dollar">$</span>
                <input type="number" step="0.5" min="0" value={z.fee}
                  onChange={(e) => Store.updateZone(z.id, { fee: Number(e.target.value) || 0 })} /></div>
              <button className="row-btn row-btn-danger" data-nofish="1" onClick={() => Store.removeZone(z.id)}>Remove</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BackupPanel() {
  useStore();
  const [msg, setMsg] = useAdminState("");

  const doExport = () => {
    const blob = new Blob([Store.exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "joyjar-catalog.json"; a.click();
    URL.revokeObjectURL(url);
    setMsg("Saved joyjar-catalog.json to your downloads.");
  };
  const doImport = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { Store.importJSON(reader.result); setMsg("Catalog imported successfully."); }
      catch (err) { setMsg("Could not read that file — is it a JoyJar export?"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="admin-panel">
      <div className="admin-tip">
        <strong>Tip ·</strong> Export a backup before big changes, or to copy this catalog to another device.
        Importing replaces everything currently in the shop.
      </div>
      <section className="admin-card">
        <h3 className="admin-h">Backup & restore · 備份</h3>
        <div className="backup-actions">
          <button className="btn btn-primary" data-nofish="1" onClick={doExport}><span className="btn-label">Export catalog ↓</span></button>
          <label className="btn btn-ghost" data-nofish="1">
            <span className="btn-label">Import catalog ↑</span>
            <input type="file" accept="application/json,.json" onChange={doImport} style={{ display: "none" }} />
          </label>
          <button className="btn btn-ghost" data-nofish="1"
            onClick={() => { if (confirm("Reset everything to the original 6 flavours and default delivery?")) { Store.reset(); setMsg("Reset to defaults."); } }}>
            <span className="btn-label">Reset to defaults</span>
          </button>
        </div>
        {msg && <p className="backup-msg">{msg}</p>}
      </section>
    </div>
  );
}

function AdminScreen({ onHome }) {
  const [tab, setTab] = useAdminState("products");
  return (
    <div className="screen admin-screen">
      <header className="admin-header">
        <div className="wrap admin-header-inner">
          <div className="admin-brand">
            <LogoMark size={44} />
            <div>
              <p className="admin-title">Shopkeeper · 店主管理</p>
              <p className="admin-sub">小膠傲 JoyJar</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" data-nofish="1" onClick={onHome}><span className="btn-label">← View shop · 回到商店</span></button>
        </div>
        <div className="wrap admin-tabs">
          {[["products", "Products · 產品"], ["delivery", "Delivery · 配送"], ["backup", "Backup · 備份"]].map(([id, label]) => (
            <button key={id} data-nofish="1" className={`admin-tab ${tab === id ? "is-on" : ""}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
      </header>
      <div className="wrap admin-wrap">
        {tab === "products" && <ProductsPanel />}
        {tab === "delivery" && <DeliveryPanel />}
        {tab === "backup" && <BackupPanel />}
      </div>
    </div>
  );
}

Object.assign(window, { AdminScreen });
