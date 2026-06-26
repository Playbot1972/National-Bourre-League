# Session orchestrator — render vs game truth (step 4)

## Problem

Firestore snapshots triggered `scheduleRenderRoomDetail` → `renderRoomDetail`, which
**directly** called `processRobotActions`, `startEnrollmentTimer`, and
`maybeRecoverHandLifecycle`. `syncTableSession` duplicated the same side effects.
Every score/hand/private-hand update re-fired authoritative paths — a "hydra" of
competing bot advances and enrollment timers.

## Fix

**Rendering observes; orchestration reacts.**

```
Firestore snapshot
  └─ scheduleRenderRoomDetail (DOM only, 80ms debounce)
  └─ scheduleSessionOrchestration (side effects, 100ms debounce + coalesce)
       └─ runSessionOrchestration
            ├─ maybeRecoverHandLifecycle (authoritative — explicit timer)
            ├─ startEnrollmentTimer (tick → scheduleSessionOrchestration only)
            └─ processRobotActions → scheduleServerBotAdvance (request only)
```

`syncTableSession` / `renderRoomDetail` now only sync table UI + feedback.

## Timer / render path classification

| Path | Class | After step 4 |
|------|-------|--------------|
| `renderRoomDetail` | Was: render + game actions | **Rendering only** (+ `scheduleTableSessionSync`) |
| `scheduleTableSessionSync` / `syncTableSession` | Was: UI + enrollment + lifecycle | **Sync + feedback only** |
| `processTableFeedbackEvents` | UX feedback | Unchanged |
| `setTableActionFeedback` timer | UX feedback | Unchanged |
| `startEnrollmentTimer` 500ms | Was: direct bot/timeout | **Orchestration tick** (legacy timeout when authority off) |
| `scheduleSessionOrchestration` | Orchestration | **Single debounced entry** |
| `scheduleServerBotAdvance` | Bot request | Unchanged (nested under orchestration) |
| `maybeRecoverHandLifecycle` | Authoritative | Only via orchestration |
| `openNextHandEnrollment` | Authoritative | Explicit call + orchestration schedule |
| Human `onPlayCard` / draw | Authoritative | Firestore CF only; no post-play `processRobotActions` |
| Table presentation timers | UX feedback | `wakeRobotActions` → orchestration schedule |

## Storm protection

- `sessionOrchestrationTimer` + `sessionOrchestrationCoalesce` — coalesce rapid snapshot storms
- `startEnrollmentTimer` no longer restarts on every orchestration run (idempotent if already ticking)
- `stopTablePlaySideEffects` clears orchestration + bot advance + enrollment on table close

## Logging

`[session-orchestrator]` — `schedule`, `coalesce`, `run` with `reason` / `sessionId`

## Files

| File | Change |
|------|--------|
| `docs/session-orchestrator.js` | **New** — debounce constant + log helper |
| `docs/app.js` | Central orchestration; render/sync stripped of game mutations |
| `scripts/session-orchestrator.test.mjs` | Static guards |

## Verification

```bash
node --check docs/app.js
npm run test:rules   # includes session-orchestrator.test.mjs
```
