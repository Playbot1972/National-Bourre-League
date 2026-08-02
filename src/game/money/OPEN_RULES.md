# Money engine — open rules and policy

## OPEN_RULE_CASH_OUT

**Status:** Not implemented in production.

- There is no `cashOut` / `processCashOut` API in the money engine or Firestore layer.
- `netCashOut` in the ledger invariant is always **0** for live sessions.
- Elimination sets `out: true` on score rows; chips are not removed from the table total.
- **Test only:** `LedgerAuditSession.simulateCashOut()` and `applyCashOutToBaseline()` in audit harnesses.

### If cash-out is added later

| Item | Requirement |
|------|-------------|
| API shape | `processCashOut({ actionId, playerId, amount, existingEvents, ledger })` emitting `CASH_OUT_APPLIED` |
| Invariant | `netCashOut += amount`; debit player bankroll; `assertTableChipInvariant` after write |
| Firestore | Callable + rules restricting self cash-out; atomic score patch + money event |
| Tests | Direct API tests (zero, negative, overdraft), regression invariant, soak with occasional cash-out |
| Session baseline | Increment `moneyLedgerBaseline.netCashOut` on each successful cash-out |

---

## OPEN_RULE_BOURRE_MINT

**Status:** Implemented — engine mints chips when bourré penalty exceeds available bankroll.

- Canonical helper: `bourrePotMintByPlayer()` in `canonical.ts`.
- Minted chips fund the next-hand pot (not removed from table total).
- Tracked in invariant baseline as **`netBourreMint`** (session doc `moneyLedgerBaseline.netBourreMint` or event metadata `bourrePotMint`).
- `reconcileChipDrift()` in audit harness attributes unexplained positive chip growth to bourré mint.

---

## Hard invariant (canonical)

After every hand and every money-moving event:

```
sum(player bankrolls) + sum(postedAntes) + carryOverPot
  == tableStartingTotal + netCashIn + netBourreMint − netCashOut
```

Production guard: `assertTableChipInvariant()` / `logTableChipInvariant()` in `tableInvariant.ts`.

Strict mode (throws on mismatch): `NBL_INVARIANTS=1`, `NODE_ENV=test`, `localStorage nbl-invariants=1`, or `?invariants=1`.
