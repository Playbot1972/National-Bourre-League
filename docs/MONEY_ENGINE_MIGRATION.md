# Money engine migration (step 1)

## Source of truth

All Bourré ante, pot, bourré penalty, carryover, exemption, and chip-conservation
logic now lives in **`src/game/money/`** (TypeScript). It is built to:

- `docs/bourre-rules.js` — static social app (`vite.money.config.ts`)
- `functions/vendor/bourre-rules.js` — Cloud Functions (`scripts/sync-functions-engine.mjs`)

`docs/bourre-settlement-flow.js` is a **thin re-export** layer for integration
tests and legacy imports; it no longer contains settlement math.

## High-level API

| Function | Role |
| --- | --- |
| `recordHandSettlement(input)` | Hand end: nominal deltas → solvent apply → next-deal funding flags |
| `startNextHandFunding(input)` | Next deal: merge `nextDealFunding` snapshot → collect antes |
| `runHandMoneyFlow(input)` | Settlement + next-deal funding (test / simulation helper) |
| `assertChipConservation(...)` | Zero-sum chip check across bankrolls + carry + posted antes |

Primitives (`settleHandDeltas`, `applySolventSettlement`, `collectHandAntes`,
`collectNextHandAntes`, `nextDealFundingFlags`, etc.) remain exported from the
same bundle for callers that need lower-level steps.

## Logic removed from wrappers

### `docs/firestore.js` — `recordHandClient`

**Removed:** inline `settleHandDeltas` → `applySolventSettlement` → per-player
`nextDealFundingFlags` → `buildNextDealFundingSnapshot` → `bourreRemaindersFromSettlement`.

**Kept in wrapper:** Firestore batch writes, hand ledger, `tricksWon` / `handsWon` /
`perHandStake` patches, dealer rotation, private-hand cleanup, session totals,
error handling, and logging.

**Now calls:** `recordHandSettlement()`; score patches read `skipNextAnte` /
`bourreReplacementDue` from `fundedScoreById`.

### `functions/gameHandlers.js` — `handleRecordHand`

Same split as `recordHandClient` (server-authoritative path).

**Bot rebuy (#378):** `buildBotRebuySettlementPlan` runs after `recordHandSettlement`,
applying busted-bot rebuys in the **same settlement batch** (bankroll + roster patches).
`applyBotAutoRebuysAfterSettlement` remains as a deferred fallback only.

### `docs/bourre-settlement-flow.js`

**Removed:** ~250 lines duplicating `recordHandSettlement`, funding simulation,
and production deal flow.

**Now:** re-exports from `./bourre-rules.js` only.

## Tests

- `src/game/money/money.test.ts` — 3-player $20 ante, co-win, split, bust bourré, skip-next-ante
- Existing `scripts/bourre-rules.test.mjs`, `scripts/bourre-settlement-integration.test.mjs`,
  `src/game/fullHand.test.ts` — unchanged imports; still exercise the built bundle

## Not in scope (step 1)

- UI/table changes beyond calling the shared engine
- Moving Firestore persistence or Cloud Function I/O into `src/game/money/`
- Server-only restriction of `privateHands` writes
