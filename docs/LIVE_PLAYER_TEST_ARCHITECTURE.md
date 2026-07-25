# Live-player test architecture

Two-track program for **real multi-user UI flows** (Playwright) and **canonical source-of-truth invariants** (Node unit/guard tests). Goal: catch seating, turn ownership, watch-only, idle, and handoff bugs without a broad refactor.

## File structure

```
docs/
  LIVE_PLAYER_TEST_ARCHITECTURE.md     ← this plan

e2e/
  live-players.emulator.spec.ts        ← Track 1: multi-context emulator E2E (first scenarios)
  helpers/
    livePlayerHarness.ts               ← shared multi-user fixtures (contexts, Play Now, watch-only asserts)
    roomFlow.ts                        ← existing private-room + table phase helpers (reused)

scripts/
  canonical-live-players.test.mjs      ← Track 2: seating/turn/enrollment authority guards
  public-table-spectator-guard.test.mjs
  public-table-idle.test.mjs
  public-table-watch-only-bot-progress.test.mjs
  canonical-tightening.test.mjs

src/table/
  turnCountdown.test.ts                ← turn actor + sitOut + watchOnly (existing)
  watchOnlyPresentation.test.ts        ← watch-only UI wiring (existing)

functions/
  publicTableIdle.test.mjs             ← idle sit-out policy (existing)
```

## E2E vs canonical split

| Scenario | Tier | Rationale |
| --- | --- | --- |
| Two humans join same private table | **E2E emulator** | Needs real Auth + Firestore member sync + roster |
| Mixed humans + bots happy path | **E2E emulator** | UI enrollment + bot fill; private room is reliable |
| Public mixed: guest spectates mid-hand | **E2E emulator** | Callable matchmaking + `pendingJoins` + watch-only banner |
| Bot-only table + spectator does not freeze | **Canonical + soak** | Timing-sensitive reveal; guarded in `public-table-watch-only-bot-progress.test.mjs` |
| Idle → sit-out (45s) | **Canonical + `publicTableIdle.test.mjs`** | Too slow for CI E2E |
| Sit-out has no false turn urgency | **Canonical** | `turnCountdown` + `table-view-model` wiring |
| Leave / rejoin mid-hand | **E2E (later)** + **canonical handoff guards** | Needs staged hand state; start with watch-only public join |
| Rejoin watch-only until handoff | **Canonical** | `publicTableReplacement.js` + spectator helpers |
| Refresh during reveal/draw/play | **E2E (later)** | Separate reconnect spec once base flows are green |
| Turn ownership | **Canonical** | `resolveTableActiveActorId` |
| Enrollment / dealing eligibility | **Canonical** | `eligibleSeatPlayerIds` + `buildHandEnrollment` guards |
| Settlement write authority | **Canonical** | `canonical-tightening.test.mjs` (existing) |
| Bot advancement authority | **Canonical** | `bot-orchestrator.test.mjs`, `public-table-watch-only-bot-progress` |

## What must be real vs mocked

| Layer | Real | Mocked / skipped |
| --- | --- | --- |
| Playwright multi-user | Separate `browser.newContext()` per user; Auth + Firestore emulators; static `npm run social` | Production Firebase |
| Public Play Now E2E | Auth + Firestore + **Functions** emulators (`npm run emulators`) | Staging/prod callables |
| Canonical suite | Pure modules + `readFileSync` wiring guards | Browser, network |
| Idle 45s / removal 4m | Unit tests with injected timestamps | Real-time E2E wait |

## Reusable Playwright harness (`livePlayerHarness.ts`)

- `clearEmulatorData()` — wipe Auth + Firestore; best-effort verify collections empty
- `waitForPublicTableIndex(n)` — poll emulator until `publicTableIndex` exists (guest matchmaking)
- `roomDetail(page)` / `visibleSetupPlayButton(page)` — scope to visible `#room-detail-view`
- `createPlayerPair(browser, hostLabel, guestLabel)` — sequential two-human contexts (shared browser)
- `joinPublicMixedTableAsSpectator(host, guest)` — host Play Now → index wait → guest spectates
- `rejoinPublicMixedAsSpectator(guest)` — Play Now again after leave (index wait)
- `driveLiveHumansToPlay(pages)` — coordinate enrollment + draw across human overlays
- `leaveCurrentPublicRoom(page)` — leave from room detail or rooms list

## First implemented scenarios (this PR)

### Track 1 — Playwright (`live-players.emulator.spec.ts`)

1. **Two humans join private room** — membership sync + Play enabled.
2. **Two humans private room: enrollment → draw → play** — sequential overlays, coordinated `driveLiveHumansToPlay`.
3. **Mixed humans + bot** — guest joins, host adds robot, 3-seat roster.
4. **Public mixed watch-only + leave/rejoin** — guest spectates; host progresses; guest leaves and rejoins watch-only mid-hand.
5. **Public mixed table root** — seated host + watch-only guest both see table.

Priority scenarios run first in the serial suite. Guest public joins wait for `publicTableIndex` so matchmaking routes to spectate (not create a new seated table).

Nightly CI: `.github/workflows/nightly-live-player-e2e.yml` (optional, not PR-gating; `--retries=1`).

### Track 2 — Canonical (`canonical-live-players.test.mjs`)

1. `pendingJoins` / score-row promotion invariants (spectating vs seated).
2. Turn ownership: `watchOnly` and `sitOutPlayerIds` suppress `resolveTableActiveActorId`.
3. Enrollment eligibility: `sitOut` and `out` excluded from `eligibleSeatPlayerIds` / `buildHandEnrollment` wiring.
4. View-model guardrails: idle sit-out suppresses `isOnTurn` / `isActiveActor`.
5. Public-table identity: spectators skip `ensureSessionPlayer` / watch-only intent handlers.
6. `onLeaveRoom` clears public matchQueue before `leaveRoom` (leave/rejoin hygiene).

## CI commands

```bash
# Canonical (every PR — no Java)
npm run test:rules   # includes canonical-live-players.test.mjs

# Live-player E2E (emulators required)
npm run emulators    # terminal 1 — auth :9099, firestore :8088, functions :5001
PLAYWRIGHT_EMULATORS=1 npm run test:e2e:live-players
```

## Next increments (not in this PR)

- Public table promotion at handoff (guest becomes seated next deal — needs hand completion)
- Reconnect/refresh matrix (reveal, draw, play, settlement)
- Full idle sit-out E2E with injected clock (Functions emulator test hook)
- Bot-only + spectator freeze regression as Playwright (optional; canonical guard exists)

## Principles

- Preserve production behavior; only fix bugs proven by failing tests.
- Tiny, isolated fixes — no architecture rewrite.
- Explicit semantics for bots, humans, spectators, and rejoin in test names and helpers.
