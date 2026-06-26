# UI layer boundaries (step 5)

## Layers

| Layer | Modules | Responsibility |
|-------|---------|----------------|
| **Presentation** | `table-view-model.js`, `table-session.js` (React mount) | Map session state → props; animations |
| **Intent** | `table-intents.js` | Submit human actions to Firestore / CF |
| **Feedback** | `table-feedback.js`, `src/table/feedback/` | Sound/haptics; no game truth |
| **Orchestration** | `session-orchestrator.js`, `bot-orchestrator.js`, `app.js` orchestration runtime | Timers, bot requests, lifecycle recovery |
| **Truth** | `firestore.js`, Cloud Functions | Persisted session/hand state |

## `app.js` responsibilities (after step 5)

| Stays in `app.js` | Extracted |
|-------------------|-----------|
| Auth, rooms, DOM `renderRoomDetail` | `buildTableFeedbackSnapshot` → `table-view-model.js` |
| Firestore subscriptions | Feedback diff → `table-feedback.js` |
| `buildTableSessionProps` (view model assembly) | Table action handlers → `table-intents.js` |
| `syncTableSession` (mount only) | |
| Orchestration runtime (timers, bots) | Documented in `SESSION_ORCHESTRATOR.md` |

## Data flow

```
Firestore onSnapshot
  → app.js state (currentSessions, openScores, …)
  → buildTableSessionProps()     [presentation props]
  → syncTableSession()           [mount table-session.js]
  → scheduleSessionOrchestration [orchestration — not render]

User click on table
  → table-intents handler
  → firestore.js / game-functions.js
  → server truth update
  → snapshot → re-render (observe only)
```

## `table-session.js`

Built bundle from `src/table/` — presentation + local animation state machines only.
Does not call Firestore; receives props + `actions` callbacks from `app.js`.

## Follow-up cleanup (not in step 5)

- Extract `buildTableSessionProps` player-flag mapping to `table-view-model.js`
- Move orchestration runtime from `app.js` to `table-orchestration-runtime.js` factory
- Extract hand lifecycle (`openNextHandEnrollment`) to `session-lifecycle.js`
- Split `renderRoomDetail` HTML builders into `room-detail-view.js`

See also [`HAND_INVARIANTS.md`](HAND_INVARIANTS.md) for runtime guards at write boundaries.
