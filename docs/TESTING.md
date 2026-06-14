# National Bourré League — local test & debug guide

Repo-specific steps for local development and release validation.

**`main` is v1.00.64** (PR #71 merged). Pull `main`, then `npm install`.

```bash
git checkout main
git pull origin main
npm install
```

---

## Branch map

| Branch | PR | What it adds | Status |
|--------|-----|--------------|--------|
| `main` | [#71](https://github.com/Playbot1972/National-Bourre-League/pull/71) (merged) | v1.00.64: gameplay bugfix (#67), sound/haptics (#68), icons (#70), `docs/TESTING.md` | **Current release base** |
| `cursor/testing-java-gotchas-8d02` | [#72](https://github.com/Playbot1972/National-Bourre-League/pull/72) | Java gotchas, `verify:local` / `verify:local:prereq` | Open — merge after local verify passes |
| `cursor/premium-table-ux-8d02` | [#66](https://github.com/Playbot1972/National-Bourre-League/pull/66) | Premium table UX (themes, Smart HUD, reactions) | Optional, separate stack |

PRs [#67](https://github.com/Playbot1972/National-Bourre-League/pull/67), [#68](https://github.com/Playbot1972/National-Bourre-League/pull/68), and [#70](https://github.com/Playbot1972/National-Bourre-League/pull/70) were consolidated into **#71** on `main`. Use `main` for release validation; checkout **#72** only for the local-dev verify scripts until that PR merges.

```bash
git fetch origin
git checkout main && git pull origin main
npm install
npm run verify:local:prereq   # on #72 branch until merged
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

## Java & Firebase emulators (macOS)

Firestore emulator requires Java. Install **OpenJDK 21** (`brew install openjdk@21`), add it to `PATH`, then verify below.

### Small gotchas

- After editing `~/.zshrc` or `~/.zprofile`, run `source ~/.zshrc` (or `source ~/.zprofile` if that is where Homebrew/PATH was added), or quit and reopen Terminal before testing `java`. PATH changes only apply to new or reloaded shells.
- On a brand-new Apple Silicon Homebrew install, make sure Homebrew itself is on PATH first. If the installer printed shellenv commands for `/opt/homebrew/bin`, run them before `brew install openjdk@21`.
- If `/usr/libexec/java_home -v 21` fails, Java may still be installed correctly. Check with:
  - Apple Silicon: `/opt/homebrew/opt/openjdk@21/bin/java -version`
  - Intel: `/usr/local/opt/openjdk@21/bin/java -version`
- For this repo, `npm run social` needs to serve on **http://localhost:8080**. If port 8080 is busy and `serve` picks another port, free 8080 and retry.
- Don’t paste lines starting with `#` directly into zsh.
- `javac -version` is a nice extra check, but Firebase emulators only require `java`, not the compiler.

### Minimal pass/fail order

Run these from the repo root (`cd ~/National-Bourre-League` on your Mac):

1. `java -version` → should show Java 21.x
2. `npm run emulators` → should start emulator UI on http://localhost:4000
3. `npm run social` → should serve on http://localhost:8080

**Automated check** (same three steps; steps 2–3 require those servers to already be running):

```bash
npm run verify:local:prereq   # step 1 + port 8080 free (before starting servers)
npm run verify:local          # all three (after emulators + social are up)
```

If those three work (or `verify:local` passes), local dev for this project is set.

Prefer putting Homebrew shell setup in `~/.zprofile` on macOS zsh if needed — PATH init can be more reliable there than in ad hoc shell files.

---

## Automated checks

| Command | What it validates | Available on |
|---------|-------------------|--------------|
| `npm run lint` | ESLint / TypeScript hygiene | `main` + feature branches |
| `npm run build` | React app (`tsc` + Vite) | `main` + feature branches |
| `npm run build:game` | `src/game/` → `docs/game-engine.js` | `main` + feature branches |
| `npm run build:table` | `src/table/` → `docs/table-session.js` | `main` + feature branches |
| `npm run check:social` | Syntax-check `docs/*.js` | `main` + feature branches |
| `npm run test:game` | Card uniqueness + draw flow tests | **main** (v1.00.64+) |
| `npm run test:feedback` | Haptics fallback + prefs tests | **main** (v1.00.64+) |
| `npm run icons:generate` | SVG → PNG icon export | **main** (v1.00.64+) |
| `npm run verify:local:prereq` | Java 21 + port 8080 free | **#72 branch** (merges to `main`) |
| `npm run verify:local` | Steps 1–3: Java, emulators UI, social on 8080 | **#72 branch** (merges to `main`) |

All scripts except `verify:local*` are on **`main`** as of v1.00.64.

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

Prereq: `main` (v1.00.64+), `npm install`, `npm run icons:generate`.

- [ ] Browser tab favicon updated (`favicon.ico`, `favicon.svg`, 16/32 PNG)
- [ ] `docs/manifest.webmanifest` + `public/manifest.webmanifest` present
- [ ] `apple-touch-icon.png` (180×180) wired in `docs/index.html` and `index.html`
- [ ] **Android Chrome:** install prompt / “Add to Home Screen” → new Booray icon on launcher
- [ ] **iPhone / iPad Safari:** Share → **Add to Home Screen** → correct icon on home screen
- [ ] `theme-color` meta is `#0a0e18`

---

### #68 — Sound + haptics

Prereq: `main` (v1.00.64+), emulators + http://localhost:8080.

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
| `Missing script: icons:generate` | Stale `main` before #71 | `git pull origin main` (v1.00.64+) |
| Table UI blank / “failed to load” | Stale `docs/table-session.js` | `npm run build:table` |
| Auth / sign-in issues | Wrong host for this repo’s config | Open **http://localhost:8080** (not another port/host unless you changed config) |
| Emulators not connecting | Emulators not running or Java missing | Install Java 21; terminal 1: `npm run emulators` (see **Java & Firebase emulators** above) |
| Draw appears to do nothing | Stale `main` or stale table bundle | `git pull origin main`; `npm run build:table`; check table overlay banner + console |
| No sound (mobile) | No user gesture yet | Tap table once; check Sound setting |
| No vibration (iPhone) | Web limitation | Expected; native wrapper needed for iOS haptics |

---

## Recommended test order

On **`main` (v1.00.64)** — all of #67–#70 landed via [#71](https://github.com/Playbot1972/National-Bourre-League/pull/71):

1. Local dev verify — `npm run verify:local:prereq` then `npm run verify:local` ([#72](https://github.com/Playbot1972/National-Bourre-League/pull/72))
2. Gameplay bugfix checklist (#67 section above)
3. Icons / PWA (#70 section)
4. Sound + haptics (#68 section)
5. **[#66](https://github.com/Playbot1972/National-Bourre-League/pull/66)** — premium table UX (optional, separate branch)

---

## Requirements

| Tool | Purpose |
|------|---------|
| Node 18+ | npm scripts |
| Java | Firebase emulators (`npm run emulators`) |
| Chrome (+ phone Safari if possible) | Table, PWA, landscape |
| `docs/firebase-config.js` | Placeholder config; emulators on localhost need no production keys |

No Capacitor / native wrapper in this repo yet — store builds are future; test as **PWA in browser** for now.
