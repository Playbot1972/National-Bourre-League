# National Bourré League — local test & debug guide

Repo-specific steps for local development, release validation, and **booray.win** production ops.

**Track `main`** (currently **v1.03.41** per `package.json`). Pull and install before testing:

```bash
git checkout main
git pull origin main
npm install
```

| Need | Section |
|------|---------|
| Emulators + social app locally | [Local setup](#local-setup-two-terminals) |
| `npm run test`, `test:qa`, builds | [Automated checks](#automated-checks) |
| Bot turns / `gameAdvanceBots` on production | [Production ops — gameAdvanceBots IAM](#production-ops--gameadvancebots-iam) |
| Release scenario coverage | [`docs/QA_RELEASE.md`](./QA_RELEASE.md) |

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

1. `java -version` → should show Java 21.x
2. `cd ~/National-Bourre-League && npm run emulators` → should start emulator UI on http://localhost:4000
3. `cd ~/National-Bourre-League && npm run social` → should serve on http://localhost:8080

If those three work, local dev for this project is set.

Prefer putting Homebrew shell setup in `~/.zprofile` on macOS zsh if needed — PATH init can be more reliable there than in ad hoc shell files.

---

## Automated checks

| Command | What it validates |
|---------|-------------------|
| `npm run test:qa` | Full release gate: unit/integration tests + builds + syntax check |
| `npm run test` | Game, table, session, and settlement rules (~75 tests) |
| `npm run test:e2e` | Playwright smoke + landscape layout (needs Chromium) |
| `npm run lint` | ESLint / TypeScript hygiene |
| `npm run build:game` | `src/game/` → `docs/game-engine.js` |
| `npm run build:table` | `src/table/` → `docs/table-session.js` |
| `npm run check:social` | Syntax-check `docs/*.js` |

**Release QA map:** see [`docs/QA_RELEASE.md`](./QA_RELEASE.md) for scenario coverage (deal, enrollment, draw, tricks, pot, bots, layout).

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
| GitHub Actions: `Failed to authenticate, have you run firebase login?` | Intermittent ADC miss in `firebase-tools` | Usually self-heals on re-run; PR #332 adds SA token fallback. Refresh secret: `npm run sync:github-sa-secret` or `npm run fix:deploy` |
| GitHub Actions: hosting OK, functions fail `iam.serviceAccounts.ActAs` | Deploy SA missing **Service Account User** on App Engine default SA and/or `{projectNumber}-compute@developer.gserviceaccount.com` (Gen2 runtime) | `npm run fix:deploy-iam` or `npm run fix:deploy` then re-run **Deploy to Firebase** |
| GitHub Actions: `failed to parse service account key JSON` / `unexpected token` | `FIREBASE_SERVICE_ACCOUNT` secret corrupted (not raw JSON) | From repo root: `npm run sync:github-sa-secret` or `npm run fix:deploy` |
| GitHub Actions: functions fail `Cloud Billing API` / `cloudbilling.googleapis.com` disabled | Billing API not enabled on GCP project | `npm run enable:functions-apis` or `npm run fix:deploy` (as project Owner) |
| `advanceSessionBots` / `gameAdvanceBots` fails with 403 Forbidden (HTML) on booray.win; other callables return 401 | Gen2 callable missing Cloud Run **public invoker** (`gameAdvanceBots` only) | See **[Production ops — gameAdvanceBots IAM](#production-ops--gameadvancebots-iam)** below |
| No sound (mobile) | No user gesture yet | Tap table once; check Sound setting |
| No vibration (iPhone) | Web limitation | Expected; native wrapper needed for iOS haptics |

---

## Production ops — gameAdvanceBots IAM

Quick runbook for **booray.win** when bot turns stall. Root cause is almost always **Cloud Run IAM** on `gameAdvanceBots`, not client CORS code or callable-vs-POST mismatch.

### Symptoms

- Browser console: CORS blocked on POST to `gameAdvanceBots`
- `FirebaseError: internal` from `advanceSessionBots`
- Bot turns never advance; hand stalls in play phase
- Secondary `gamePlayCard` **500** on bot turns (client fallback — fix IAM first)

### First check (10 seconds)

```bash
npm run verify:game-callables
```

| Result | Meaning |
|--------|---------|
| `PASS gameAdvanceBots OPTIONS HTTP 204` | Callable reachable at Cloud Run; CORS preflight OK |
| `PASS gameAdvanceBots POST HTTP 401` | Handler reachable (401 = no auth token, expected) |
| `FAIL … HTTP 403` | **Missing public invoker** — IAM repair needed |

### How to read HTTP status (no auth)

| Status | Layer | Action |
|--------|-------|--------|
| **204** OPTIONS + `Access-Control-Allow-Origin` | Cloud Run + CORS | ✅ Healthy |
| **401** POST + JSON `UNAUTHENTICATED` | Callable handler reached | ✅ Healthy |
| **403** POST or OPTIONS (HTML “Forbidden”) | Cloud Run IAM blocks request | ❌ Run IAM repair |

Copy-paste probes:

```bash
# OPTIONS — expect 204 + Access-Control-Allow-Origin
curl -sI -X OPTIONS \
  "https://us-central1-national-bourre-league.cloudfunctions.net/gameAdvanceBots" \
  -H "Origin: https://booray.win" \
  -H "Access-Control-Request-Method: POST" | head -5

# POST — expect 401 (not 403 HTML)
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  "https://us-central1-national-bourre-league.cloudfunctions.net/gameAdvanceBots" \
  -H "Content-Type: application/json" \
  -d '{"data":{"roomId":"smoke","sessionId":"smoke"}}'
```

### When to run each command

| Command | When |
|---------|------|
| `npm run verify:game-callables` | **Always first.** After every functions deploy, on bot-turn reports, weekly smoke. |
| `npm run fix:callable-invoker` | Verify shows **403** on `gameAdvanceBots`. Also if CI IAM repair step failed. Run as GCP project Owner. |
| `npm run fix:deploy-iam` | `fix:callable-invoker` fails with permission errors, or CI logs mention missing `run.admin`. One-time SA setup, then re-run deploy. |
| `gh workflow run deploy.yml --ref main` | After manual IAM repair, to confirm CI verify step passes. |

Typical recovery (Owner):

```bash
npm run fix:deploy-iam          # only if IAM repair lacks permissions
npm run fix:callable-invoker
npm run verify:game-callables   # must PASS before closing incident
```

### Ignore extension noise

These are **not** Bourré bugs — ignore when triaging:

- `contentscript.js`
- `ObjectMultiplex`
- MetaMask / wallet extension warnings

### Manual gameplay smoke (3 steps)

At https://booray.win/social/ — signed in, room with ≥1 bot.

1. **Reach play** — complete enrollment + draw; play until a **bot turn**.
2. **Bot advance** — DevTools console shows `[bot-orchestrator] gameAdvanceBots-result` with **no** CORS error, `FirebaseError: internal`, or `Callable blocked before handler`.
3. **Full hand** — all five tricks complete and hand settles; **no** `gamePlayCard` 500 during bot turns.

Optional debug (console, then reload):

```javascript
localStorage.setItem('nbl-game-flow-debug', '1');
location.reload();
```

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
