# Hand lifecycle state machine

Session phases are derived in `src/session/handLifecycle.ts` and enforced in `docs/firestore.js` / `docs/app.js`.

## Phases

`waitingForPlayers → opening → deal → draw → play → settle → handoffToNextDeal → opening …`

Authoritative writes (deal, draw, play cards, record hand) live in Firestore helpers. UI animations do **not** gate the next hand.

## Old stuck condition

After settlement, `recordHand` cleared `currentHand` but left a stale `liveEnrollment.deal.publicHand` with `phase: play`. `getSessionEnrollment` returned `null` when any deal existed, while `getSessionCurrentHand` still showed the old play hand. The table looked finished but never re-opened I'm-in / deal.

## Fix

1. **`clearLiveEnrollmentDealPatch()`** on `recordHand` and `ensureHandEnrollment` removes stale deal snapshots when a hand ends.
2. **`getSessionEnrollment`** prefers `liveEnrollment.active` before the stale-deal guard.
3. **`maybeRecoverHandLifecycle()`** in `docs/app.js` auto-opens the next join window when the live table overlay is open after settlement.

## Multi-hand loop on the live table

When **Go to Table** is open and a hand settles:

1. **`recordHand`** advances **`dealerId`** clockwise via `nextDealerId`, increments **`handCount`**, clears hand/enrollment, and clears stale deal artifacts.
2. Hero shows *"Hand complete — settling and opening the next deal…"* while the UI finishes trick/settlement feedback.
3. After a **2s** settle pause (or **12s** watchdog if stalled), **`openNextHandEnrollment()`** calls **`ensureHandEnrollment`**, plays shuffle feedback, and restarts the **I'm in** enrollment loop from the new dealer — no second **Go to Table** tap.

If the table overlay is closed, behavior is unchanged: someone taps **Go to Table** to call **`ensureHandEnrollment`**.

Split-pot and carry-over pots still loop the same way; only the enrollment bootstrap path differs (auto vs manual).

Transition logs use `[hand-lifecycle] from → to: reason` (see `formatLifecycleLog`).
