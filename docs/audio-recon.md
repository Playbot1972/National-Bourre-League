# Audio recon — National Bourré League

Last updated: 2026-07-12 (branch `cursor/audio-recon-wire-46fb`)

## Summary

| Item | Value |
| --- | --- |
| Authoritative registry | `src/table/feedback/soundPacks.ts` |
| Playback (migrated cues) | Howler via `AudioManager.get().play()` |
| Asset root | `public/sounds/` → served at `/sounds/*.wav` |
| Feedback wrappers | `src/table/feedback/service.ts` (prefs + haptics) |
| Low-level play API | `src/table/feedback/audio.ts` |
| Animation card cues | `dispatchCardAudio()` in `src/audio/AudioManager.ts` |
| Social app bridge | `docs/table-feedback.js` + `mount.tsx` exports |

**Note:** `src/table/CallerCues.ts` does not exist in this repo. Table cues are driven by `docs/table-feedback.js`, `service.ts`, `useCardAudio`, and `HeroHand.tsx`.

**Fallback policy (migrated keys):** No procedural Web Audio, no synthetic beeps, no `docs/sounds/` paths. Missing assets or failed Howler plays log `[nbl-audio] FAIL` with `fallback: false`.

---

## Authoritative event → asset map

Source: `SOUND_EVENT_TO_ASSET` and `resolveSoundAsset()` in `soundPacks.ts`.

| Event key | Asset ID | Resolved URL |
| --- | --- | --- |
| `shuffle` | `card-shuffle-normal` | `/sounds/card-shuffle-normal.wav` |
| `gameStart` | `card-shuffle-normal` | `/sounds/card-shuffle-normal.wav` |
| `shuffleFinal` | `card-shuffle-final` | `/sounds/card-shuffle-final.wav` |
| `openRoom` | `card-shuffle-final` | `/sounds/card-shuffle-final.wav` |
| `draw` | `draw` | `/sounds/draw.wav` |
| `cardPlace` (tier 0/1/2) | `card-place-normal` / `soft` / `heavy` | `/sounds/card-place-*.wav` |
| `leadChange` (tier 0–1 / 2+) | `lead-sweetener-light` / `strong` | `/sounds/lead-sweetener-*.wav` |
| `trickWin` | `trick-win-normal` or `trick-win-big` | `/sounds/trick-win-*.wav` |
| `trickCollect` | `coin-chime-light` | `/sounds/coin-chime-light.wav` |
| `handWin` | `coin-chime-light` | `/sounds/coin-chime-light.wav` |
| `potWin` | `hand-win-stinger` | `/sounds/hand-win-stinger.wav` |
| `bigWin` | `hand-win-stinger` | `/sounds/hand-win-stinger.wav` |
| `bourre` | `Fahhh` | `/sounds/Fahhh.wav` |
| `cardSelect` | `card-select` | `/sounds/card-select.wav` |
| `cardIllegal` | `card-illegal` | `/sounds/card-illegal.wav` |
| `deleteRoom` | `card-illegal` | `/sounds/card-illegal.wav` |
| `uiButton` | `ui-button-press` | `/sounds/ui-button-press.wav` |
| `fold` | `card-place-heavy` | `/sounds/card-place-heavy.wav` |

Manifest mirror: `public/sounds/MANIFEST.json`.

---

## Full trigger table

| # | User / game action | Source file | Function / call site | Event key | Final URL | Trigger type | Fallback? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Hand deal / trump revealed | `docs/table-feedback.js` | `applyTableFeedbackDiff` → `api.playShuffleFeedback` | `shuffle` | `/sounds/card-shuffle-normal.wav` | animation | No |
| 2 | Same (React table mount) | `src/table/feedback/service.ts` | `playShuffleFeedback` | `shuffle` | `/sounds/card-shuffle-normal.wav` | animation | No |
| 3 | Next-hand open (live table) | `docs/app.js` | `openNextHandEnrollment` → `playShuffleFeedback` | `shuffle` | `/sounds/card-shuffle-normal.wav` | animation | No |
| 4 | Session / enrollment start | `docs/app.js` | `onStartSession` → `playGameStartFeedback` | `gameStart` | `/sounds/card-shuffle-normal.wav` | action | No |
| 5 | Draw replacement lands | `docs/table-feedback.js` | `applyTableFeedbackDiff` → `playDrawFeedback` | `draw` | `/sounds/draw.wav` | action | No |
| 6 | Card played to trick (lands) | `src/table/hooks/useCardAudio.ts` | `onCardLanded` → `dispatchCardAudio` | `cardPlace` | `/sounds/card-place-*.wav` | animation | No |
| 7 | Lead changes mid-trick | `useCardAudio.ts` | `onCardLanded` (takesLead) → `dispatchCardAudio` | `leadChange` | `/sounds/lead-sweetener-*.wav` | animation | No |
| 8 | Trick winner reveal | `useCardAudio.ts` | `winnerReveal` effect → `dispatchCardAudio` | `trickWin` | `/sounds/trick-win-*.wav` | animation | No |
| 9 | Trick pile collection | `useCardAudio.ts` | `onTrickCollectionStart` → `dispatchCardAudio` | `trickCollect` | `/sounds/coin-chime-light.wav` | animation | No |
| 10 | Local player wins hand | `docs/table-feedback.js` | `handComplete && myIsWinner` → `playBigWinFeedback` | `bigWin` | `/sounds/hand-win-stinger.wav` | outcome | No |
| 11 | Player bourré’d | `docs/table-feedback.js` | `myBourre` edge → `playBourreFeedback` | `bourre` | `/sounds/Fahhh.wav` | outcome | No |
| 12 | Open room (non-silent) | `docs/app.js` | `openRoom` → `playOpenRoomFeedback` | `openRoom` | `/sounds/card-shuffle-final.wav` | action | No |
| 13 | Delete room (confirmed) | `docs/app.js` | `onDeleteRoom` → `playDeleteRoomFeedback` | `deleteRoom` | `/sounds/card-illegal.wav` | action | No |
| 14 | Hero tap-select card (play) | `src/table/HeroHand.tsx` | `handleTapPlay` → `playCardSelectFeedback` | `cardSelect` | `/sounds/card-select.wav` | action | No |
| 15 | Hero draw discard toggle (add) | `HeroHand.tsx` | `toggleDrawIndex` → `playCardSelectFeedback` | `cardSelect` | `/sounds/card-select.wav` | action | No |
| 16 | Draw / Stand pat buttons | `HeroHand.tsx` | `runDrawAction` / `runPassDraw` → `playUiButtonFeedback` | `uiButton` | `/sounds/ui-button-press.wav` | action | No |
| 17 | Fold (“I’m Out”) | `HeroHand.tsx` | `runFoldDraw` → `playFoldFeedback` | `fold` | `/sounds/card-place-heavy.wav` | action | No |
| 18 | Illegal card play | `HeroHand.tsx`, `TableSessionView.tsx` | `playIllegalActionFeedback` | `cardIllegal` | `/sounds/card-illegal.wav` | action | No |
| 19 | Dev test button | `src/App.tsx` | 🔊 Test sound → `playCardSelectSound` | `cardSelect` | `/sounds/card-select.wav` | action | No |

### Registered but not actively fired

| Event key | Asset | Notes |
| --- | --- | --- |
| `shuffleFinal` | `/sounds/card-shuffle-final.wav` | Mapped; no current call site (use `openRoom` for room-entry stinger) |
| `handWin` | `/sounds/coin-chime-light.wav` | Mapped; `bigWin` covers hand-complete in `table-feedback.js` |
| `potWin` | `/sounds/hand-win-stinger.wav` | Mapped; no separate pot-cap splash audio yet |
| `playTrickWinFeedback` | via `trickWin` | Exported from `mount.tsx` but trick win is animation-synced via `dispatchCardAudio` only |

### Haptic-only (no sound)

| Action | Source | Notes |
| --- | --- | --- |
| Generic action success | `TableSessionView.tsx` → `playActionSuccessFeedback` | Haptic only |

---

## Playback paths

```
Call site
  └─ service.ts (maybePlaySound + prefs)     ← UI / snapshot feedback
  └─ audio.ts (playSoundEvent → AudioManager) ← direct sound API
  └─ AudioManager.dispatchCardAudio           ← animation milestones
        └─ resolveSoundAsset (soundPacks.ts)
        └─ AudioManager.get().play(assetId)  ← Howler, /sounds/*.wav
```

Unlock: first `pointerdown` / `keydown` via `initGameFeedback()` → `unlockAudio()` → `AudioManager.unlock()`.

---

## Files inspected

| Path | Role |
| --- | --- |
| `src/table/feedback/soundPacks.ts` | Authoritative registry |
| `src/table/feedback/audio.ts` | Howler play + loud failures |
| `src/table/feedback/service.ts` | Feedback wrappers, cooldowns |
| `src/audio/AudioManager.ts` | Howler singleton + `dispatchCardAudio` |
| `src/table/hooks/useCardAudio.ts` | Animation-synced card/trick audio |
| `src/table/HeroHand.tsx` | Hero select / draw / fold UI sounds |
| `src/table/mount.tsx` | Exports to `docs/table-session.js` |
| `docs/table-feedback.js` | Snapshot diff feedback |
| `docs/app.js` | Room open/delete, game start, shuffle on next hand |
| `src/App.tsx` | Dev test button |
| `public/sounds/*.wav` | Committed assets |

**Not used for migrated cues:** `docs/sounds/` (legacy README only; assets live in `public/sounds/`).

---

## QA checklist

1. Serve app (`npm run dev` or `npm run social` + emulators).
2. Open DevTools → filter `[nbl-audio]`.
3. First gesture unlocks audio (`unlock` log).
4. Each action above should log `request` with `path: "/sounds/…"` and **no** `fallback: true`.
5. If a cue is silent, check for `FAIL` with `audio-not-unlocked`, `no-asset-mapping`, or `howler-play-failed`.
