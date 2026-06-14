# Bourré Cloud Functions (scaffolding)

Server-authoritative validation for deal, draw, and card play is **not wired yet**.
The static social app (`docs/firestore.js`) performs honor-system client transactions
for development and testing.

## Intended production path

| Client action today | Future Cloud Function |
| --- | --- |
| Enrollment → deal (`buildDealCompletionPatch`) | `validateDeal` |
| Draw / stand pat (`submitHandDraw`) | `validateDraw` |
| Play card (`playHandCard`) | `validatePlayCard` |
| Trick resolution (inside `applyPlayCard`) | `validatePlayCard` or `validateTrickResolution` |
| Bot draw/play (`robotSubmitDraw`, `robotPlayCard`) | Scheduled or trigger-driven bot runner |
| Rating writes (`applyRankingResults`) | Separate trusted function (see AGENTS.md) |

## Setup (when implementing)

1. Add `firebase-functions` and `firebase-admin` to this package.
2. Bundle or copy the pure engine from `src/game/` (same logic as `npm run build:game`).
3. Register functions in root `firebase.json`:

   ```json
   "functions": { "source": "functions" }
   ```

4. Deploy: `firebase deploy --only functions`

5. Update `docs/firestore.js` to call `httpsCallable('validateDraw')` etc. instead of
   direct Firestore transactions for moves.

## Security notes

- Firestore rules allow any room member to **write** `privateHands` today (honor-system).
  Production must restrict private-hand writes to Cloud Functions only.
- Human private hands remain **owner-read** only; `bot_*` docs are readable by members
  for client-driven bots until bot moves are server-authoritative.
