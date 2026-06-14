# Table sound assets

Drop final MP3 files here for production audio. The table feedback service loads
these at runtime and falls back to procedural Web Audio when a file is missing.

| File | Event |
| --- | --- |
| `shuffle.mp3` | Hand deal, draw replacement |
| `trick-win.mp3` | Local player wins a trick |
| `big-win.mp3` | Local player wins the hand / pot |

**Hosting path:** `./sounds/*.mp3` relative to the social app root (`docs/` → `/social/sounds/` after deploy).

**TODO(sound):** Replace procedural placeholders in `src/table/feedback/audio.ts` once art-directed assets are checked in here.

Keep files short (&lt; 50 KB each) and normalized for mobile speakers.
