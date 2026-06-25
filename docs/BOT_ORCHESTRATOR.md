# Bot orchestrator (step 3)

## Root cause — duplicate advancement paths

Before step 3, **two owners** could drive the same bot turn:

| Path | Trigger | Action |
|------|---------|--------|
| **Server** | `advanceBotsAfterAction` after every handler + `gameAdvanceBots` | `executeBotDraw`, `executeBotPlay`, enrollment, co-win |
| **Client** | `processRobotActionsInner` on every snapshot / timer / wake | `robotSubmitDraw`, `robotPlayCard`, `setHandParticipation`, `voteCoWinSettlement` |

Draw was partially fixed (server path for draw only). **Play, enrollment, and co-win** still used client-direct calls when `SERVER_HAND_AUTHORITY` was on. Multiple triggers (`renderRoomDetail`, 500ms enrollment timer, `wakeRobotActions`, post-play wake) each called `advanceSessionBots` or client bot APIs independently.

**Symptom:** `gameSubmitDraw` / `gamePlayCard` 400 "Not your turn" when client and server both advanced the same bot seat.

## Fix — single owner

```
Client (request only)                Server (executor)
─────────────────────                ─────────────────
processRobotActions
  └─ shouldRequestServerBotAdvance?
       └─ scheduleServerBotAdvance (debounced)
            └─ advanceSessionBots ──────► gameAdvanceBots
                                              └─ handleAdvanceBots
                                                   └─ advanceBotsAfterAction
                                                        └─ executeBotDraw / executeBotPlay / …
```

When `SERVER_HAND_AUTHORITY && tablePlayOpen`:
- Client **never** calls `robotSubmitDraw`, `robotPlayCard`, `setHandParticipation`, or `voteCoWinSettlement` for bots.
- Client only **requests** advancement via debounced `advanceSessionBots`.
- Server is the **sole executor** for all bot phases (enrollment, decision, draw, play, co-win).

When `!SERVER_HAND_AUTHORITY`: legacy client-driven path unchanged.

Human actions unchanged: `submitHandDraw`, `playHandCard`, `setHandParticipation` for the signed-in user.

## Logging

| Layer | Prefix | Events |
|-------|--------|--------|
| Client | `[bot-orchestrator]` | `schedule-request`, `request`, `complete`, `skip-request`, `coalesce-request`, `error` |
| Firestore | `[bot-orchestrator]` | `invoke-gameAdvanceBots`, `gameAdvanceBots-result`, `skip-call` |
| Server | `[bot-advance]` | `request`, `execute`, `skip`, `complete` |

Each log includes `requester` (uid), `owner: "server"`, and skip `reason` when applicable.

## Files

| File | Role |
|------|------|
| `docs/bot-orchestrator.js` | Pure authority helpers + client log helper |
| `docs/robot-draw-authority.js` | Thin re-export (backward compat) |
| `docs/app.js` | `scheduleServerBotAdvance`, unified `processRobotActionsInner` |
| `docs/firestore.js` | `advanceSessionBots` logging + meta |
| `functions/gameHandlers.js` | `advanceBotsAfterAction` / `handleAdvanceBots` logging |

## Proof

```bash
node scripts/proof-bot-orchestrator.mjs
npm run test:rules   # includes scripts/bot-orchestrator.test.mjs
```
