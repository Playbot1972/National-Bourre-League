#!/usr/bin/env node
/**
 * Rasterize Booray icon SVG sources into PWA / store / favicon PNG sets.
 * Run: npm run icons:generate
 */
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "assets", "icons");
const storeDir = join(assetsDir, "store");

const OUTPUTS = [
  { dir: join(root, "public", "icons"), label: "Vite app (public/icons)" },
  { dir: join(root, "docs", "icons"), label: "Social app (docs/icons)" },
];

/** @type {Array<{ name: string, source: string, size: number, opaque?: boolean }>} */
const RASTER_SPECS = [
  { name: "favicon-16.png", source: "booray-icon-app.svg", size: 16, opaque: true },
  { name: "favicon-32.png", source: "booray-icon-app.svg", size: 32, opaque: true },
  { name: "favicon-48.png", source: "booray-icon-app.svg", size: 48, opaque: true },
  { name: "apple-touch-icon.png", source: "booray-icon-app.svg", size: 180, opaque: true },
  { name: "icon-192.png", source: "booray-icon-app.svg", size: 192, opaque: true },
  { name: "icon-512.png", source: "booray-icon-app.svg", size: 512, opaque: true },
  { name: "icon-512-maskable.png", source: "booray-icon-maskable.svg", size: 512, opaque: true },
  { name: "icon-1024.png", source: "booray-icon-master.svg", size: 1024, opaque: true },
  { name: "play-store-icon.png", source: "booray-icon-app.svg", size: 512, opaque: true },
  { name: "android-adaptive-background.png", source: "booray-adaptive-background.svg", size: 432, opaque: true },
  { name: "android-adaptive-foreground.png", source: "booray-adaptive-foreground.svg", size: 432, opaque: false },
  { name: "booray-brand-full-1024.png", source: "booray-brand-full.svg", size: 1024, opaque: true },
  { name: "booray-brand-full-2048.png", source: "booray-brand-full.svg", size: 2048, opaque: true },
];

/** App Store / Play Store canonical copies (same brand, organized for native tooling). */
const STORE_COPIES = [
  { from: "icon-1024.png", to: "app-store-icon-1024.png" },
  { from: "play-store-icon.png", to: "play-store-icon-512.png" },
  { from: "android-adaptive-background.png", to: "android-adaptive-background-432.png" },
  { from: "android-adaptive-foreground.png", to: "android-adaptive-foreground-432.png" },
];

async function rasterize(svgPath, size, outPath, { opaque = false } = {}) {
  const svg = await readFile(svgPath);
  const density = Math.max(144, Math.ceil((size / 512) * 144));
  let pipeline = sharp(svg, { density }).resize(size, size, {
    fit: "contain",
    background: opaque ? { r: 10, g: 14, b: 24, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 },
  });

  if (opaque) {
    pipeline = pipeline.flatten({ background: { r: 10, g: 14, b: 24 } });
  } else {
    pipeline = pipeline.ensureAlpha();
  }

  await pipeline
    .png({ compressionLevel: 9, adaptiveFiltering: true, force: true })
    .toFile(outPath);
}

async function writeFaviconIco(png16Path, png32Path, icoPath) {
  const pngToIco = (await import("png-to-ico")).default;
  const ico = await pngToIco([png16Path, png32Path]);
  await writeFile(icoPath, ico);
}

async function main() {
  await mkdir(storeDir, { recursive: true });

  for (const { dir, label } of OUTPUTS) {
    await mkdir(dir, { recursive: true });
    console.log(`Generating ${label}…`);
    for (const spec of RASTER_SPECS) {
      const src = join(assetsDir, spec.source);
      const dest = join(dir, spec.name);
      await rasterize(src, spec.size, dest, { opaque: spec.opaque });
      console.log(`  ${spec.name} (${spec.size}px)`);
    }

    const fav16 = join(dir, "favicon-16.png");
    const fav32 = join(dir, "favicon-32.png");
    try {
      await writeFaviconIco(fav16, fav32, join(dir, "..", "favicon.ico"));
      console.log("  favicon.ico (16+32 multi-size)");
    } catch {
      await copyFile(fav32, join(dir, "..", "favicon.ico"));
      console.log("  favicon.ico (32px fallback)");
    }

    if (dir.includes("public")) {
      await copyFile(join(assetsDir, "booray-icon-app.svg"), join(root, "public", "favicon.svg"));
    } else {
      await copyFile(join(assetsDir, "booray-icon-app.svg"), join(root, "docs", "favicon.svg"));
    }
  }

  console.log("Generating assets/icons/store/…");
  const primaryDir = OUTPUTS[0].dir;
  for (const { from, to } of STORE_COPIES) {
    await copyFile(join(primaryDir, from), join(storeDir, to));
    console.log(`  ${to}`);
  }
  await copyFile(join(assetsDir, "booray-icon-master.svg"), join(storeDir, "booray-icon-master.svg"));
  await copyFile(join(assetsDir, "booray-icon-app.svg"), join(storeDir, "booray-icon-app.svg"));
  await copyFile(join(assetsDir, "booray-icon-maskable.svg"), join(storeDir, "booray-icon-maskable.svg"));
  console.log("  booray-icon-master.svg (source)");
  console.log("  booray-icon-app.svg (source)");
  console.log("  booray-icon-maskable.svg (source)");

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
