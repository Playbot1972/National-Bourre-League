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

const OUTPUTS = [
  { dir: join(root, "public", "icons"), label: "Vite app (public/icons)" },
  { dir: join(root, "docs", "icons"), label: "Social app (docs/icons)" },
];

/** @type {Array<{ name: string, source: string, size: number }>} */
const RASTER_SPECS = [
  { name: "favicon-16.png", source: "booray-icon-app.svg", size: 16 },
  { name: "favicon-32.png", source: "booray-icon-app.svg", size: 32 },
  { name: "favicon-48.png", source: "booray-icon-app.svg", size: 48 },
  { name: "apple-touch-icon.png", source: "booray-icon-app.svg", size: 180 },
  { name: "icon-192.png", source: "booray-icon-app.svg", size: 192 },
  { name: "icon-512.png", source: "booray-icon-app.svg", size: 512 },
  { name: "icon-512-maskable.png", source: "booray-icon-maskable.svg", size: 512 },
  { name: "icon-1024.png", source: "booray-icon-app.svg", size: 1024 },
  { name: "play-store-icon.png", source: "booray-icon-app.svg", size: 512 },
  { name: "booray-brand-full-1024.png", source: "booray-brand-full.svg", size: 1024 },
  { name: "booray-brand-full-2048.png", source: "booray-brand-full.svg", size: 2048 },
];

async function rasterize(svgPath, size, outPath) {
  const svg = await readFile(svgPath);
  await sharp(svg, { density: Math.max(144, Math.ceil((size / 512) * 144)) })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
}

async function writeFaviconIco(png32Path, icoPath) {
  const png16 = png32Path.replace("favicon-32.png", "favicon-16.png");
  try {
    const buf = await sharp(png16).toFormat("png").toBuffer();
    const buf32 = await sharp(png32Path).toFormat("png").toBuffer();
    // Minimal dual-size ICO: browsers accept PNG-in-ICO via sharp composite fallback — write 32px PNG renamed as ico for broad support
    await writeFile(icoPath, buf32);
  } catch {
    await copyFile(png32Path, icoPath);
  }
}

async function main() {
  for (const { dir, label } of OUTPUTS) {
    await mkdir(dir, { recursive: true });
    console.log(`Generating ${label}…`);
    for (const spec of RASTER_SPECS) {
      const src = join(assetsDir, spec.source);
      const dest = join(dir, spec.name);
      await rasterize(src, spec.size, dest);
      console.log(`  ${spec.name} (${spec.size}px)`);
    }
    const fav32 = join(dir, "favicon-32.png");
    await writeFaviconIco(fav32, join(dir, "..", "favicon.ico"));
    if (dir.includes("public")) {
      await copyFile(join(assetsDir, "booray-icon-app.svg"), join(root, "public", "favicon.svg"));
    } else {
      await copyFile(join(assetsDir, "booray-icon-app.svg"), join(root, "docs", "favicon.svg"));
    }
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
