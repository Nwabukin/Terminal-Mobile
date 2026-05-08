# Terminal Design System — skill

You are designing for **Terminal**, a Lagos-based mobile marketplace for heavy industrial assets (cranes, trucks, warehouses, container yards, laydown areas). Use this skill when the user asks for Terminal screens, mockups, prototypes, marketing surfaces, or anything else that should look like the Terminal product.

## What this skill is for

- Mobile screens (renter and owner flows): map, listing detail, booking flow, inbox, owner dashboard, listing wizard.
- Marketing pages, pitch decks, internal tools, and email — anything that needs to read as Terminal.
- New screens or components that don't yet exist in the kit. Use the system; don't reinvent it.

## Read these first, in order

1. **`README.md`** — full design brief. Tone, voice, color, type, spacing, components, copy rules, the "do not" list. Read end-to-end.
2. **`colors_and_type.css`** — the canonical token file. Import it directly into any new HTML you produce. Do not redefine these values.
3. **`ui_kits/mobile_app/index.html`** — reference implementation of seven core screens. Read the JSX components in `ui_kits/mobile_app/components/` before drawing anything new — most things you need already exist.
4. **`preview/`** — one HTML card per token group / component. Open the relevant cards to see the system in isolation before composing.

If the user mentions a backend field or API shape, check `Design System/API_REFERENCE.md` (local mount) and §13 of `Design System/TERMINAL_DESIGN_SYSTEM.md` (local mount). The data shapes are real.

## The non-negotiables

These are what make Terminal *Terminal*. If you find yourself violating one, stop and reconsider.

- **Forge dark.** Background is `#0C0C0F`. No light mode. No gradients. No glassmorphism. No patterns.
- **One accent per screen.** Forge Orange (`#E8750A`) marks the single primary action, the selected map pin, the active tab. Never decorative, never two at once.
- **Borders, not shadows.** Elevation is a lighter surface + 1 px border. Status emphasis is a 3 px **left** border. The only allowed shadow is under bottom sheets.
- **Categories are encoded by icon, not color.** All five resource types share neutral surfaces.
- **Display type is uppercase, always.** Barlow Condensed 700, never sentence case. Body is IBM Plex Sans, sentence case. Numeric data is IBM Plex Mono.
- **Max 4 type sizes per screen.**
- **4 px spacing scale.** `4 8 12 16 20 24 32 40 48 64 80 96`. No 14, 18, 28.
- **Square-ish corners.** 0 / 4 / 8 / 12 / 999. Buttons are 4. Cards are 8. Bottom sheets are 12 (top only). Pills are 999.
- **Voice is dispatch, not customer service.** Imperative, terse, no exclamations, no emoji, no "we", no "oops". See README "Content fundamentals" — match the tone exactly.
- **Currency:** `₦45,000` — Naira symbol, comma, no decimal, no space.

If a request seems to require breaking one of these (e.g. "make it light mode", "add a celebratory toast"), push back once and ask the user to confirm before complying.

## How to compose a new screen

1. **Start from the kit.** `ui_kits/mobile_app/components/` has `Button`, `ListingCard`, `BookingRow`, `Badge`, `MapPin`, `BottomSheet`, `TopBar`, `TabBar`, `Input`, etc. Import them; don't redraw them.
2. **Frame in an `ios_frame.jsx`** for mobile. Status bar is `9:41`, never `12:34` or `10:00`.
3. **Lay out with the spacing scale.** 20 px horizontal screen padding, 16 px between sections, 12 px card grid gutter.
4. **Pick the one primary action.** Everything else is secondary or ghost.
5. **Write copy as if you're a dispatcher.** Empty states command the next move. Errors say what to do.
6. **Use real-feeling Lagos data.** Listings on Lagos Island, Apapa, Tin Can; Naira prices; Nigerian operator names. Avoid Stripe/Acme/Lorem.

## Variations and tweaks

When the user asks for "a few options" or "explore directions," vary within the system:
- Layout density (compact list vs. card grid vs. map-first).
- Information hierarchy (price-first vs. distance-first vs. status-first).
- Empty/loaded/error states of the same screen.
- Owner perspective vs. renter perspective of the same flow.

Do **not** vary by introducing new colors, gradients, or breaking the type system. Those aren't "options," they're a different product.

## What this skill is *not* for

- Light-mode UI, consumer fintech, friendly mascots, or anything that wants to feel "fun." Terminal is infrastructure.
- Web marketing pages with stock-photo heroes. Use real listing photography or industrial textures.
- Other marketplaces (Uber, Airbnb, etc.). The vocabulary is industrial, not hospitality.

## File index

- `README.md` — the full brief
- `SKILL.md` — this file
- `colors_and_type.css` — tokens + `@font-face` declarations
- `assets/` — logos, icons, fonts
- `preview/` — one card per token group / component
- `ui_kits/mobile_app/` — reference React mobile screens
