# Booray icon system

Production-ready app icons for App Store, Play Store, PWA, and Add to Home Screen.

## Source files (`assets/icons/`)

| File | Use |
| --- | --- |
| `booray-icon-app.svg` | **Primary square app icon** — simplified ace/spade on dark felt (store + PWA) |
| `booray-icon-maskable.svg` | Android adaptive / maskable safe-zone variant |
| `booray-brand-full.svg` | Marketing / splash — fuller mark with subtle card hints + BOORAY wordmark |
| `booray-spade-mark.svg` | Shared spade silhouette reference |

Replace or refine these SVGs when final brand artwork is available. The current set follows the app palette (dark felt `#0a2218`, gold `#f4d58d`).

## Generate PNG exports

```bash
npm run icons:generate
```

Outputs identical sets to:

- `public/icons/` — Vite React app
- `docs/icons/` — static social / hosting app

### Sizes produced

| Output | Size | Purpose |
| --- | --- | --- |
| `favicon-16.png` | 16 | Browser tab |
| `favicon-32.png` | 32 | Browser tab |
| `favicon-48.png` | 48 | Browser tab |
| `favicon.ico` | 32 | Legacy favicon |
| `apple-touch-icon.png` | 180 | iOS Add to Home Screen |
| `icon-192.png` | 192 | PWA manifest |
| `icon-512.png` | 512 | PWA manifest / Play Store |
| `icon-512-maskable.png` | 512 | PWA maskable / Android adaptive |
| `icon-1024.png` | 1024 | App Store |
| `play-store-icon.png` | 512 | Play Store listing |
| `booray-brand-full-1024.png` | 1024 | Splash / marketing |
| `booray-brand-full-2048.png` | 2048 | High-res splash |

Also copies `booray-icon-app.svg` → `favicon.svg` in `public/` and `docs/`.

## Native wrapper (when added)

Copy generated PNGs into native projects:

- **iOS:** `icon-1024.png` → `AppIcon.appiconset/AppStore.png` (generate full set via Xcode Asset Catalog or `app-icon` tool)
- **Android:** `play-store-icon.png` + adaptive foreground from `icon-512-maskable.png`

No Capacitor/Cordova config exists in this repo yet.

## Wired references

- `docs/index.html` + `index.html` — favicon, apple-touch-icon, manifest, theme-color
- `docs/manifest.webmanifest` + `public/manifest.webmanifest`
