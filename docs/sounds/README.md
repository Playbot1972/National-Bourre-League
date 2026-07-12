# Table sound assets

Drop final MP3 files here for production audio. The table feedback service loads
these at runtime and falls back to procedural Web Audio when a file is missing.

## Classic pack (default)

| File | Event |
| --- | --- |
| `shuffle.mp3` | Hand deal |
| `draw.mp3` | Draw / discard replacement |
| `card-place.mp3` | Card lands in trick (base thock) |
| `lead-change.mp3` | Card takes trick lead (sweetener layer) |
| `trick-win.mp3` | Trick resolved / winner reveal |
| `trick-collect.mp3` | Trick cards collected to won pile |
| `big-win.mp3` | Local player wins the hand / pot |
| `bourre.mp3` | Local player goes bourré |
| `game-start.mp3` | Table / game start confirmation |

## Premium packs

Optional themed packs live in subfolders:

| Folder | Theme |
| --- | --- |
| `packs/wood/` | Warm wood & felt cues |
| `packs/arcade/` | Bright arcade chimes |

Each pack folder uses the same filenames as the classic pack table above.

**Hosting path:** `./sounds/*.mp3` or `./sounds/packs/{wood,arcade}/*.mp3` relative to the social app root (`docs/` → `/social/sounds/` after deploy).

**Sound level:** Users can set On / Minimal / Off in table feedback settings. Minimal plays trick wins, pot wins, and bourré only (skips per-card place/lead/collect cues).

Procedural synthesis in `src/table/feedback/audio.ts` remains the fallback until art-directed assets are checked in.

Keep files short (&lt; 50 KB each) and normalized for mobile speakers.

## Adaptive card audio (animation-synced)

Layered card audio is driven by `src/audio/AudioManager.ts` + `src/table/hooks/useCardAudio.ts`:

| Event | Sync point | Sound role |
| --- | --- | --- |
| `card:played` | `TrickPlaySlot` fly-complete (card lands) | Neutral thock |
| `card:lead-change` | Same land moment when card becomes best-in-trick (not card 1) | Thock + sweetener |
| `trick:won` | `winnerReveal` presentation phase | Distinct win stinger |
| `trick:collected` | GSAP collection starts (after `TRICK_RAKE_MS`) | Soft gather whoosh |

## Free asset candidates (not yet checked in)

Production should use a coherent set from royalty-free sources. Suggested starting points:

| Role | Search terms | Suggested sources |
| --- | --- | --- |
| Card place / thock | "playing card put down", "card place leather" | [ZapSplat Playing Cards pack](https://www.zapsplat.com/sound-effect-category/playing-cards/) (check license tier) |
| Lead sweetener | "coin chime", "ui select heavy", "positive ui accent" | [Pixabay Sound Effects](https://pixabay.com/sound-effects/search/ui/) (Pixabay License) |
| Trick win | "win chime", "success fanfare short" | [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds) (CC0) |
| Trick collect | "cards pickup", "soft whoosh short" | ZapSplat playing-cards pickups / [Freesound](https://freesound.org) (verify per-file license) |
| Shuffle / deal | "cards shuffle professional" | ZapSplat shuffle, Freesound CC0 recordings |

**Selection rules:** Prefer WAV sources, normalize levels (place &lt; lead &lt; trick win), avoid long tails, document exact URL + license per file when adding to the repo.

**Current status:** Procedural fallbacks only — no third-party audio files are committed yet.
