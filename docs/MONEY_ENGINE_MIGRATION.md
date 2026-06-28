# Money engine v1 — event-sourced bankroll system

## Source of truth

All Bourré ante, pot, bourré penalty, carryover, exemption, rebuy, and chip-conservation
logic lives in **`src/game/money/`** (TypeScript). Built to:

- `docs/money-engine.js` — full engine (`npm run build:money`)
- `docs/bourre-rules.js` — backward-compatible re-export barrel
- `functions/vendor/money-engine.js` + `money-persistence.js` — Cloud Functions sync

## Architecture

| Layer | Role |
| --- | --- |
| `core.ts` / `pipeline.ts` | Pagat settlement math (ante, pot, bourré, carry, solvent apply) |
| `processor.ts` | `processAnte`, `processHandSettlement`, `processRebuy` → structured events |
| `replay.ts` | Deterministic `replayEvents` ordered by handId / phase / sequence |
| `finalize.ts` | Canonical `computeFinalBankrolls` + `isMoneyEngineV1` gating |
| `docs/money-persistence.js` | Firestore atomic append helpers |

## Event schema

Each money mutation appends immutable docs under
`rooms/{roomId}/sessions/{sessionId}/moneyEvents/{eventId}`:

```json
{
  "eventId": "settle:abc:1:WINNER_CREDITED:human",
  "actionId": "settle:abc:1",
  "handId": "1",
  "phase": "hand_settlement",
  "sequence": 4,
  "type": "WINNER_CREDITED",
  "playerId": "human",
  "amount": 60,
  "metadata": { "mode": "win" },
  "timestamp": 1710000000000
}
```

Event families: `BUY_IN_APPLIED`, `ANTE_DEDUCTED`, `POT_FUNDED`, `SETTLEMENT_DEBIT`,
`WINNER_CREDITED`, `BOURRE_LIABILITY`, `SPLIT_POT_APPLIED`, `REBUY_APPLIED`,
`NEXT_DEAL_FUNDING`, `CARRY_OVER_SET`.

## Idempotency

- Every originating action carries a stable `actionId` (e.g. `settle:{sessionId}:{handNumber}`).
- `eventId` is deterministic per action + type + player.
- Reprocessing the same `actionId` returns zero new events.

## Versioning

- New sessions store `moneyEngineVersion: "v1"` and `moneySequence`.
- Legacy sessions (no version) keep the previous inline settlement path until they complete.
- Mixed old/new mutation on the same session is blocked via `isMoneyEngineV1` checks.

## Persistence

Settlement batches atomically commit:

1. Score row bankroll / net / funding flags
2. Session `carryOverPot`, `nextDealFunding`, hand markers
3. New `moneyEvents` docs + `moneySequence` bump

## Canonical finalization

`applyRankingResults` on v1 sessions calls `computeFinalBankrolls` before marking
`status: "final"`. Drift between incremental score rows and event replay is logged.

## Tests

- `src/game/money/money.test.ts` — core scenarios, idempotency, replay, drift detection
- Existing `scripts/bourre-rules.test.mjs` and settlement integration tests (via re-export barrel)
