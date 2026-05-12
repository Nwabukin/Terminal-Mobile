## Cursor Cloud specific instructions

### Project overview

This repository is **Terminal Mobile** — a React Native (Expo) mobile marketplace app for heavy industrial asset leasing (cranes, trucks, warehouses, container yards) targeting Nigerian operators. Built from the **Terminal Design System (TDS) v1.1 "Forge Dark"**. All 5 waves (00-04) are implemented — the app is MVP-complete.

### Relevant services

| Service | Command | Notes |
|---------|---------|-------|
| Expo dev server (web) | `cd terminal-mobile && npx expo start --web --port 8081` | Primary dev entry point for Cloud. |
| CORS proxy | `cd terminal-mobile && node proxy.js` | Required for web dev — proxies API through localhost:3456 to bypass CORS. Start before the Expo dev server. |
| Expo dev server (native) | `cd terminal-mobile && npx expo start` | Requires iOS Simulator or Android Emulator. |

### Key commands

- **Install deps**: `cd terminal-mobile && npm install`
- **Web export/build**: `cd terminal-mobile && npx expo export --platform web`
- **TypeScript check**: `cd terminal-mobile && node --stack-size=16384 ./node_modules/.bin/tsc --noEmit` (larger stack required for Tabler icons)
- **Start dev** (web): Start CORS proxy first (`node proxy.js &`), then `npx expo start --web --port 8081`
- **Native build**: `npx expo prebuild --clean` (after native dependency changes)

### Backend

The API is at `https://terminalv2-production.up.railway.app/`. On web, requests route through a local CORS proxy (`proxy.js` on port 3456). On native, requests go directly to the Railway URL. The `API_BASE_URL` constant in `src/utils/constants.ts` handles this platform split.

The map list endpoint is `GET /api/v1/search/map/` with `lat`, `lng`, `radius`, optional `resource_type`, `available`, and optional text search: the app sends **`search`** (Django REST `SearchFilter` default) and **`q`** (common alias) with the same trimmed string so the terminalv2 backend can honor either.

Test account: `testmobile@terminal.app` / `TestPass123!`

### Maps setup

Native map uses **`@maplibre/maplibre-react-native`** with a bundled **dark raster style** (CARTO `dark_all` tiles, OSM data). **No Google Maps billing or API keys** are required. The Expo config plugin `@maplibre/maplibre-react-native` is listed in `app.config.ts` `plugins` for native prebuilds.

Web uses `TerminalMap.tsx` (non-interactive dark placeholder, no API key).

### Design system reference

Source files at `/workspace/project/`, symlinked at `terminal-mobile/design-system/`. Key files:
- `project/README.md` — full brief (voice, color, type, spacing, components)
- `project/SKILL.md` — skill manifest for on-brand UI generation
- `project/ui_kits/mobile_app/` — JSX reference implementation of 7 core screens

### Architecture

| Layer | Implementation |
|-------|----------------|
| Navigation | React Navigation — `RootNavigator` switches Auth vs Main; Main switches `RenterTabs`/`OwnerTabs` based on `activeRole` in `appStore` |
| State | Zustand — `authStore` (user/tokens), `appStore` (role/filters) |
| Data fetching | TanStack React Query with stale time, retry, and refetch intervals |
| Storage | `src/utils/storage.ts` — abstracts `expo-secure-store` (native) and `localStorage` (web) |
| Real-time | Ably via `useAbly` hook, falls back to 10s polling |
| Forms | react-hook-form + Zod validation |

### Gotchas

- `@tabler/icons-react-native` uses `strokeWidth` (not `stroke`) for width. `stroke` maps to SVG stroke color.
- TypeScript `tsc --noEmit` requires `--stack-size=16384` due to Tabler icons barrel export (5000+ icons cause stack overflow at default size). Use `npx expo export --platform web` as a faster build check.
- `expo-secure-store` throws on web — all code uses `src/utils/storage.ts` abstraction instead of direct imports.
- The CORS proxy (`proxy.js`) must be running for web dev. Without it, API calls fail silently in the browser.
- Currency is Nigerian Naira (`₦`). Use `formatCurrency()` from `src/utils/format.ts`.
- Wave task files (`MOBILE_WAVE_00_PROJECT_SETUP.md` through `MOBILE_WAVE_04_OWNER_POLISH.md`) contain the original build specs.
