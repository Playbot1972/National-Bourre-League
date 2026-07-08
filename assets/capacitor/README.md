# Capacitor asset sources

Raster inputs for `@capacitor/assets` (`npm run cap:assets`).

- `icon.png` — 1024×1024 app icon (from Booray logo)
- `splash.png` — 2732×2732 launch splash (black field + centered icon)

Regenerate sources from repo icons:

```bash
npm run icons:generate
node scripts/prepare-capacitor-assets.mjs
```

Then apply to native projects:

```bash
npm run cap:assets
```
