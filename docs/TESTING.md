# National Bourré League — local test & debug guide

Repo-specific steps for validating releases before merge.

**Current release candidate:** `cursor/release-rc-8d02` → **v1.00.64** (combines #67 bugfix + #68 sound + #70 icons + `docs/TESTING.md`).

**`main` is still v1.00.60** until the RC PR merges. Use the RC branch locally to test everything at once:

```bash
git fetch origin
git checkout cursor/release-rc-8d02
npm install
```

---

## Branch map

| Branch | PR | What it adds | Depends on |
|--------|-----|--------------|------------|
| `main` | #65 (merged) | Play engine, draw/play phases, table bundle | — |
| `cursor/release-bugfix-landscape-draw-8d02` | [#67](https://github.com/Playbot1972/National-Bourre-League/pull/67) | Gameplay bugfix: duplicate cards, draw UX, landscape table | `main` |
| `cursor/icons-on-main-8d02` | [#70](https://github.com/Playbot1972/National-Bourre-League/pull/70) | Icons, PWA manifest, favicon, `icons:generate` | `main` |
| `cursor/premium-sound-haptics-8d02` | [#68](https://github.com/Playbot1972/National-Bourre-League/pull/68) | Sound + haptics feedback service | **#67** |
| `cursor/premium-table-ux-8d02` | [#66](https://github.com/Playbot1972/National-Bourre-League/pull/66) | Premium table UX (themes, Smart HUD, reactions) | Optional, separate stack |

### Known branch stacking

- **Testing #68:** merge or rebase **#67** first, **or** checkout `cursor/premium-sound-haptics-8d02` directly (it already includes #67).
- **Testing #70:** checkout `cursor/icons-on-main-8d02` until [#70](https://github.com/Playbot1972/National-Bourre-League/pull/70) is merged into `main`.
- **Testing #66:** independent of #67–#70; optional polish, not required for release bugfix validation.

```bash
git fetch origin
git checkout cursor/release-bugfix-landscape-draw-8d02   # example
npm install
```

---

## Local setup (two terminals)

This repo’s social app and auth emulator config expect the static server at **`localhost:8080`** (see `docs/firebase-config.js`). Use that host when testing auth against emulators.

| Terminal | Command | URL |
|----------|---------|-----|
| 1 | `npm run emulators` | Emulator UI: http://localhost:4000 |
| 2 | `npm run social` | Social app: http://localhost:8080 |

**Rebuild the table bundle** when `src/table/` or table CSS changed but the live table looks stale or fails to mount:

```bash
npm run build:table
```

**Full production-like build** (optional):

```bash
npm run build:hosting
npm run preview:hosting
```

---

## Automated checks

| Command | What it validates | Available on |
|---------|-------------------|--------------|
| `npm run lint` | ESLint / TypeScript hygiene | `main` + feature branches |
| `npm run build` | React app (`tsc` + Vite) | `main` + feature branches |
| `npm run build:game` | `src/game/` → `docs/game-engine.js` | `main` + feature branches |
| `npm run build:table` | `src/table/` → `docs/table-session.js` | `main` + feature branches |
| `npm run check:social` | Syntax-check `docs/*.js` | `main` + feature branches |
| `npm run test:game` | Card uniqueness + draw flow tests | **v1.00.64 RC+** (not on `main` yet) |
| `npm run test:feedback` | Haptics fallback + prefs tests | **v1.00.64 RC+** (not on `main` yet) |
| `npm run icons:generate` | SVG → PNG icon export | **v1.00.64 RC+** (not on `main` yet) |

`main` today (v1.00.60): lint, build, build:game, build:table, check:social, emulators, social — **no** `test:game`, `test:feedback`, or `icons:generate`.

---

## Manual test checklists

### #67 — Gameplay bugfix (test first)

Prereq: emulators + http://localhost:8080, signed in, room with 2+ players.

- [ ] **Deal:** trump upcard on felt is **not** duplicated in dealer’s private hand
- [ ] **Draw:** select 1–4 cards → **Draw** → loading / success / error banner on table overlay (not silent)
- [ ] **Draw:** over-limit discard shows visible error
- [ ] **Landscape:** phone/tablet landscape — no clipped hero hand, readable pot, usable touch targets
- [ ] **Play:** trick counts increment; phase labels match draw → play

**Debug:** Browser DevTools → Console; Firestore Emulator UI → `sessions/{id}/currentHand` and `privateHands/{uid}`.

---

### #70 — Icons / PWA / favicon

Prereq: branch `cursor/icons-on-main-8d02`, `npm install`, `npm run icons:generate`.

- [ ] Browser tab favicon updated (`favicon.ico`, `favicon.svg`, 16/32 PNG)
- [ ] `docs/manifest.webmanifest` + `public/manifest.webmanifest` present
- [ ] `apple-touch-icon.png` (180×180) wired in `docs/index.html` and `index.html`
- [ ] **Android Chrome:** install prompt / “Add to Home Screen” → new Booray icon on launcher
- [ ] **iPhone / iPad Safari:** Share → **Add to Home Screen** → correct icon on home screen
- [ ] `theme-color` meta is `#0a0e18`

---

### #68 — Sound + haptics

Prereq: **#67** merged or use `cursor/premium-sound-haptics-8d02` directly.

- [ ] First tap on table unlocks audio (required on iOS Safari)
- [ ] Deal / draw replacement → shuffle feedback (sound + light haptic on Android)
- [ ] Local trick win → chime + medium haptic
- [ ] Hand / pot win → richer sound + strong haptic (when applicable)
- [ ] Settings: Sound on/off; Haptics on / minimal / off (table footer + session sidebar)
- [ ] **iPhone / iPad:** sound works after gesture; **no vibration** on web (expected)

---

### #66 — Premium table UX (optional)

Themes, Smart HUD, reactions, desktop shell — validate separately; not blocking #67 release bugfix.

---

## Common failures

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `Missing script: icons:generate` | On `main` before #70 merge | Checkout `cursor/icons-on-main-8d02` or merge [#70](https://github.com/Playbot1972/National-Bourre-League/pull/70) |
| Table UI blank / “failed to load” | Stale `docs/table-session.js` | `npm run build:table` |
| Auth / sign-in issues | Wrong host for this repo’s config | Open **http://localhost:8080** (not another port/host unless you changed config) |
| Emulators not connecting | Emulators not running | Terminal 1: `npm run emulators` |
| Draw appears to do nothing | Old `main` without #67 | Checkout #67 branch; check table overlay banner + console |
| No sound (mobile) | No user gesture yet | Tap table once; check Sound setting |
| No vibration (iPhone) | Web limitation | Expected; native wrapper needed for iOS haptics |

---

## Recommended test order

1. **[#67](https://github.com/Playbot1972/National-Bourre-League/pull/67)** — gameplay bugfix / landscape / draw (highest priority)
2. **[#70](https://github.com/Playbot1972/National-Bourre-League/pull/70)** — icons / PWA / favicon
3. **[#68](https://github.com/Playbot1972/National-Bourre-League/pull/68)** — sound + haptics, rebased on updated `main` after #67 lands
4. **[#66](https://github.com/Playbot1972/National-Bourre-League/pull/66)** — premium table UX (optional)

---

## Requirements

| Tool | Purpose |
|------|---------|
| Node 18+ | npm scripts |
| Java | Firebase emulators (`npm run emulators`) |
| Chrome (+ phone Safari if possible) | Table, PWA, landscape |
| `docs/firebase-config.js` | Placeholder config; emulators on localhost need no production keys |

No Capacitor / native wrapper in this repo yet — store builds are future; test as **PWA in browser** for now.
