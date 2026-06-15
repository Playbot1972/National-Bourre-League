# E2E tests (Playwright)

Browser tests for release QA. They require the social app running locally.

## Quick run

```bash
# Terminal 1 — optional for auth flows; smoke tests work without emulators
npm run social

# Terminal 2
npm run test:e2e
```

Override base URL:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:8080 npm run test:e2e
```

## Full manual + E2E QA

1. `npm run emulators` (Terminal 1)
2. `npm run social` (Terminal 2)
3. `npm run test:release` — unit + builds + functions + Playwright (82 browser tests)
4. Follow `docs/QA_RELEASE.md` for live gameplay checklist on emulators

## Coverage

| Suite | What it checks |
|-------|----------------|
| `e2e/social-smoke.spec.ts` | Home page loads, sign-in entry |
| `e2e/settlement.spec.ts` | Co-winner settlement UI |
| `e2e/table-layout.spec.ts` | No horizontal overflow |
| `e2e/table-players.spec.ts` | **2–8 seats**, human/bot mixes, enrollment/draw/play phases, timer tick |

Player-matrix fixture: `/e2e-fixtures/table-session?players=8&bots=4&phase=enrollment` (no `.html` — `serve` strips query params on redirect).

## CI note

E2E is optional in CI until emulators + social server are wired into the workflow.
Unit tests (`npm run test`) run on every `build:hosting`.
