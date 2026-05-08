## Cursor Cloud specific instructions

### Project overview

This repository is **Terminal Mobile** — a React Native (Expo) mobile marketplace app for heavy industrial asset leasing (cranes, trucks, warehouses, container yards) targeting Nigerian operators. The codebase was built from a design handoff bundle using the **Terminal Design System (TDS) v1.1 "Forge Dark"**.

### Relevant services

| Service | Command | Notes |
|---------|---------|-------|
| Expo dev server (web) | `cd terminal-mobile && npx expo start --web --port 8081` | Primary dev entry point. No simulator needed for web. |
| Expo dev server (native) | `cd terminal-mobile && npx expo start` | Requires iOS Simulator or Android Emulator (not available in Cloud). |

### Key commands

- **TypeScript check**: `cd terminal-mobile && npx tsc --noEmit`
- **Web export/build**: `cd terminal-mobile && npx expo export --platform web`
- **Start dev server**: `cd terminal-mobile && npx expo start --web --port 8081`
- **Install deps**: `cd terminal-mobile && npm install`

### Design system reference

The design system source files live in `/workspace/project/` and are symlinked at `terminal-mobile/design-system/`. Key reference files:
- `project/README.md` — full design brief (voice, color, type, spacing, components)
- `project/SKILL.md` — skill manifest for generating on-brand UI
- `project/colors_and_type.css` — canonical CSS token file
- `project/ui_kits/mobile_app/` — JSX reference implementation of 7 core screens

### Gotchas

- The backend API (`Nwa-dev/Terminal` on GitHub) is a separate private Django REST repo. It is **not** included in this workspace. API calls will fail without it; the app still loads and renders UI.
- `@tabler/icons-react-native` uses `strokeWidth` (not `stroke`) for icon stroke width. `stroke` maps to `SvgProps.stroke` which expects a `ColorValue`.
- Expo web mode requires `react-dom` and `react-native-web` — both are installed.
- The app uses `expo-splash-screen` for splash screen management; it must be explicitly installed (not bundled by default with the blank template).
- Currency is Nigerian Naira (`₦`). Use `formatCurrency()` from `src/utils/format.ts`.
- Wave task files (`MOBILE_WAVE_00_PROJECT_SETUP.md` through `MOBILE_WAVE_04_OWNER_POLISH.md`) contain step-by-step build instructions for each feature wave.
