# Booray icon system

One consistent brand mark for **App Store**, **Play Store**, **PWA / Add to Home Screen**, and favicons.

## Design

- **Symbol:** ornate spade on a cream ace card (no wordmark, no letterforms)
- **Palette:** navy felt `#0a0e18`, cream card, blue `#5eb3ff` / red `#e84855` accent rings
- **Store rules:** square full-bleed PNGs, opaque background, no baked corner radius
- **Maskable:** artwork scaled into the Android/PWA safe zone (~72%)

## Source files (`assets/icons/`)

| File | Use |
| --- | --- |
| `booray-icon-master.svg` | **Master 1024×1024** — canonical design source |
| `booray-icon-app.svg` | Square app icon (512 canvas) — PWA, favicon, iOS touch icon raster source |
| `booray-icon-maskable.svg` | PWA `purpose: maskable` / circular launcher crops |
| `booray-adaptive-background.svg` | Android adaptive icon background layer |
| `booray-adaptive-foreground.svg` | Android adaptive icon foreground layer (transparent outside artwork) |
| `booray-brand-full.svg` | Marketing / splash only (includes BOORAY wordmark — **not** used as app icon) |
| `booray-spade-mark.svg` | Shared spade silhouette reference |

## Generate PNG exports

```bash
npm run icons:generate
```

Writes identical runtime sets to:

- `public/icons/` — Vite React app
- `docs/icons/` — static social / hosting app

And store-ready copies to `assets/icons/store/`.

### Sizes produced

| Output | Size | Purpose |
| --- | --- | --- |
| `favicon-16.png` | 16 | Browser tab |
| `favicon-32.png` | 32 | Browser tab |
| `favicon-48.png` | 48 | Browser tab |
| `favicon.ico` | 16+32 | Legacy favicon (multi-size ICO) |
| `favicon.svg` | vector | Modern browser favicon |
| `apple-touch-icon.png` | 180 | iOS Add to Home Screen |
| `icon-192.png` | 192 | PWA manifest (`purpose: any`) |
| `icon-512.png` | 512 | PWA manifest (`purpose: any`) |
| `icon-512-maskable.png` | 512 | PWA manifest (`purpose: maskable`) |
| `icon-1024.png` | 1024 | App Store submission source |
| `play-store-icon.png` | 512 | Play Store listing icon |
| `android-adaptive-background.png` | 432 | Android adaptive background (108dp @ 4×) |
| `android-adaptive-foreground.png` | 432 | Android adaptive foreground (108dp @ 4×) |

`assets/icons/store/` mirrors store filenames:

- `app-store-icon-1024.png`
- `play-store-icon-512.png`
- `android-adaptive-background-432.png`
- `android-adaptive-foreground-432.png`

## Native wrapper (when added)

No Capacitor/Cordova config exists yet. When you add a native shell:

- **iOS:** import `assets/icons/store/app-store-icon-1024.png` into `AppIcon.appiconset` (Xcode generates all sizes)
- **Android:** Play listing → `play-store-icon-512.png`; adaptive launcher → `android-adaptive-*-432.png` in `mipmap-anydpi-v26`

## Wired references

- `index.html` + `docs/index.html` — favicon, apple-touch-icon, manifest, theme-color
- `public/manifest.webmanifest` + `docs/manifest.webmanifest` — 192/512 any + 512 maskable
- `src/components/BoorayIcon.tsx` — in-app React mark matching `booray-icon-app.svg`
