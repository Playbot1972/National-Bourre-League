# Money engine — open rules and policy

## OPEN_RULE_CASH_OUT

**Status:** Not implemented in production.

- There is no `cashOut` / `processCashOut` API in the money engine or Firestore layer.
- `netCashOut` in the ledger invariant is always **0** for live sessions.
- Elimination sets `out: true` on score rows; chips are not removed from the table total.
- **Test only:** `LedgerAuditSession.simulateCashOut()` and `applyCashOutToBaseline()` in audit harnesses.

### Future API outline (`cashOut(playerId, amount)`)

| Item | Requirement |
|------|-------------|
| Semantics | Debit `amount` from player bankroll; emit `CASH_OUT_APPLIED` with `amount`; player may leave table or remain with reduced stack |
| Constraints | `amount > 0`; `amount <= bankroll`; optional table min/max cash-out; room owner policy flags |
| Global invariant | `netCashOut += amount`; total chips in system decreases: `expectedTotal` drops by `amount` while `actual` (bankrolls + pot + carry) drops by the same |
| Session baseline | Increment `moneyLedgerBaseline.netCashOut` on each successful cash-out |
| Firestore | Callable + rules restricting self cash-out; atomic score patch + money event + baseline bump |
| Runtime guard | `assertTableChipInvariant` after every cash-out |
| Tests | Zero/negative/overdraft rejection; invariant preserved; rebuy-after-cash-out; soak with occasional cash-out |

---

## OPEN_RULE_BOURRE_MINT

**Status:** Implemented — engine mints chips when bourré penalty exceeds available bankroll.

- Canonical helper: `bourrePotMintByPlayer()` in `canonical.ts`.
- Minted chips fund the next-hand pot (not removed from table total).
- Tracked in invariant baseline as **`netBourreMint`**:
  - Session doc `moneyLedgerBaseline.netBourreMint` (production fast path)
  - Event metadata `bourrePotMint` (event replay fallback when baseline fields missing)
- `bumpBaselineForNextHandFunding()` / `computeNextHandFundingMintDelta()` simulate next-hand funding at settlement and increment baseline.
- `reconcileChipDrift()` in audit harness attributes unexplained positive chip growth to bourré mint.
- **Intended design, not a bug.**
- When `rebuyEnabled` and bot auto-rebuy runs in the same settlement batch, recovery may appear as `netCashIn` instead of `netBourreMint` if `computeNextHandFundingMintDelta` is 0 (e.g. `skipNextAnte` / `bourreReplacementDue` path). See `proof:live-bankroll` scenario G.

## Hard invariant (canonical)

After every hand and every money-moving event:

```
sum(player bankrolls) + sum(postedAntes) + carryOverPot
  == tableStartingTotal + netCashIn + netBourreMint − netCashOut
```

Production guard: `assertTableChipInvariant()` / `logTableChipInvariant()` in `tableInvariant.ts`.

Strict mode (throws on mismatch): `NBL_INVARIANTS=1`, `NODE_ENV=test`, `localStorage nbl-invariants=1`, or `?invariants=1`.

Dev UI reconciliation: with `localStorage.setItem('nbl-invariants','1')`, watch `[nbl-table-invariant]` logs after settlement/rebuy; soak logs `{ tableId, handId, uiMatchesLedger }`.

---

## OPEN_RULE_ORPHAN_SEAT

**Status:** Implemented in `handleRecordHand` — settlement fails before writes.

- A score row with **positive bankroll** that is absent from `session.players` is an **accounting-integrity error**.
- It cannot be silently ignored, deleted, or excluded from canonical totals.
- Server must reject settlement with `ORPHAN_SEAT_RECONCILIATION_REQUIRED` until explicit reconciliation (PR2/PR3 scope).
- `seatPlayerIds()` may still list orphan ids for diagnostics; invariant math must not proceed without reconciliation.
