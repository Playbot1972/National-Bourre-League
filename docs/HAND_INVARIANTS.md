# Hand/session invariants

Runtime guards and diagnostics at ownership boundaries so phase/turn/settlement/bot
bugs surface early instead of as mysterious UI or accounting failures.

## Enable strict mode

| Environment | How |
|-------------|-----|
| Node tests | Automatic (`NODE_ENV=test`) |
| Local dev | `NBL_INVARIANTS=1` or browser `localStorage nbl-invariants=1` / `?invariants=1` |
| Production | Illegal **writes** still throw; observability checks log `[nbl-invariant]` unless strict |

## Invariants

| Check | Module | Protects against |
|-------|--------|------------------|
| `assertConsistentHandFlowPhase` | `handInvariants.ts` | Card phase (`play`) disagreeing with session flow phase (wrong HUD turn, bot hints) |
| `assertSingleTurnOwner` | `handInvariants.ts` | Multiple/missing turn owners; `turnPlayerId` not in `participantIds` |
| `assertHandFlowTransition` | `handInvariants.ts` | Illegal phase jumps (e.g. `play_card` from `waiting`) |
| `assertHandActionAllowed` | `handInvariants.ts` | Out-of-turn actions + undocumented transitions at write time |
| `assertSettlementEntryAllowed` | `handInvariants.ts` | `win`/`split` settlement before 5 tricks unless push/solo/carry |
| `assertSessionChipConserved` | `handInvariants.ts` | Chip creation/destruction at settlement (`bankrolls + carry + antes`) |
| `assertBotAdvanceNotInFlight` | `handInvariants.ts` | Duplicate concurrent bot-advance **execute** (request coalesce is OK) |
| `checkInvariant` (bot step cap) | `gameHandlers.js` | Runaway server bot loop (>64 steps) |

## Call sites

| Boundary | Functions |
|----------|-----------|
| Client draw/play/fold | `docs/firestore.js` → `assertCanSubmitHandAction` → `assertHandActionAllowed` |
| Server draw/play/fold | `functions/gameHandlers.js` → same |
| Settlement | `recordHandClient` / `handleRecordHand` → `assertSettlementEntryAllowed` + chip check |
| Auto-settle after tricks | `finalizeHandFromCardPlay` (client + server) |
| Bot advance (client) | `docs/bot-orchestration-runtime.js` (`assertBotAdvanceNotInFlight` on execute) |
| Bot advance (server) | `advanceBotsAfterAction` step-cap diagnostic |
| Orchestration (dev) | `runSessionOrchestration` + `isGameFlowDebugEnabled()` → `assertHandFlowConsistent` |

## Tests

- `src/session/handInvariants.test.ts` — pure invariant behavior
- `scripts/hand-invariants.test.mjs` — wiring at ownership boundaries

Run: `npm run test:session` and `npm run test:rules` (includes hand-invariants).

## Source layout

```
src/session/handInvariants.ts   — pure checks
src/session/invariantDebug.ts   — strict-mode flag
docs/session-startup.js         — bundled export (client + CF vendor)
```
