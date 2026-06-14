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
3. `npm run test` (unit/integration)
4. `npm run test:e2e` (browser smoke)
5. Follow `docs/QA_RELEASE.md` for live gameplay checklist

## CI note

E2E is optional in CI until emulators + social server are wired into the workflow.
Unit tests (`npm run test`) run on every `build:hosting`.
