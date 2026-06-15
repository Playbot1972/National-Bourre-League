# Booray icon system

One consistent **BOORAY** logo for App Store, Play Store, PWA / Add to Home Screen, and favicons.

## Pixel-perfect source (recommended)

**Option A — drag into the repo**

Save your official artwork as:

```
assets/icons/booray-logo-source.png
```

Then run:

```bash
npm run icons:generate
```

**Option B — import from any path**

```bash
npm run icons:import -- /path/to/your/booray-logo.png
```

Chat image attachments do not reach the cloud agent as files; add the PNG to the repo path above (or pass a local path with `icons:import`).

All platform exports rasterize from `booray-logo-source.png` when present. If absent, exports fall back to `booray-icon-master.svg`.

## Vector master

| File | Use |
| --- | --- |
| `booray-icon-master.svg` | **Canonical logo** — ace, fan cards, rings, BOORAY wordmark |
| `booray-brand-full.svg` | Same artwork (alias of master) |
| `booray-icon-app.svg` | Same artwork (alias of master) |
| `booray-spade-mark.svg` | Ornate spade only (in-app compact mark) |

Maskable and Android adaptive foreground layers are generated programmatically from the master (84% / 66% safe-zone scaling).

## Generate PNG exports

```bash
npm run icons:generate
```

Outputs identical runtime sets to `public/icons/` and `docs/icons/`, plus store bundle `assets/icons/store/`.

| Output | Size | Purpose |
| --- | --- | --- |
| `icon-1024.png` / `app-store-icon-1024.png` | 1024 | App Store |
| `play-store-icon-512.png` | 512 | Play Store |
| `icon-512.png` | 512 | PWA |
| `icon-192.png` | 192 | PWA |
| `icon-512-maskable.png` | 512 | PWA `purpose: maskable` |
| `apple-touch-icon.png` | 180 | iOS Add to Home Screen |
| `android-adaptive-*-432.png` | 432 | Android adaptive layers |
| `favicon-*` + `favicon.ico` + `favicon.svg` | 16–48 | Browser tabs |

## Native wrapper (when added)

- **iOS:** `assets/icons/store/app-store-icon-1024.png` → Xcode App Icon set
- **Android:** `play-store-icon-512.png` + adaptive layers from `assets/icons/store/`

## Wired references

- `index.html` + `docs/index.html`
- `public/manifest.webmanifest` + `docs/manifest.webmanifest`
- `src/components/BoorayIcon.tsx` — `app` variant uses `/icons/icon-192.png`
