# Hand presentation pipeline

Visual playback for the full Bourré hand lifecycle extends the trick presentation system in `src/table/trickPresentationMachine.ts`.

## Phases

`handReset → ante → trumpReveal → enrollment → drawPlayer → drawReady → play → settle → nextHandReset`

- **`play`** delegates trick resolution to `useTrickPresentation` (unchanged pipeline).
- All other phases are driven by `handPresentationMachine.ts` + `useHandPresentation.ts`.

Authoritative Firestore/session state is never delayed; the UI buffers and sequences animations locally.

## Timing

Central constants live in `src/table/handPresentationTiming.ts` (ante, deal stagger, trump hold, draw discard/replace, draw-ready beat, settle, next-hand reset).

Trick hold after the last card of a trick uses `POST_TRICK_READ_MS = 2000` in `src/table/trickTiming.ts`.

## Watchdog

`PRESENTATION_WATCHDOG_MS` (12s) forces phase advance if a timer callback is missed.

## Tests

`npm run test:table` includes `handPresentationMachine.test.ts`.
