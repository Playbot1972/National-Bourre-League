# Bourré / Boo Ray — Release QA Guide

Run automated checks before every release:

```bash
npm run test:qa          # unit + integration + builds + social check (~75 tests)
npm run test:e2e         # Playwright smoke + layout (8 tests, 2 viewports)
```

See also `docs/TESTING.md` for emulator setup and manual checklists.

## Automated coverage map

| Area | Tests | Command |
|------|-------|---------|
| **A. Table/session setup** | `src/session/logic.test.ts`, `src/table/logic.test.ts` | `npm run test:session` / `test:table` |
| **B. Initial deal** | `src/game/deal.test.ts`, `handState.test.ts`, `fullHand.test.ts` | `npm run test:game` |
| **C. In/out + draw** | `src/game/enrollment.test.ts`, `draw.test.ts`, `fullHand.test.ts` | `npm run test:game` |
| **D. Trick play** | `src/game/legal.test.ts`, `trick.test.ts`, `play.test.ts` | `npm run test:game` |
| **E. Pot / bourré** | `scripts/bourre-rules.test.mjs`, settlement in `fullHand.test.ts` | `npm run test:rules` + `test:game` |
| **F. Bots** | `src/game/bots.test.ts`, `fullHand.test.ts` | `npm run test:game` |
| **G. Layout / UI** | `e2e/table-layout.spec.ts`, `e2e/social-smoke.spec.ts` | `npm run test:e2e` |
| **H. Regression / integrity** | `assertNoDuplicateCards`, multi-hand in `fullHand.test.ts` | `npm run test:game` |

### Card uniqueness invariant

`src/game/testHelpers.ts` → `assertNoDuplicateCards()` verifies every card id appears in **at most one** of:

- deck  
- trump upcard (when not mirrored in holder's private hand)  
- player hands  
- current trick  
- completed tricks  
- discard pile  

Used after deal, draw, and every trick in integration tests.

### Full-hand simulation

`simulateFullHand()` in `testHelpers.ts` runs: optional enrollment → deal → draw → play all tricks, with bot policies. Settlement wired via `settleHandDeltas` in `fullHand.test.ts`.

Pass `skipEnrollment: false` and `enrollmentJoin` to exercise in/out before deal.

## Manual emulator checklist (required before prod)

1. `npm run emulators` + `npm run social` → http://localhost:8080  
2. Sign in (test account)  
3. Create table → add 2 bots → verify 3 seats  
4. Start hand → dealer trump flip → in/out → draw → play through 5 tricks  
5. Verify pot settlement and next-hand reset  
6. **3-player regression:** all clients reach play phase (no “Table UI failed to load”)  
7. Rotate phone to landscape — seats, hero hand, and felt readable  

## Known release blockers

| Issue | Status | Notes |
|-------|--------|-------|
| Play-phase table crash (`myUid` TDZ) | **Fixed** | `buildTableSessionProps` hoists `myUid` |
| Trump 5-card dealer hand | **Fixed (merged)** | Dealer keeps flipped trump in private hand |
| iPhone landscape horizontal overflow | **Fixed + E2E** | `max-width: min(100%, 100vw)` + layout spec |
| Full gameplay E2E with Firebase emulators | **Not automated** | Requires auth + multi-tab; use manual checklist |
| Backend trust | **Cloud Functions + locked rules** | Manual trick +/- disabled; bot runner still client-driven |

## Backend trust assumptions

- **Deal / draw / play / settlement** run in Cloud Functions (`functions/`) using `src/game/` as source of truth.
- Firestore rules block client writes to `privateHands`, hand ledger, and session game fields.
- Room **member** client still drives bot timers by calling functions on behalf of `bot_*` seats.
- Leaderboard (`players/{id}`) writes remain client-side — move to a trusted function for competitive use.

## Test counts (approx.)

- Game + table + session + rules: **~75** tests via `npm test`  
- Playwright: **8** tests (smoke + layout × 2 viewports)
