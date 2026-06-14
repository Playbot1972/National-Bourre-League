# Bourré / Boo Ray — Release QA Guide

Run automated checks before every release:

```bash
npm run test:qa          # unit + integration + builds + social check
npm run test:e2e         # Playwright smoke (starts social server on :8080)
```

## Automated coverage map

| Area | Tests | Command |
|------|-------|---------|
| **A. Table/session setup** | `src/table/logic.test.ts` (seats, bots, host) | `npm run test:table` |
| **B. Initial deal** | `src/game/deal.test.ts`, `fullHand.test.ts` | `npm run test:game` |
| **C. In/out + draw** | `src/game/draw.test.ts`, `fullHand.test.ts` | `npm run test:game` |
| **D. Trick play** | `src/game/legal.test.ts`, `trick.test.ts`, `play.test.ts` | `npm run test:game` |
| **E. Pot / bourré** | `scripts/bourre-rules.test.mjs` | `npm run test:rules` |
| **F. Bots** | `src/game/bots.test.ts`, `fullHand.test.ts` | `npm run test:game` |
| **G. Layout / UI** | `e2e/social-smoke.spec.ts` (smoke); manual checklist below | `npm run test:e2e` |
| **H. Regression / integrity** | `assertNoDuplicateCards` in all game tests + multi-hand in `fullHand.test.ts` | `npm run test:game` |

### Card uniqueness invariant

`src/game/testHelpers.ts` → `assertNoDuplicateCards()` verifies every card id appears in **at most one** of:

- deck  
- trump upcard  
- player hands  
- current trick  
- completed tricks  
- discard pile  

Used after deal, draw, and every trick in integration tests.

### Full-hand simulation

`simulateFullHand()` in `testHelpers.ts` runs: deal → in/out → draw → play all tricks → settlement, with optional bot policies. Covers mixed human+bot tables without Firestore.

## Manual emulator checklist (required before prod)

1. `npm run emulators` + `npm run social` → http://localhost:8080  
2. Sign in (test account)  
3. Create table → add 2 bots → verify 3 seats  
4. Start hand → dealer trump flip → in/out → draw → play through 5 tricks  
5. Verify pot settlement and next-hand reset  
6. **3-player regression:** all clients reach play phase (no “Table UI failed to load”)  
7. Rotate phone to landscape — seats, hero hand, and felt readable  

## Known release blockers (documented)

| Issue | Status | Notes |
|-------|--------|-------|
| Play-phase table crash (`myUid` TDZ) | **Fixed in this branch** | Was: `ReferenceError` in `buildTableSessionProps` when phase = play |
| Trump 5-card dealer hand | Open PR #81 | Main still uses 4 + public upcard merge |
| iPhone landscape horizontal overflow (~156px) | **Open** | E2E documents; layout fix TBD |
| Full gameplay E2E with Firebase emulators | **Not automated** | Requires auth + multi-tab; use manual checklist |
| Backend trust | Documented | Draw/play legality enforced client-side; production needs rules hardening for untrusted clients |

## Backend trust assumptions

- Room **member** client runs bot timers and may apply bot moves locally.  
- Draw/play validation runs in the browser (`src/game/` + `docs/app.js`).  
- Firestore rules should reject illegal writes from non-member clients (verify separately).

## Test counts (approx.)

- Game + table + rules: **~58** tests via `npm test`  
- Playwright: **4** smoke tests (version badge, sign-in, 2 viewports)
