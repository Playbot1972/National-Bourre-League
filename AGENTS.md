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
  (placeholder config), `auth.js` (Firebase Auth wrapper), `firestore.js`
  (Firestore data model + persistence), `app.js` (session + protected views).
  `firestore.rules` holds sample security rules. No payment/wallet/money features.

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
- To exercise auth + data locally, start the emulators with `npm run emulators`
  (Auth on `127.0.0.1:9099`, Firestore on `127.0.0.1:8088`, emulator UI on `:4000`;
  requires Java, already present). Then open the app via `localhost:8080`. Clear
  test data with:
  `curl -X DELETE "http://127.0.0.1:9099/emulator/v1/projects/demo-national-bourre-league/accounts"`
  and
  `curl -X DELETE "http://127.0.0.1:8088/emulator/v1/projects/demo-national-bourre-league/databases/(default)/documents"`.
  (Firestore emulator uses port 8088 so it doesn't clash with the static server on 8080.)

### Firestore data model (`docs/firestore.js` + `firestore.rules`)

- Collections: `users`, `rooms`, `roomMembers` (flat, id `${roomId}_${uid}` for
  easy membership lookups), and `sessions` + `scores` nested **under each room**
  (`rooms/{roomId}/sessions/{sessionId}/scores/{playerId}`).
- Gotcha (important): sessions/scores are subcollections on purpose. A top-level
  collection with a `roomId` field CANNOT be authorized for `list`/query in
  security rules — Firestore evaluates list rules without per-document
  `resource.data`, so `resource.data.roomId` is undefined and the query is denied
  (this broke `recomputeSessionTotals`). Subcollections let rules authorize via the
  `{roomId}` path wildcard (`isMember(roomId)`), which works for queries.
- Live updates use `onSnapshot`. `renderRoomDetail()` rebuilds the panel on every
  snapshot, so the notes textarea preserves its value/caret across re-renders when
  focused — keep that logic if you refactor, or typing into notes will be wiped.
- Notes / tricksWon / riskPoints / totals are informational scorekeeping only;
  nothing represents money. Keep it that way (rules grant no money capability).
- Gotcha: anything toggled via the HTML `hidden` attribute must keep working even
  when its CSS class sets `display`. `styles.css` has a global
  `[hidden]{display:none!important}` reset — keep it, or modals/menus render
  permanently open.
- Gotcha: on email sign-up, `createUserWithEmailAndPassword` fires
  `onAuthStateChanged` *before* `updateProfile` sets the display name, and a
  profile update does not re-emit the event. `app.js` therefore applies the
  returned user via `setSession()` after sign-up so the display name shows
  immediately (otherwise the UI falls back to the email prefix until reload).
