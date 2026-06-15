# Bourré Cloud Functions — server-authoritative play

Deal, draw, trick play, enrollment, and settlement run in Cloud Functions using the same
pure engine as the client (`src/game/` → `functions/vendor/game-engine.js`).

## Callable functions

| Function | Purpose |
|----------|---------|
| `gameEnsureHandEnrollment` | Start in/out enrollment between hands |
| `gameTimeoutEnrollment` | Auto sit-out on enrollment timer |
| `gameSetHandParticipation` | "I'm in" during enrollment (may deal) |
| `gameSubmitDraw` | Draw / stand pat |
| `gamePlayCard` | Play one card (auto-settles when hand completes) |
| `gameRecordHand` | Pot / bourré settlement + next-hand reset |
| `gameVoteCoWinSettlement` | Co-winner split / decline vote |

## Setup

```bash
# From repo root — sync engine and install function dependencies
npm run build:functions

# Or manually:
npm run build:game
node scripts/sync-functions-engine.mjs
npm install --prefix functions --omit=dev
```

`npm run deploy` runs `build:functions` automatically. If deploy warns that
`firebase-functions` is missing, run `npm install --prefix functions` once.

## Local emulators

```bash
npm run build:functions
npm run emulators          # auth + firestore + functions
npm run social             # http://localhost:8080
```

The client connects to the Functions emulator on `127.0.0.1:5001` when served from localhost
(`docs/firebase-config.js` → `SERVER_HAND_AUTHORITY = true`).

## Deploy

```bash
npm run build:functions
firebase deploy --only functions,firestore:rules
```

## Firestore rules

Clients **cannot** write `privateHands`, `hands` ledger docs, or session game fields
(`currentHand`, `handEnrollment`, `handCount`, `carryOverPot`, `dealerId`, …).
Score ledger fields (`net`, `tricksWon`, …) are also function-only.

## Engine sync

`npm run build:functions` runs `vite` game build then copies:

- `docs/game-engine.js` → `functions/vendor/game-engine.js`
- `docs/bourre-rules.js` → `functions/vendor/bourre-rules.js`
- `docs/risk-stakes.js` → `functions/vendor/risk-stakes.js`

Always run before deploy when `src/game/` changes.

## Known limitations

- Manual trick +/- (`updateHandTrick`) still uses client writes — disabled when rules are locked; use live card play only.
- Bot moves are still **driven by a room member client** calling `gameSubmitDraw` / `gamePlayCard` for bots; a scheduled bot runner is future work.
