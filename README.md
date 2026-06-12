# National-Bourré-League

A web app for learning the Louisiana card game **Bourré**. It includes:

- **Rules screen** — the standard rules of Bourré, plus placeholders for your
  table's house rules.
- **Interactive Tutorial** — a step-by-step walkthrough of a full hand with
  elegant card visuals and a hands-on "pick the legal play" exercise.
- **Private Room** — an in-memory table lobby with an invite code, scorekeeping,
  and per-player risk points.

Built with Vite + React + TypeScript.

## Social app + Firebase Auth (`docs/`)

The `docs/` folder is a separate, **static-friendly** (GitHub Pages) social app
written in modular vanilla JS. It adds Firebase Authentication (Email/Password and
Google) with a logged-out state, a profile dropdown, and protected Private Rooms /
Leagues. There is no money/wallet functionality.

- Copy your Firebase web config into `docs/firebase-config.js` (it ships as a
  placeholder). The SDK loads from the gstatic CDN, so no build step is needed.
- Private rooms are persisted to **Firestore** (`docs/firestore.js`): collections
  for `users`, `rooms`, `roomMembers`, `players` (rankings), and—nested under each
  room—`sessions` and `scores`. Rooms carry an invite code, owner, house rules,
  status, and created time; sessions store players, rounds, tricks won, risk
  points, notes, and totals. Notes are informational only and never represent
  money. Live updates use Firestore `onSnapshot`. Sample security rules are in
  `firestore.rules`.
- **Ape Score** (`docs/ranking.js`) is a TrueSkill-inspired, skill-only ranking
  (entertainment only — never tied to money/payouts/rewards). Each player tracks
  `mu`/`sigma`/`matchesPlayed` (new players start at `mu=25`, `sigma=25/3`). The
  public score is `round(max(0, mu − 3·sigma))`. Completing a multiplayer session
  ranks players by tricks won and updates every player's rating. Players get an
  **Ape Class** (Gibbon → Silverback) and **Ape Status** (Provisional / Heating Up
  / Locked In), shown with momentum and matches played on the Leaderboard.
- Local development uses the Firebase **Auth + Firestore emulators** automatically
  when served from `localhost`:

  ```bash
  npm run emulators   # Auth (9099) + Firestore (8088) emulators (needs Java)
  npm run social      # serve docs/ at http://localhost:8080
  ```

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server (React app) |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |
| `npm run social` | Serve the static social app (`docs/`) on port 8080 |
| `npm run emulators` | Start the Firebase Auth emulator for local auth dev |
