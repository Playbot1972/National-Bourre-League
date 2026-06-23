# E2E tests (Playwright)

Browser tests for release QA. The config starts `npm run social` automatically unless a server is already running.

## Quick run

```bash
npx playwright test
npx playwright test --ui
npx playwright test --headed
```

Override base URL:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:8080 npx playwright test
```

Run only Bourré table smoke tests:

```bash
npx playwright test e2e/table-smoke.desktop.spec.ts e2e/table-smoke.mobile.spec.ts
```

## Full manual + E2E QA

1. `npm run emulators` (Terminal 1)
2. `npm run social` (Terminal 2) — optional when using default Playwright config (auto-starts server)
3. `npm run test:release` — unit + builds + functions + Playwright
4. Follow `docs/QA_RELEASE.md` for live gameplay checklist on emulators

## Coverage

See **`docs/E2E_UI_UX_REPORT.md`** for the full pass/fail matrix by user journey (106 automated tests + manual UX checklist).

| Suite | What it checks |
|-------|----------------|
| `e2e/table-smoke.desktop.spec.ts` | **Table smoke (desktop)** — load, felt/seats, enrollment join, settings, trump/draw/play, settlement, no console errors |
| `e2e/table-smoke.mobile.spec.ts` | **Table smoke (Pixel 5 landscape)** — layout, critical controls in viewport, draw/settings/settlement |
| `e2e/fixtures/consoleGuard.ts` | Shared fixture — fails on `console.error` and uncaught `pageerror` |
| `e2e/helpers/tableSmoke.ts` | Table fixture URL builder + viewport helpers |
| `e2e/social-smoke.spec.ts` | Home page loads, sign-in entry |
| `e2e/settlement.spec.ts` | Co-winner settlement UI |
| `e2e/table-layout.spec.ts` | No horizontal overflow |
| `e2e/table-players.spec.ts` | **2–8 seats**, human/bot mixes, enrollment/draw/play phases, timer tick |

Player-matrix fixture: `/e2e-fixtures/table-session?players=8&bots=4&phase=enrollment` (no `.html` — `serve` strips query params on redirect).

## Rules regression (Pagat Bourré)

Focused business-rule tests that catch premature bourré, dealer trump draw, bourré payment, and phase-order bugs.

```bash
# Fast fixture suite — no emulators (recommended on every PR)
npm run test:e2e:rules

# Live Firestore hand lifecycle — requires emulators + social server
npm run emulators   # terminal 1
npm run social      # terminal 2 (or rely on Playwright auto-start)
PLAYWRIGHT_EMULATORS=1 npm run test:e2e:rules:live
```

| Suite | What it checks |
|-------|----------------|
| `e2e/rules-regression.fixture.spec.ts` | Deterministic scenarios via `/e2e-fixtures/rules-regression` — premature bourré, settlement bourré IDs, dealer trump discard, bourré ante payment, phase order, 2-player draw |
| `e2e/rules-regression.emulator.spec.ts` | Real room → table flow with Firebase emulators (gated by `PLAYWRIGHT_EMULATORS=1`) |
| `e2e/helpers/rulesRegression.ts` | Fixture URL helpers, phase/bourré assertions, pot reads |

**Why the old suite missed these bugs:** most table E2E tests mount `/e2e-fixtures/table-session` or `table-flows` with static props — they never run `bourre-rules.js` settlement, `collectHandAntes`, or the draw engine. The `bourre` table-flows scenario only toggles `recentBourreIds` for pulse animation, not post-hand bourré assignment or payment.

**CI recommendation:** run `npm run test:e2e:rules` on every PR (fast, no Java). Run `test:e2e:rules:live` nightly or before release when emulators are available.

## CI note

E2E is optional in CI until emulators + social server are wired into the workflow.
Unit tests (`npm run test`) run on every `build:hosting`.
