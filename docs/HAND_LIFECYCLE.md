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
3. **`maybeRecoverHandLifecycle()`** in `docs/app.js` logs when the hand is cleared but enrollment has not started; enrollment is **not** auto-opened — members must tap **Go to Table**.

Split-pot and carry-over pots still loop: settlement clears participants and enrollment; the next join window opens when someone taps **Go to Table** (`ensureHandEnrollment`); dealer advances via `nextDealerId` in Firestore.

Transition logs use `[hand-lifecycle] from → to: reason` (see `formatLifecycleLog`).
