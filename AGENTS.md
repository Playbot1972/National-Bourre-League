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
- `src/game/` — pure Bourré engine: deal, draw/discard, legality (`legal.ts`),
  card play / trick resolution (`play.ts`, `trick.ts`), bot helpers. Built to
  `docs/game-engine.js` via `npm run build:game` for the static social app
  (`docs/firestore.js` imports it). Cloud Functions should reuse the same module
  (see `functions/README.md`).
- `docs/` — the static social app: `index.html`, `styles.css`, `firebase-config.js`
  (placeholder config), `auth.js` (Firebase Auth wrapper), `firestore.js`
  (Firestore data model + persistence), `ranking.js` (TrueSkill "Ape Score"
  engine, pure/no-deps), `app.js` (session + protected views + leaderboard).
  `firestore.rules` holds sample security rules. No payment/wallet/money features.
- `functions/` — Cloud Functions **scaffolding** for server-authoritative deal/draw/play
  validation (not wired to deploy yet; see `functions/README.md`).

### Play engine — layout, state boundaries, and production hardening

Pure logic lives in `src/game/` and is bundled to `docs/game-engine.js` for the
static social app. Firestore wiring is in `docs/firestore.js`; table UI in
`src/table/` (built to `docs/table-session.js`).

**Module layout (`src/game/`):**

| Module | Role |
| --- | --- |
| `deck.ts`, `deckState.ts` | Standard deck, seeded shuffle, draw from remainder |
| `deal.ts`, `playerOrder.ts` | Initial deal, dealer/action order |
| `drawLimit.ts`, `draw.ts` | House-rule draw caps, discard + replacement, phase advance |
| `legal.ts` | Follow suit, must trump, overtrump, optional cinch — structured errors |
| `trick.ts`, `play.ts` | Trick winner, `applyPlayCard`, simple bot draw/play helpers |
| `serialize.ts`, `types.ts` | Public vs private split, card (de)serialization |

**Public vs private hand state:**

| Location | Contents | Who can read |
| --- | --- | --- |
| `session.currentHand` | `phase`, `trumpSuit`, `turnPlayerId`, `currentTrick`, `playedCards`, `tricksByPlayer`, `deckSeed`, `deckNextIndex`, … | All room members |
| `sessions/…/privateHands/{playerId}` | `{ cards: [{ rank, suit }] }` | Owner uid only (humans); `bot_*` also readable by members for client-driven bots |

Opponent hole cards are **never** on the session doc — the table shows face-down
counts only (`Seat.tsx`).

**Client move flow (dev/testing — honor system):**

1. Enrollment completes → `dealInitialHand` → public `currentHand` + per-player `privateHands`.
2. Draw phase → `submitHandDraw` (transaction: private hand + public turn/draw state).
3. Play phase → `playHandCard` (transaction: legality via `applyPlayCard`, trick resolution).
4. Five tricks → `finalizeHandFromCardPlay` → existing hand settlement / co-win flow.
5. Manual trick `+` (`updateHandTrick`) is **blocked** when `phase` is `draw` or `play`.

**Current honor-system limitations (not production hardened):**

- Deal, draw, and play validation run in **client Firestore transactions** — a
  malicious member could write invalid moves or arbitrary cards to `privateHands`.
- Firestore rules allow any room member to **write** any `privateHands` doc.
- Bot draw/play is driven by a viewing member reading `bot_*` private hands.
- `deckSeed` + `deckNextIndex` on the public doc allow deterministic deck reconstruction.

**Production hardening (required before competitive or real-money use):**

- Wire `functions/` callable handlers (`validateDeal`, `validateDraw`, `validatePlayCard`)
  and restrict `privateHands` writes to Cloud Functions only.
- Move rating writes (`players` collection) server-side.
- Replace client-driven bot loop with server-authoritative bot runner (optional).

See `functions/README.md` and TODO comments in `firestore.rules` / `docs/firestore.js`.

**Local test & debug (open PRs, emulators, checklists):** see [`docs/TESTING.md`](docs/TESTING.md).

### Table feedback (sound + haptics)

Central service: `src/table/feedback/` (built into `docs/table-session.js`, exported
from `mount.tsx` for `docs/app.js` snapshot diffing).

| API | Event |
| --- | --- |
| `playShuffleFeedback()` | Hand deal, draw replacement |
| `playTrickWinFeedback()` | Local player wins a trick |
| `playBigWinFeedback()` | Local player wins hand / pot |

**Sound assets:** Drop MP3s in `docs/sounds/` (`shuffle.mp3`, `trick-win.mp3`,
`big-win.mp3`). Runtime loader tries assets first; procedural Web Audio is the
fallback until files are checked in (see `docs/sounds/README.md`).

**User prefs:** `localStorage` key `nbl-feedback` — sound on/off, haptics
on/minimal/off. Settings in table footer + session sidebar.

**Platform support (graceful fallback — never blocks gameplay):**

| Environment | Sound | Haptics |
| --- | --- | --- |
| Android Chrome | ✅ after first user gesture | ✅ `navigator.vibrate` |
| iOS Safari | ✅ after first user gesture | ❌ no web vibration API |
| Desktop browsers | ✅ | Usually unavailable (no-op) |
| Native wrapper | ✅ | ✅ via `window.BourreHaptics` bridge |

**Native haptics bridge (Capacitor / React Native WebView):** inject before table load:

```js
window.BourreHaptics = {
  impact(style) { /* Haptics.impact / RN haptic feedback */ },
  notification(type) { /* success pulse for pot/hand win */ },
};
```

iOS haptics **require** a native wrapper — web-only iPhone/iPad builds get sound but
not vibration. See `src/table/feedback/haptics.ts` for bridge contract.


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
  requires **Java 21**). Then open the app via `localhost:8080`. Validate setup with
  `npm run verify:local:prereq` (before starting servers) and `npm run verify:local`
  (after emulators + social are up) — see [`docs/TESTING.md`](docs/TESTING.md). Clear
  test data with:
  `curl -X DELETE "http://127.0.0.1:9099/emulator/v1/projects/demo-national-bourre-league/accounts"`
  and
  `curl -X DELETE "http://127.0.0.1:8088/emulator/v1/projects/demo-national-bourre-league/databases/(default)/documents"`.
  (Firestore emulator uses port 8088 so it doesn't clash with the static server on 8080.)
- Gotcha: anything toggled via the HTML `hidden` attribute must keep working even
  when its CSS class sets `display`. `styles.css` has a global
  `[hidden]{display:none!important}` reset — keep it, or modals/menus render
  permanently open.
- Gotcha: on custom domains, session persistence on **iOS Safari** requires the
  auth iframe to match the page host. `auth.js` sets `authDomain` from
  `location.hostname` on custom domains and uses IndexedDB + localStorage
  persistence. Redeploy after auth changes.
- Gotcha: on email sign-up, `createUserWithEmailAndPassword` fires
  `onAuthStateChanged` *before* `updateProfile` sets the display name, and a
  profile update does not re-emit the event. `app.js` therefore applies the
  returned user via `setSession()` after sign-up so the display name shows
  immediately (otherwise the UI falls back to the email prefix until reload).
  It also calls `ensurePlayerDoc(uid, displayName)` right after sign-up so the
  `players` doc gets the chosen name, not the email-prefix fallback.

### Firestore data model (`docs/firestore.js` + `firestore.rules`)

- Collections: `users`, `rooms`, `roomMembers` (flat, id `${roomId}_${uid}` for
  easy membership lookups), `inviteLookups` (doc id = invite code → `roomId`;
  used for join-by-code without listing all rooms), `players` (top-level Ape Score rankings; doc id =
  auth uid or a generated `guest_*` id for table guests), and `sessions` +
  `scores` nested **under each room**
  (  `rooms/{roomId}/sessions/{sessionId}/scores/{playerId}`).
- **Live hand (play engine):** see **Play engine — layout, state boundaries, and
  production hardening** above for the full module map, public/private split, and
  honor-system vs production notes. Summary: enrollment → deal on `currentHand` +
  `privateHands`; draw/play via `submitHandDraw` / `playHandCard`; legality in
  `src/game/legal.ts`; manual trick `+` disabled during live play.
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

### Ape Score ranking (`docs/ranking.js` + `players` collection)

- `ranking.js` is a pure, dependency-free, documented TrueSkill-inspired engine
  (easy to unit-test with `node`). Public formula: `round(max(0, mu − 3*sigma))`;
  new players start `mu=25`, `sigma=25/3`. Multiplayer update is an averaged
  pairwise TrueSkill approximation (ranked by tricks won; ties = draws). Exposes
  `rankMatch`, `apeScore`, `apeClass`, `apeStatus`, `newRating`.
- Ratings persist in the top-level `players` collection (id = uid for accounts, or
  a generated `guest_*` id for table guests). Each doc stores
  `{ displayName, mu, sigma, matchesPlayed, apeScore, apeClass, apeStatus,
  momentum, updatedAt }`.
- **End-to-end flow** (all wired in `app.js` + `firestore.js`):
  1. **Sign-in / sign-up** — `startRoomsSubscription()` calls
     `ensurePlayerDoc(uid, displayName)` so the signed-in user has a ranking doc
     (initial rating, Ape Score 0) and appears on the leaderboard even before
     playing. Sign-up also re-calls `ensurePlayerDoc` after `setSession()` so the
     doc carries the chosen display name.
  2. **Start session** — room members (or the solo host) become session players;
     score rows track `tricksWon` / `riskPoints`. Guests added at the table get a
     `guest_*` id via `addSessionPlayer`, which also creates their `players` doc.
  3. **Complete session** — `onCompleteSession()` loads current ratings with
     `getPlayers`, ranks by `tricksWon` via `rankMatch()` (ties = draws), attaches
     `apeClass` / `apeStatus`, then `applyRankingResults()` batch-writes every
     participant's updated rating and marks the session `final` with a results
     snapshot on the session doc.
  4. **Leaderboard** — `subscribeLeaderboard()` listens to the `players`
     collection live, sorted by `apeScore` desc (then `matchesPlayed`).
- Entertainment/skill only — never money. If you harden for production, move
  rating writes server-side (Cloud Function) so clients can't edit their own rank;
  the sample rule currently allows any signed-in write to `players`.

### Deploy to production (`booray.win` or any custom domain)

The site ships as **one Firebase Hosting site** with two apps:

| URL path | App | Source |
| --- | --- | --- |
| `/` | React tutorial (rules, tutorial, in-memory room) | Vite build → `dist/` |
| `/social/` | Static social app (auth, rooms, Ape Score) | `docs/` copied to `dist/social/` |

**Build & deploy:**
```bash
npm install
firebase login
firebase use YOUR_REAL_PROJECT_ID
# Put real Firebase web config in docs/firebase-config.js (projectId, apiKey, …)
npm run deploy          # build:hosting + deploy hosting + firestore rules
# or step-by-step:
npm run build:hosting   # vite build + copy docs/ → dist/social/
firebase deploy --only hosting,firestore:rules
```

**App version:** bump `version.json` (e.g. `1.00.01`) before each release; `npm run version:sync`
updates `package.json`, `src/version.ts`, and `docs/version.js`. Displayed bottom-right as
`v1.00.00` on `/` and `/social/`.

**Preview the combined site locally** (React at `/`, social at `/social/`, emulators
still auto-connect on localhost):
```bash
npm run emulators       # terminal 1
npm run preview:hosting # terminal 2 → http://localhost:5000
```

**Custom domain (`booray.win`):**

1. Register domains in Firebase Hosting (or skip if already added):
   ```bash
   npm run setup:domain -- national-bourre-league booray.win
   ```
2. **DNS + Auth domains** — fetches A/TXT/CNAME from Firebase and adds authorized
   domains automatically (run after step 1, even if `setup:domain` timed out):
   ```bash
   npm run domain:finish -- national-bourre-league booray.win
   ```
   **Automate DNS at your registrar** (Cloudflare, Namecheap, or Porkbun):
   ```bash
   # Cloudflare (domain must use Cloudflare nameservers)
   export REGISTRAR_DNS_PROVIDER=cloudflare
   export CLOUDFLARE_API_TOKEN=your_token   # DNS Edit on the zone
   npm run domain:dns -- national-bourre-league booray.win --dry-run
   npm run domain:dns -- national-bourre-league booray.win

   # Or combine with domain:finish:
   npm run domain:finish -- national-bourre-league booray.win --apply-dns
   ```
   Namecheap: `NAMECHEAP_API_USER`, `NAMECHEAP_API_KEY`, `NAMECHEAP_CLIENT_IP`.
   Porkbun: `PORKBUN_API_KEY`, `PORKBUN_SECRET_API_KEY`.
   Manual fallback: Firebase Console → Hosting → click `booray.win` → copy DNS
   records; Authentication → Settings → Authorized domains → add `booray.win` and
   `www.booray.win`.
3. After Firebase shows a green check and SSL is active, point the client at the
   custom domain and redeploy:
   ```bash
   npm run setup:webapp -- national-bourre-league booray.win
   npm run build:hosting && npx firebase deploy --only hosting
   ```
   Add the same origins to your Google OAuth client if using Google sign-in:
   ```bash
   npm run setup:google-oauth -- national-bourre-league booray.win --open
   ```
   Fixes `redirect_uri_mismatch` by opening Firebase → Google provider and printing
   the exact JavaScript origins + redirect URIs for your OAuth Web client.

**GitHub Actions auto-deploy:** pushes to `main` run `.github/workflows/deploy.yml`.
Add these repository secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `FIREBASE_API_KEY` | Web app `apiKey` from Firebase console |
| `FIREBASE_AUTH_DOMAIN` | e.g. `booray.win` (or `{projectId}.firebaseapp.com`) |
| `FIREBASE_PROJECT_ID` | Firebase project id |
| `FIREBASE_APP_ID` | Web app `appId` |
| `FIREBASE_SERVICE_ACCOUNT` | Full JSON key for a deploy service account |

Create the service account in Google Cloud → IAM → Service accounts → Create.
Grant **Firebase Hosting Admin** and **Firebase Rules Admin** (or **Firebase Admin**).
Generate a JSON key and paste the entire file into `FIREBASE_SERVICE_ACCOUNT`.
You can also trigger a manual deploy from the Actions tab via **workflow_dispatch**.

**Automated one-time setup:** on your machine (no global npm installs needed):

```bash
git clone https://github.com/Playbot1972/National-Bourre-League.git
cd National-Bourre-League
npm ci
npx firebase login
./scripts/one-time-setup.sh national-bourre-league booray.win
```

Uses local `firebase-tools` from devDependencies. GitHub CLI (`gh`) is optional —
if missing, the script prints secret values to paste at
https://github.com/Playbot1972/National-Bourre-League/settings/secrets/actions
