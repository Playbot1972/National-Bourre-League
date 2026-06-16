# Trick presentation buffering

The live table separates **authoritative game state** (Firestore / `currentHand`) from **visual presentation state** (`src/table/trickPresentationMachine.ts`).

When the server advances quickly (especially with bots), incoming snapshots are **buffered** while the UI runs this pipeline:

`live → trickComplete → winnerReveal → collectTrick → nextLeadReady → live`

During any non-`live` phase:

- Center trick cards stay frozen until collection finishes.
- Trick counts on seats update only when `collectTrick` begins.
- Turn/lead indicators stay suppressed until `live` resumes.
- New `currentTrick` / `tricksByPlayer` updates are stored in `pendingServer` and applied after the pipeline completes.

Timing constants live in `src/table/trickTiming.ts` (1400 ms read, 400 ms winner reveal, 300 ms sweep, 200 ms next-lead gap). Reduced-motion shortens but does not remove the readable hold.

Hand lifecycle after settlement is independent: `recordHand` clears stale `liveEnrollment.deal` snapshots and opens enrollment; a 12 s watchdog in `docs/app.js` calls `ensureHandEnrollment` if opening stalls.
