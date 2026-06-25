# Hand phase state machine (step 2)

## Design

Session hand flow is modeled as seven **flow phases** that sit above the card-engine
phases on `currentHand.phase` (`reveal` | `decision` | `draw` | `play`).

| Flow phase | Meaning | Derived from |
| --- | --- | --- |
| `waiting` | No hand in progress, no enrollment | Cleared hand, no enrollment |
| `enrollment` | Pre-deal join / Pagat play-pass | `handEnrollment.active`, `liveEnrollment.active`, or `phase === decision` |
| `deal` | Trump reveal (cards dealt) | `currentHand.phase === reveal` |
| `draw` | Replacement round | `currentHand.phase === draw` |
| `play` | Trick play (< 5 tricks) | `currentHand.phase === play` |
| `settle` | Hand ending / co-win vote | 5 tricks complete or `pendingCoWinSettlement` |
| `next-hand-prep` | Post-settle handoff before next join window | Cleared hand after `handCount > 0` |

Card-engine phases are unchanged on the Firestore document; the flow machine **reads**
them and centralizes guards.

## Module

**Source:** `src/session/handPhaseMachine.ts`  
**Build:** `npm run build:session-startup` → `docs/session-startup.js`  
**Functions vendor:** synced via `scripts/sync-functions-engine.mjs`

### API

| Function | Role |
| --- | --- |
| `deriveHandFlowPhase(input)` | Map session fields → flow phase |
| `buildHandFlowSnapshot(ctx)` | Normalized phase + turn + flags |
| `HAND_FLOW_TRANSITIONS` | Explicit `from` + `event` → `to` table |
| `isHandFlowTransitionAllowed` / `nextHandFlowPhase` | Transition validation |
| `resolveHandFlowTurnPlayerId` | Whose turn (enrollment / draw / play) |
| `canSubmitHandAction` | Client/server action guard |
| `resolveBotAdvanceHint` / `canAdvanceBots` | Bot loop eligibility |

### Happy-path transitions

```
waiting → enrollment → deal → draw → play → settle → next-hand-prep → enrollment …
```

Events: `open_enrollment`, `enrollment_complete`, `advance_reveal`, `draw_complete`,
`hand_complete`, `record_hand`, …

## Files updated

| File | Change |
| --- | --- |
| `src/session/handPhaseMachine.ts` | **New** — state machine + guards |
| `src/session/handPhaseMachine.test.ts` | **New** — transitions + guards |
| `src/session/tableStartup.ts` | Re-exports machine API |
| `src/session/handLifecycle.ts` | Re-exports machine; legacy aliases kept |
| `src/table/localAction.ts` | Uses `canSubmitHandAction` for draw/play |
| `docs/firestore.js` | Draw/play/fold guards via `assertCanSubmitHandAction` |
| `functions/gameHandlers.js` | `advanceBotsAfterAction` via `resolveBotAdvanceHint` |
| `scripts/sync-functions-engine.mjs` | Syncs `session-startup.js` to functions vendor |

## Deprecated / removed duplication

| Before | After |
| --- | --- |
| Inline `phase === DRAW` + `turnPlayerId` checks in firestore/gameHandlers | `canSubmitHandAction` |
| `advanceBotsAfterAction` phase switches (120+ lines) | `resolveBotAdvanceHint` switch |
| Duplicate `enrollmentDeadlineMs` in firestore + gameHandlers | `session-startup.js` export |
| Duplicate `canActForPlayer` in firestore + gameHandlers | `session-startup.js` export |
| `handLifecycle` phase names (`opening`, `handoffToNextDeal`) | Still exported for app.js; new code uses `HAND_FLOW_PHASE` |

## Not in scope (step 2)

- UI presentation machine (`handPresentationMachine.ts`) — still mirrors server loosely
- Full reducer wiring for enrollment/deal/play mutations (step 3+)
- Replacing all `phase ===` checks in `app.js`

## Tests

```bash
npm run test:session   # includes handPhaseMachine.test.ts
npm run build:session-startup && npm run test:functions
```
