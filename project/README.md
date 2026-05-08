# Terminal Design System (TDS) v1.1 — Forge Dark

Source of truth for the **Terminal** mobile app — a marketplace for heavy industrial assets (cranes, trucks, warehouses, container yards, laydown areas) targeting Nigerian operators. React Native primary; web responsive secondary.

This folder is a design skill: drop it into a Claude Code project (`.claude/skills/`) or use it in design conversations to generate on-brand interfaces, mockups, and prototypes.

---

## What Terminal is

> **Industrial heat.** The glow of a forge, a crane warning light at night, a port floodlamp through dust. *Working machinery orange*, not startup orange.

Operators using this app are usually outdoors, often in a hurry, on a phone in bright sun. The design is dark, dense, technical, and confident in negative space. Monospaced numbers signal precision. Compressed display type recalls shipping container markings and equipment plates.

**It does not look like:** pastel fintech, friendly mascots, gradients, glassmorphism, soft rounded everything, stock-photo heroes.

---

## Sources

The design system in this folder was distilled from:

- **`Design System/TERMINAL_DESIGN_SYSTEM.md`** (local mount, ~1166 lines) — the canonical brief covering tokens, components, screens, status matrix, voice, and copy rules.
- **`Design System/API_REFERENCE.md`** (local mount) — backend contract; field-by-field mapping in §13 of the brief.
- **`Design System/terminal_design_system.html`** (local mount) — interactive reference page that previews tokens and components in HTML.
- **GitHub: `Nwa-dev/Terminal`** (private) — Django backend (no frontend code). Folders: `accounts/`, `bookings/`, `listings/`, `messaging/`, `search/`. Confirms the data shapes the design references; does not contain UI source.

> No mobile/web frontend source code exists yet — this design system is the spec **from which** the frontend will be built. UI kit components in `ui_kits/` are the first reference implementation.

---

## Content fundamentals

### Voice
**Direct. Operator, not assistant. Like dispatch, not customer service.**

| ✅ Do | ❌ Don't |
|---|---|
| "Listing went live." | "Yay! Your listing is now live 🎉" |
| "Booking confirmed for May 10–13." | "Your booking has been successfully confirmed!" |
| "Owner declined. Try another listing nearby." | "Oops, something went wrong." |
| "₦45,000 — daily rate." | "Just ₦45,000 a day!" |
| "Couldn't reach the server. Tap to retry." | "We'd love to help you get reconnected!" |

### Casing & punctuation
- **Display type is uppercase only.** Always. "FIND HEAVY ASSETS NEAR YOU", not "Find heavy assets…".
- **Body type is sentence case.** Titles, descriptions, button labels.
- **No exclamation marks.** No emoji in user-facing copy.
- **Em dashes for asides** ("₦45,000 — daily rate"). En dashes for ranges ("May 10 – May 13").

### Pronouns
- Avoid "we" — Terminal is infrastructure, not a friend. Prefer imperative ("Find your first listing") or passive system-voice ("Owner declined").
- "You" only when necessary for action ("You don't have access to this.").

### Empty states are imperative
Tell the operator the next move, with a primary button.

> ❌ "You have no bookings yet."
> ✅ "Find your first listing." → `[ Find equipment ]`

### Errors are actionable
Tell them what to do.

> ❌ "Something went wrong"
> ✅ "Couldn't reach the server. Tap to retry."

### Numbers
- **Currency:** `₦45,000` — Naira symbol, comma-separated, no decimal, no space. `Intl.NumberFormat('en-NG', {style:'currency', currency:'NGN', maximumFractionDigits:0})`.
- **Distance:** `3.4 km` — one decimal, lowercase unit, single space.
- **Duration:** `3 days`, `1 week`, `2 months`.
- **Date range:** `May 10 – May 13` — en dash, no year if same year as today.
- **Codes / specs:** mono font. `BK-2026-0142`, `500 TEU`, `12 acres`.

---

## Visual foundations

### Color
- **One accent per screen — Forge Orange (`#E8750A`).** Reserved for the *single* primary action, the selected map pin, and the active tab. Never decorative.
- **Categories are encoded by icon, not color.** All five resource types (equipment, vehicle, warehouse, terminal, facility) use the same neutral surfaces; the icon is the differentiator.
- **Status colors are semantic and never reverse:**
  - Green (`#16A34A`) — success / available / active
  - Blue (`#3B82F6`) — info / confirmed
  - Amber (`#F5A623`) — pending / warning
  - Red (`#EF4444`) — danger / declined
- **Cards never have colored fills.** Status emphasis is a 3 px **left border** accent.
- **Tertiary text never carries meaning** — hints and dividers only.

### Type
Three families. Never mix display into body or body into display.
- **Barlow Condensed 700** — display, *uppercase only*. Recalls equipment plates and stencilled container markings.
- **IBM Plex Sans 400/500/600** — headings + body, sentence case.
- **IBM Plex Mono 400** — prices, distances, specs, codes, timestamps. Anything that's *standalone numeric data*. (Numbers in running prose stay in Plex Sans — "I have 3 friends" is sans.)
- Maximum **4 sizes per consumer screen**.

### Spacing & layout
- **4 px base unit.** Approved scale: `4 8 12 16 20 24 32 40 48 64 80 96`. No 14, 18, 28.
- **Mobile screen padding:** 20 px horizontal, 16 px vertical between sections.
- **List rows:** ≥ 56 px tall (tap target).
- **Bottom tab bar:** 56 px + safe area.
- **Card grid gutter:** 12 px.
- **Map is full-bleed on mobile.** Controls float over it.
- **Bottom sheets on mobile, centered modals on web ≥ 1024 px.**

### Backgrounds & textures
- **Solid abyss (`#0C0C0F`) everywhere.** No gradients, no patterns, no glass.
- **Photography is the only imagery surface.** Listing hero photos, owner avatars. Tinted toward warm neutrals; no candy filters.
- **Mapbox dark style, custom Forge tint.** That's the only "image" most screens carry.

### Borders > shadows (the elevation rule)
Forge Dark uses **borders, not drop shadows**. Shadows look smudgy on dark. Elevation is communicated by:
1. A lighter surface token (`--surface-elevated` over `--surface`).
2. A 1 px `--border` outline.
3. A 3 px **left accent border** for status emphasis (e.g. active booking row).

Single exception: bottom sheets get `0 -8px 32px rgba(0,0,0,0.4)` to lift them off the map.

### Corner radii
- `0` — equipment-plate edges, full-bleed banners
- `4 px` — buttons, inputs, badges (non-pill)
- `8 px` — cards, listing tiles
- `12 px` — bottom sheets (top corners only), drawers
- `999 px` — status badges, chips, filter pills

### Cards
- Background `--surface`. **Border 1 px `--border`.** Radius 8.
- Default padding 16. Compact 12, spacious 20.
- **Color emphasis is the left border accent (3 px), not the fill.** This is the visual signature for active bookings, featured listings, requires-action rows.

### Hover & press states (web)
- **Hover:** `opacity: 0.88` on buttons; `--surface-high` on cards.
- **Press:** background → `--forge-mid` (primary CTAs) or `--bg-hover`.
- **Tap (mobile):** scale to 0.97 over 80 ms, return on release. Cards and primary buttons.
- **Disabled:** `opacity: 0.4`, no hover effect.

### Motion
- **Default duration 200 ms.** Sheets 280 ms. Tap feedback 80 ms.
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard) for screen transitions; `cubic-bezier(0.2, 0, 0, 1)` for sheets sliding up.
- **Skeleton shimmer:** 1.5 s loop, gradient `--surface` → `--surface-high` → `--surface`.
- **Reduce motion:** when OS prefers, all motion → 0 ms (spinner exempt).
- No bouncy springs, no parallax, no decorative motion.

### Transparency & blur
- **Map overlays only.** Search input on map: `rgba(19,19,24,0.92)`. Distance chip on listing card: `rgba(12,12,15,0.85)`. Backdrop behind sheet: `rgba(0,0,0,0.6)`.
- **No `backdrop-filter: blur` anywhere.** This is dark, technical, opaque.

### Imagery feel
Listing photos should read as **on-the-job, mid-day, slightly dusty.** Warm neutrals, real machinery, real yards. Avoid magazine-shoot polish, soft pastels, or stock-photo blue-hour drone shots.

---

## Iconography

**Library:** [Tabler Icons](https://tabler.io/icons) (`@tabler/icons-react-native`). Strokes match the technical, precise feel; consistent 24 px grid; outline-first.

- **Stroke weight:** 1.5 px default; 2 px for primary actions.
- **Sizes (only):** 16 / 20 / 24 / 32. No others.
- **Color:** inherits `currentColor` from parent text.
- **Loaded via CDN** in this skill via `https://unpkg.com/@tabler/icons-webfont@latest/dist/tabler-icons.min.css`. Local `assets/icons/` holds custom equipment glyphs.

### Custom equipment glyphs
For the five resource types we ship custom 24 px outline icons (in `assets/icons/`):

| Glyph | Resource type |
|---|---|
| `equipment` | crane silhouette |
| `vehicle`   | flatbed truck silhouette |
| `warehouse` | warehouse with door |
| `terminal`  | stacked containers |
| `facility`  | fenced compound |

**Color encodes selection, not category.** A selected map pin is Forge orange regardless of resource type; the icon inside the pin tells you what it is.

### Emoji & unicode
- **Emoji are forbidden in product copy.** Internal docs only.
- **Unicode used as glyphs:** `₦` (Naira sign — currency prefix), `·` (middle dot — meta separator), `–` (en dash — date ranges), `●` (filled circle — availability dot), `✓` (check — paid status), `▾` (down arrow — filter chips, only when essential). All others come from Tabler.

---

## Index — what's in this folder

| Path | What it is |
|---|---|
| `README.md` | This file — overview, content rules, visual rules, iconography, index. |
| `colors_and_type.css` | All design tokens as CSS custom properties + semantic typography classes. **Import this first** in any artifact. |
| `SKILL.md` | Skill manifest. Instructions for Claude when this skill is invoked. |
| `assets/` | Logos, custom equipment glyphs, brand marks, sample listing photography. |
| `fonts/` | Webfont references (currently CDN-loaded via `colors_and_type.css`; local TTFs flagged as TODO — see Caveats). |
| `preview/` | HTML cards used by the Design System tab — one card per token cluster / component. |
| `ui_kits/mobile_app/` | First reference implementation: React (JSX) recreation of core mobile screens — Map, Listing detail, Request booking, Thread, Owner dashboard. `index.html` is the click-thru prototype. |
| `Design System/` | Original brief assets (mounted read-only): `TERMINAL_DESIGN_SYSTEM.md`, `API_REFERENCE.md`, `terminal_design_system.html`. |

---

## Caveats / TODO

- **Fonts are CDN-loaded** (jsDelivr `@fontsource/*`). For offline / production work, drop the TTF files into `fonts/` and update `colors_and_type.css` `@font-face` rules.
- **No frontend source code in the Terminal repo yet** — UI kit is built from the brief, not reverse-engineered from production. Pixel parity will need a pass once a real RN/web app exists.
- **Mapbox style URL** referenced in §15.8 is a placeholder. The real custom Forge-tinted style needs to be created in Mapbox Studio.
- **Map pin SVGs** in `assets/icons/` are minimal outline glyphs derived from Tabler primitives. If brand wants bespoke equipment artwork, this is a swap-out point.
- **Listing photography** in `assets/photos/` is generic placeholder until real Terminal-shot imagery exists.
