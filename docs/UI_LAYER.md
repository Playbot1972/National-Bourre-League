# UI layer boundaries

## Layers

| Layer | Modules | Responsibility |
|-------|---------|----------------|
| **Presentation** | `table-view-model.js`, `room-detail-view.js`, `table-session.js` | Map state → props / HTML |
| **Intent** | `table-intents.js` | Submit human actions to Firestore / CF |
| **Feedback** | `table-feedback.js`, `src/table/feedback/` | Sound/haptics; no game truth |
| **Lifecycle UI** | `session-lifecycle-ui.js` | Hand-off labels, lifecycle logging (no writes) |
| **Orchestration** | `session-orchestrator.js`, `bot-orchestrator.js`, `bot-orchestration-runtime.js`, `app.js` runtime | Timers, bot requests, lifecycle recovery |
| **Truth** | `firestore.js`, Cloud Functions | Persisted session/hand state |

## `app.js` responsibilities (after cleanup)

| Stays in `app.js` | Extracted module |
|-------------------|------------------|
| Auth, rooms, subscriptions | `table-view-model.js` — seat flags, pot metrics, leader labels |
| `buildTableSessionProps` assembly | `buildTablePlayerSeatFlags`, `buildTablePotMetrics`, … |
| `syncTableSession` (mount + feedback) | `table-feedback.js` |
| Table actions | `table-intents.js` |
| Next-hand timer + `openNextHandEnrollment` | `session-lifecycle-ui.js` — context + messages |
| Server bot advance scheduling | `bot-orchestration-runtime.js` |
| Game setup / roster HTML | `room-detail-view.js` |
| Session sidebar (notes, ledger) | `app.js` (needs live `openHands` / auth) |

## Data flow

```
Firestore onSnapshot
  → buildTableSessionProps()     [table-view-model + app state]
  → syncTableSession()           [mount table-session.js]
  → scheduleSessionOrchestration [orchestration — not render]

User click → table-intents → firestore.js / game-functions.js
```

## Naming notes

- `isHandoffReadyForEnrollment` (`session-lifecycle-ui.js`) — flat context for next-hand recovery
- `shouldOpenEnrollmentAfterSettle` (`session-startup.js`) — phase-machine context (different API)

## Follow-up cleanup

- Extract `buildSessionSidebarHtml` when hand-history formatters move to `room-detail-view.js`
- `table-orchestration-runtime.js` factory for enrollment timer + `runSessionOrchestration`
- Legacy client bot path in `processRobotActionsInner` → share `resolveBotAdvanceHint`

See also [`HAND_INVARIANTS.md`](HAND_INVARIANTS.md).
