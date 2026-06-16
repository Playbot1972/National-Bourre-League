# Hand lifecycle state machine

Session phases are derived in `src/session/handLifecycle.ts` and enforced in `docs/firestore.js` / `docs/app.js`.

## Phases

`waitingForPlayers → opening → deal → draw → play → settle → handoffToNextDeal → opening …`

Authoritative writes (deal, draw, play cards, record hand) live in Firestore helpers. UI animations do **not** gate the next hand.

## Old stuck condition

After settlement, `recordHand` cleared `currentHand` but left a stale `liveEnrollment.deal.publicHand` with `phase: play`. `getSessionEnrollment` returned `null` when any deal with deal existed, while `getSessionCurrentHand` still showed the old play hand. The table looked finished but never re-opened I'm-in / deal.

## Fix

1. **`clearLiveEnrollmentDealPatch()`** on `recordHand` and `ensureHandEnrollment` removes stale deal snapshots when a hand ends.
2. **`getSessionEnrollment`** prefers `liveEnrollment.active` before the stale-deal guard.
3. **`maybeRecoverHandLifecycle()`** in `docs/app.js` runs every open-session tick; after 12 s without enrollment while the hand is cleared, it calls `ensureHandEnrollment`.

Split-pot and carry-over pots still loop: settlement clears participants; enrollment opens for the next deal; dealer advances via `nextDealerId` in Firestore.

Transition logs use `[hand-lifecycle] from → to: reason` (see `formatLifecycleLog`).
