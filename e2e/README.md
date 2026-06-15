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

## CI note

E2E is optional in CI until emulators + social server are wired into the workflow.
Unit tests (`npm run test`) run on every `build:hosting`.
