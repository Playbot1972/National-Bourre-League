# Table sound assets

Drop final MP3 files here for production audio. The table feedback service loads
these at runtime and falls back to procedural Web Audio when a file is missing.

## Classic pack (default)

| File | Event |
| --- | --- |
| `shuffle.mp3` | Hand deal |
| `draw.mp3` | Draw / discard replacement |
| `trick-win.mp3` | Local player wins a trick |
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

**Sound level:** Users can set On / Minimal / Off in table feedback settings. Minimal plays trick wins, pot wins, and bourré only.

Procedural synthesis in `src/table/feedback/audio.ts` remains the fallback until art-directed assets are checked in.

Keep files short (&lt; 50 KB each) and normalized for mobile speakers.
