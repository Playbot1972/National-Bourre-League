# Table sound assets (legacy pointer)

Runtime WAV files live in **`public/sounds/`** and are served at **`/sounds/`** on the site root
(Vite copies `public/` → `dist/`; Firebase Hosting serves `dist/sounds/`).

Install or refresh assets from your Downloads folder:

```bash
chmod +x scripts/copy-table-sounds.sh
./scripts/copy-table-sounds.sh ~/Downloads
```

Verify on disk and after hosting build:

```bash
npm run verify:sounds
npm run verify:sounds:dist   # after npm run build:hosting
```

Until files are present, procedural Web Audio fallbacks in `src/table/feedback/audio.ts`
remain active.

See **`public/sounds/MANIFEST.json`** for the canonical file list and
`src/table/feedback/soundPacks.ts` for event → filename mapping.

## Local dev

`npm run social` serves the static social app from `docs/` and mounts `public/sounds/` at
`/sounds/*` via `scripts/serve-social.mjs`.

## Debug

Table footer includes a **Test card-select.wav** button. Enable verbose console logging:

```js
localStorage.setItem("nbl-table-audio-debug", "1"); // reload table
```

Logs are prefixed `[table-audio]` and report requested keys, resolved `src`, `onload`,
`onloaderror`, `onplay`, and `onplayerror`.

Automated browser coverage: `npm run test:e2e:audio`.
