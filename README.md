# Handoff: 小膠傲 · JoyJar Shop — Fish Maw Dessert E-commerce

## Overview
JoyJar (小膠傲) sells fish-maw collagen desserts in a jar. This bundle is the **complete, working front-end prototype** of the storefront and an internal "Shopkeeper" admin. The shopping flow, cart logic, pricing, delivery rules, product/delivery management, and all animations are built and behave correctly. What remains is to **recreate this design in a production stack** and **connect the parts that need a server**: payments (Stripe + PayNow), an order backend, and a shared database for the admin.

**Recommended stack: Next.js (App Router) on Vercel + Stripe + a hosted Postgres (Vercel Postgres / Neon / Supabase).** Rationale at the bottom.

---

## About the Design Files
The files in `design/` are **design references created in HTML/React-via-Babel** — a prototype showing the intended look and behavior. They are **not meant to be shipped as-is.** The task is to **recreate these designs in a real codebase** (Next.js + React recommended) using production patterns: a real bundler, real components, a database, and server-side API routes for payment and orders.

The prototype runs entirely in the browser: React + ReactDOM + Babel are loaded from a CDN, each `*.jsx` file is transpiled at runtime, and components communicate through globals on `window`. **Do not keep this architecture in production** — it's a prototyping convenience. Port the JSX into proper ES modules / Next components.

The design is **high-fidelity**: colors, typography, spacing, copy (bilingual EN + 繁體中文), and interactions are final. Recreate the UI faithfully.

---

## Fidelity
**High-fidelity (hifi).** Recreate pixel-for-pixel. All exact values are in `design/styles.css` (`:root` tokens) and `design/giftbox3d.css`. Bilingual copy lives in `design/data.jsx` and inline in the screen components.

---

## ✅ What Has Been Done (front-end, complete)
- **Storefront**: hero, two bundle cards, 6-flavour grid, four-benefit section, "A Gift of Wellness" section with the 3D gift box, footer.
- **Product Detail (PDP)** with a **Pack-first** model:
  - *Box of Six — All Flavours* (one of each, $68, free delivery)
  - *Box of Six — Mix & Match* (choose any 6 via +/- steppers; box fills with **ghost skeleton jars** that **pop into real jars** as you pick; gated until exactly 6)
  - *Single Jar* (flavour picker + quantity)
  - Per-order options: **Sweetness** (Sugar / No Sugar), **Serve** (Hot / Cold), **Milk** (With Milk / Soy Milk)
- **Cart** with line items (single jars + boxes with contents summary), quantity steppers, remove, live subtotal/delivery/total.
- **Checkout** UI: contact, self-delivery address + area + time-window pickers, **Stripe card form** and **PayNow QR** tabs, order summary, validation gating.
- **Confirmation** screen with order number, delivery window, amount, payment method.
- **Shopkeeper admin** (footer link "店主管理 · Shopkeeper"): add/edit/duplicate/reorder/hide/delete flavours, edit jar colour & options, edit pricing, edit delivery (free-threshold, flat fee, time windows, areas + per-area fees), **export/import catalog JSON**, reset to defaults. **Currently persists to `localStorage`.**
- **Pricing & delivery rules**: $15.80 single jar · $68 box of six · **free delivery over $50, else $6 flat** (per-area overrides supported).
- **Brand & motion**: handmade logo + 6 alternative logo marks; 6 jar designs (classic/jam/apothecary/premium/mason/minimal); koi & blue fish burst on every button press; ~2.6s celebratory fish "swim" across the screen on order placement; 3D auspicious gift box. All animations respect `prefers-reduced-motion`.
- **Responsive** for phone + desktop. **Tweaks panel** (design-time only) toggles theme/type/logo/jar/hero/checkout variants — this is a design tool, **not** a customer feature; it can be dropped in production.

## ⛔ What Still Needs To Be Done (needs a server / accounts)
1. **Stripe card payments** — real Payment Intents + Stripe Elements + webhook. The current card form is a visual mock.
2. **PayNow** — real dynamic PayNow QR (Stripe supports PayNow as a payment method in Singapore; or use a PSP like HitPay). The current QR is decorative.
3. **Order persistence** — write placed orders to a database; generate the order number server-side; send confirmation (email via Resend, optional SMS via Twilio).
4. **Shared catalog & delivery config** — move the Shopkeeper data out of `localStorage` into the database via API routes so edits are shared across staff/devices. Add **auth** for the admin (password or Supabase Auth).
5. **Delivery ops** (self-delivery) — store chosen area + time window on the order; optionally an internal orders dashboard / route list for the team.
6. **Deploy** — Next.js app to Vercel; set environment variables; point a domain.

---

## Screens / Views

### 1. Shop (landing) — `design/shop.jsx` → `ShopScreen`
- **Purpose**: introduce the brand, surface the two packs and six flavours, drive to PDP.
- **Layout**: sticky header (logo left, cart button right, height 74px). Hero is a 2-col grid (`1.05fr .95fr`, gap `clamp(30px,5vw,72px)`), copy left / floating jars right. Below: a wave divider, a centered "Choose Your Jars" section with 2 bundle cards (`max-width:860px`), a centered "Six Flavours" section with a 3-col flavour grid (`gap:22px`), another wave, the benefits section (2-col on `--paper` background), the gift section (`360px 1fr` grid), footer.
- **Key components**: `Header`, `Hero`, `BundleCard`, `FlavorCard`, `Benefits`, `GiftBlock` (renders `GiftBox3D`), `Footer`.
- **Hero title**: Cormorant Garamond, `clamp(42px,6.4vw,82px)`, line-height 1.02; the word "Eight Treasures" is italic in cinnabar.

### 2. Product Detail (PDP) — `design/shop.jsx` → `ProductScreen`
- **Purpose**: pick a pack, configure it, add to cart.
- **Layout**: 2-col grid (`1fr 1fr`). Left = product art (single jar, OR the 3D gift box for box packs; art is `position:sticky; top:80px` for boxes). Right = info column: eyebrow, title, blurb, **Pack selector (first)**, then a flavour control that adapts to the pack, then options, then quantity/box-note, then price + Add button.
- **Pack selector**: 3 chips (`.chip-pack`, min-height 78px) — title / sub-label / price stacked.
- **Mix & Match**: `.mix-list` of rows, each with a colour swatch, name, and a −/+ stepper. A `mixTotal / target` counter turns cinnabar at 6/6. Add button is disabled and reads "Pick N more · 還差 N" until 6.
- **Ghost-fill effect**: in box-mix mode the gift box receives a `slots` array (length 6) of real-jar `{tone}` or `null`; nulls render `.gb3-ghost` shimmering skeletons; real jars animate in with `gb3-pop`. Driven by the `fill` prop on `GiftBox3D`.

### 3. Cart — `design/checkout.jsx` → `CartScreen`
- 2-col grid (`1fr 360px`): line items left, sticky order summary right. Box line items show a fanned 3-jar thumbnail (`BoxThumb`) and a contents summary ("1× Matcha · 1× Sesame …"). Empty state offers a "Shop the jars" button. Free-delivery hint shows how much more to spend.

### 4. Checkout — `design/checkout.jsx` → `CheckoutScreen`
- Step pills (Cart / Checkout / Done). Left = three blocks: **Contact**, **Delivery** (address/unit/postal, **Area** chips, **Time-window** chips, note), **Payment** (Card / PayNow tabs). Right = sticky summary with per-line breakdown, subtotal, delivery, total, pay button (disabled until valid). Card tab shows Stripe-style fields; PayNow tab shows a QR + UEN. **Both are mock UI to be wired to Stripe.**

### 5. Confirmation — `design/checkout.jsx` → `ConfirmScreen`
- Centered card: logo, "Order Confirmed", thank-you copy, meta row (Order #, Delivery window, Paid amount + method), self-delivery note, "Back to shop". Reached **after** the ~2.6s fish-swim animation completes.

### 6. Shopkeeper admin — `design/admin.jsx` → `AdminScreen`
- Own sticky header + tabs: **Products / Delivery / Backup**.
- **Products**: pricing inputs (both packs), then a reorderable flavour list (▲▼, colour swatch, name, Live/Off toggle, Edit/Duplicate/Delete). Edit opens a modal (`ProductEditor`) with bilingual name fields, jar-colour swatches, description, ingredient tags, option toggles, availability.
- **Delivery**: free-threshold + flat-fee inputs, customer note, editable time windows (add/edit/remove), editable areas (name/中文/fee/remove).
- **Backup**: export catalog JSON (downloads `joyjar-catalog.json`), import, reset to defaults.

---

## Interactions & Behavior
- **Navigation**: single-page state machine in `app.jsx` (`screen` ∈ shop/product/cart/checkout/confirm/admin). Recreate as Next routes (`/`, `/product/[…]` or a configurator route, `/cart`, `/checkout`, `/order/[id]`, `/admin`).
- **Add to cart dedupe**: items keyed by product+bundle+options; boxes keyed by mode+contents+options (`keyOf` in `app.jsx`).
- **Fish bursts**: any element with `data-fish` (and not `data-nofish`) spawns 5 fish at the cursor on click (`fish.jsx` → `bindFishClicks`). Koi/blue chosen at random.
- **Checkout swim**: `checkoutSwim()` animates ~16 fish across a wavy diagonal path for ~2.6s, then routes to confirmation. Order is created after the swim.
- **Ghost→real pop**: `gb3-pop` scale-bounce (0.5s), shimmer on ghosts (`gb3-shimmer`, 1.5s loop).
- **Hover**: gift-box lid lifts; cards lift with shadow; buttons translate.
- **Reduced motion**: all the above are disabled under `prefers-reduced-motion: reduce`.
- **Validation**: checkout pay button requires name + phone + address, and (card) number+exp+cvc OR (paynow) nothing extra.

## State Management
- **Cart**: array of items; each `{productId,bundleId,qty,options}` or box `{box:true,mode,bundleId,qty,options,contents:[{productId}]}`.
- **Catalog/Delivery** (`store.jsx`): `{products, bundles, delivery}` mirrored to `window.PRODUCTS/BUNDLES/DELIVERY`, persisted to `localStorage` key `joyjar_store_v2`, with a subscriber pattern. **Replace with DB + API + server cache (e.g. React Query / RSC fetch).**
- **Order**: `{form, slot, zone, pay, total, num}`. **Generate `num` and persist server-side in production.**

## Design Tokens (from `design/styles.css` `:root`)
- **Colors**: bg `#f6f4f0` · paper `#fbf9f5` · paper-2 `#f1ede5` · ink `#2c2823` · ink-soft `#766c5f` · ink-faint `#a89e8f` · hairlines `rgba(70,52,28,.14)` / `.26` · gold `oklch(0.60 0.066 76)` · gold-soft `oklch(0.78 0.05 80)` · cinnabar `oklch(0.56 0.16 33)`. Theme variants (jade, ink) redefine gold/cinnabar — see the `html[data-theme=…]` rules.
- **Fonts**: display = Cormorant Garamond; 中文 = Noto Serif TC; body/UI = Hanken Grotesk. (Google Fonts; weights 400–700.)
- **Radius**: chips 10–12px, cards 16–18px, pills/buttons 999px, confirm card 24px.
- **Shadow**: `--shadow: 0 24px 60px -28px rgba(60,40,20,.45)`.
- **Container**: `--wrap: 1180px`; section padding `clamp(40px,6–7vw,80–100px)`.
- **Jar colours** (per flavour): `TONES` map in `design/data.jsx` (dessert/dessertTop/label/labelInk/swatch + EN/ZH names).

## Assets
- `design/assets/logo.png` — the handmade circular JoyJar logo (transparent PNG). Used as header mark, favicon, gift section, confirmation. All other graphics (jars, fish, gift box, QR placeholder, seals) are **pure CSS/SVG drawn in code** — no other image assets. **Replace the decorative PayNow QR with a real generated QR.**

## Brand — Fixed Choices
- **Logo mark: Circle Seal** (`logoStyle: "circle"`) — a gold-ringed circle with the cinnabar 膠 character on a cream ground. This is the resolved brand identity; **do not change it in production.**
- **Jar design: Classic** (`jarStyle: "classic"`) — the original rounded glass jar with a metal lid, coloured label band, and bilingual name text. Fixed for the launch range; the design file (`design/jars.jsx`) contains five additional jar variants (jam, apothecary, premium, mason, minimal) that may be revisited for limited editions.

## Files (in `design/`)
| File | Contains |
|---|---|
| `JoyJar Shop.html` | Entry point; loads fonts, CSS, and all JSX in order |
| `data.jsx` | Default catalog (6 flavours), bundles/pricing, delivery defaults, `TONES`, option groups, benefits |
| `store.jsx` | localStorage-backed store + `Store` API (CRUD, export/import) — **port to DB** |
| `app.jsx` | Routing, cart state, order placement, Tweaks wiring |
| `shop.jsx` | `ShopScreen`, `ProductScreen` (PDP + pack logic), hero, cards |
| `checkout.jsx` | `CartScreen`, `CheckoutScreen`, `ConfirmScreen`, delivery math |
| `admin.jsx` | `AdminScreen` (Shopkeeper) + product editor modal |
| `components.jsx` | Logo mark, buttons, labels, qty stepper, admin form controls |
| `jars.jsx` | `Jar` — 6 jar designs (SVG) |
| `giftbox3d.jsx` + `giftbox3d.css` | 3D gift box (real + ghost jars) |
| `brand.jsx` | Logo variants + `Logo` |
| `fish.jsx` | Fish SVGs + click-burst + checkout-swim engine |
| `tweaks-panel.jsx` | Design-time Tweaks shell — **omit in production** |
| `styles.css` | All design tokens + component styles |

---

## Suggested Production Architecture (Next.js + Vercel)
- **App**: Next.js App Router. One React component per screen; shared UI in `components/`. Port `styles.css` tokens into CSS variables / Tailwind theme. Keep the SVG jars/fish/box as components.
- **Data**: `products`, `bundles`, `delivery_config`, `zones`, `time_slots`, `orders` tables. Public read for catalog; admin write behind auth. Replace `store.jsx` with API routes (`/api/catalog`, `/api/delivery`) + DB.
- **Payments**:
  - **Card + PayNow via Stripe** — create a PaymentIntent server-side (`/api/checkout`), confirm with Stripe Elements / the PayNow payment method (SGD), handle the `payment_intent.succeeded` **webhook** to mark the order paid. Keep `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` server-only.
  - Alternative for PayNow if not using Stripe: a local PSP (e.g. HitPay) that returns a dynamic PayNow QR.
- **Orders**: on webhook success, persist the order (contents, options, delivery area + window, amount), email the customer (Resend) and optionally SMS (Twilio).
- **Admin auth**: simplest = a single shared password in an env var gating `/admin`; better = Supabase Auth / Clerk.
- **Env vars (Vercel)**: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY` (opt), `TWILIO_*` (opt), `ADMIN_PASSWORD`.
- **Deploy**: push to GitHub → import in Vercel → set env vars → add the Stripe webhook endpoint (`/api/stripe/webhook`) in the Stripe dashboard → point your domain.

### Hand this to Claude Code
> "Recreate the JoyJar storefront (in `design/`) as a Next.js App-Router app with Tailwind, matching `styles.css` tokens pixel-for-pixel. Build a Postgres schema for products/bundles/delivery/orders, replace the localStorage `Store` with API routes, add a password-gated `/admin`, integrate Stripe for card + PayNow (PaymentIntents + Elements + webhook), persist orders and email confirmations with Resend. Keep all SVG jars/fish and the 3D gift box and the checkout fish-swim. Deploy to Vercel."

---

## Note on imagery / brand
The jar concept references a generic glass-jar dessert format; all JoyJar branding here (logo, seals, jar art, gift box) is original to this project. Swap in real product photography and any finalized logo when available.
