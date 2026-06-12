# National Bourré League

This repo contains two front-ends:

1. **React app** (`src/`, Vite + TypeScript) — teaches Bourré: Home, a Rules
   reference (standard + house-rule placeholders), an interactive Tutorial, and an
   in-memory Private Room (invite code, scorekeeping, risk points).
2. **Static social app** (`docs/`, modular vanilla JS, no build step) — adds
   Firebase Authentication and protected Private Rooms / Leagues. It is kept
   static-friendly for GitHub Pages (serve from `/docs`).

## Project layout

- `src/screens/` — React screens: `HomeScreen`, `RulesScreen`, `TutorialScreen`,
  `PrivateRoomScreen`.
- `src/components/` — `PlayingCard` and `Hand` render the elegant card visuals.
- `src/data/` — content is data-driven: `rules.ts` (rule text + house-rule
  placeholders) and `tutorial.ts` (the step-by-step hand walkthrough).
- `src/types.ts` — `Card`/`Suit`/`Rank` model and helpers.
- `docs/` — the static social app: `index.html`, `styles.css`, `firebase-config.js`
  (placeholder config), `auth.js` (Firebase Auth wrapper), `app.js` (session +
  protected views). No payment/wallet/money features anywhere.

## Cursor Cloud specific instructions

- Standard scripts live in `package.json`: `npm run dev` (Vite dev server),
  `npm run lint` (ESLint), `npm run build` (`tsc -b && vite build`).
- The dev server runs on port **5173** and is configured with `server.host: true`
  in `vite.config.ts`, so it is reachable from outside the VM. Use `npm run dev`
  (development), not `npm run build`/`preview`, for iterating.
- Routing is a simple `useState` screen switch in `src/App.tsx` (no router
  library); add a screen by extending the `Screen` union and the `<main>` switch.
- The Tutorial's interactive "pick the legal play" logic is driven entirely by the
  `interactive-trick` step data in `src/data/tutorial.ts` (`legalIdx`, `bestIdx`,
  `explain`). Change the lesson by editing that data, not the component.

### Static social app (`docs/`) + Firebase Auth

- The `docs/` app has **no build step**: the Firebase Web SDK is imported from the
  gstatic CDN in `auth.js` (version pinned in `firebase-config.js`). Serve it as
  static files — `npm run social` (serves `docs/` on port 8080) or any static
  server. Do not run it through Vite.
- `firebase-config.js` is a **placeholder**; real keys are not committed. It
  auto-connects to the Firebase **Auth emulator** when served from `localhost`
  (`AUTH_EMULATOR_URL`), so local dev needs no real Firebase project.
- To exercise auth locally, start the emulator with `npm run emulators` (Auth on
  `127.0.0.1:9099`, emulator UI on `:4000`; requires Java, already present). Then
  open the app via `localhost:8080`. Clear test users with:
  `curl -X DELETE "http://127.0.0.1:9099/emulator/v1/projects/demo-national-bourre-league/accounts"`.
- Gotcha: anything toggled via the HTML `hidden` attribute must keep working even
  when its CSS class sets `display`. `styles.css` has a global
  `[hidden]{display:none!important}` reset — keep it, or modals/menus render
  permanently open.
- Gotcha: on email sign-up, `createUserWithEmailAndPassword` fires
  `onAuthStateChanged` *before* `updateProfile` sets the display name, and a
  profile update does not re-emit the event. `app.js` therefore applies the
  returned user via `setSession()` after sign-up so the display name shows
  immediately (otherwise the UI falls back to the email prefix until reload).
