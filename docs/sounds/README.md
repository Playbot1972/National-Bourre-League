# Table sound assets

Art-directed WAV files for the table feedback service. Loaded at runtime from
`./sounds/*.wav` (social app root → `/social/sounds/` after deploy).

Install from your Downloads folder:

```bash
chmod +x scripts/copy-table-sounds.sh
./scripts/copy-table-sounds.sh ~/Downloads
```

Until files are copied, procedural Web Audio fallbacks in `src/table/feedback/audio.ts`
remain active.

## Classic pack (15 files)

| File | Sound ID | Event |
| --- | --- | --- |
| `card-place-normal.wav` | `card-place-normal` | Card lands in trick (tier 0) |
| `card-place-soft.wav` | `card-place-soft` | Card lands (tier 1) |
| `card-place-heavy.wav` | `card-place-heavy` | Card lands (tier 2) |
| `lead-sweetener-light.wav` | `lead-sweetener-light` | Takes trick lead (tier 0–1) |
| `lead-sweetener-strong.wav` | `lead-sweetener-strong` | Takes trick lead (tier 2) |
| `trick-win-normal.wav` | `trick-win-normal` | Trick resolved |
| `trick-win-big.wav` | `trick-win-big` | Local player wins trick |
| `hand-win-stinger.wav` | `hand-win-stinger` | Local player wins hand / pot |
| `card-shuffle-normal.wav` | `card-shuffle-normal` | Hand deal shuffle |
| `card-shuffle-final.wav` | `card-shuffle-final` | Final deal shuffle sting (`shuffleFinal`) |
| `card-select.wav` | `card-select` | Card tap / queue in hand |
| `card-illegal.wav` | `card-illegal` | Illegal play attempt |
| `ui-button-press.wav` | `ui-button-press` | Draw / pat / fold + game start |
| `coin-chime-light.wav` | `coin-chime-light` | Trick collected to pile |
| `victory-jingle.wav` | `victory-jingle` | Bourré moment |

**Procedural only:** `draw` (no dedicated asset yet).

## Premium packs

Optional themed overrides use the same filenames under:

| Folder | Theme |
| --- | --- |
| `packs/wood/` | Warm wood & felt |
| `packs/arcade/` | Bright arcade |

## Architecture

| Layer | Module |
| --- | --- |
| Asset registry | `src/table/feedback/soundPacks.ts` |
| Playback + preload | `src/table/feedback/audio.ts` |
| Cooldowns + unlock | `src/table/feedback/service.ts` |
| Animation sync | `src/audio/AudioManager.ts` + `useCardAudio` |

Preload runs after the first user gesture (`unlockAudio` → `preloadSoundAssets`).

**Sound level:** On / Minimal / Off in table feedback settings. Minimal plays trick wins, pot wins, and bourré only.

Keep files short and normalized for mobile speakers. See **Production format** in the implementation notes for WAV vs MP3 guidance.
