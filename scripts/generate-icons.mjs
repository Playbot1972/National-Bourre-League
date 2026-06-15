#!/usr/bin/env node
/**
 * Rasterize Booray logo into PWA / store / favicon PNG sets.
 * Master: assets/icons/booray-logo-source.png (1024, optional) or booray-icon-master.svg
 * Run: npm run icons:generate
 */
import { access, mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "assets", "icons");
const storeDir = join(assetsDir, "store");

const MASTER_SVG = join(assetsDir, "booray-icon-master.svg");
const MASTER_PNG = join(assetsDir, "booray-logo-source.png");
const FLATTEN_BG = { r: 0, g: 0, b: 0 };

const OUTPUTS = [
  { dir: join(root, "public", "icons"), label: "Vite app (public/icons)" },
  { dir: join(root, "docs", "icons"), label: "Social app (docs/icons)" },
];

const STANDARD_SIZES = [
  { name: "favicon-16.png", size: 16 },
  { name: "favicon-32.png", size: 32 },
  { name: "favicon-48.png", size: 48 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-1024.png", size: 1024 },
  { name: "play-store-icon.png", size: 512 },
  { name: "booray-brand-full-1024.png", size: 1024 },
  { name: "booray-brand-full-2048.png", size: 2048 },
];

const STORE_COPIES = [
  { from: "icon-1024.png", to: "app-store-icon-1024.png" },
  { from: "play-store-icon.png", to: "play-store-icon-512.png" },
  { from: "android-adaptive-background.png", to: "android-adaptive-background-432.png" },
  { from: "android-adaptive-foreground.png", to: "android-adaptive-foreground-432.png" },
  { from: "icon-512-maskable.png", to: "icon-512-maskable.png" },
];

async function resolveMasterBuffer() {
  try {
    await access(MASTER_PNG);
    console.log("Using pixel source: assets/icons/booray-logo-source.png");
    return sharp(await readFile(MASTER_PNG)).ensureAlpha().png().toBuffer();
  } catch {
    console.log("Using vector source: assets/icons/booray-icon-master.svg");
    const density = 288;
    return sharp(await readFile(MASTER_SVG), { density })
      .resize(1024, 1024, { fit: "contain", background: { ...FLATTEN_BG, alpha: 1 } })
      .flatten({ background: FLATTEN_BG })
      .png()
      .toBuffer();
  }
}

async function rasterizeMaster(masterBuf, size, outPath, { opaque = true } = {}) {
  let pipeline = sharp(masterBuf).resize(size, size, {
    fit: "contain",
    background: opaque ? { ...FLATTEN_BG, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 },
  });

  if (opaque) {
    pipeline = pipeline.flatten({ background: FLATTEN_BG });
  } else {
    pipeline = pipeline.ensureAlpha();
  }

  await pipeline
    .png({ compressionLevel: 9, adaptiveFiltering: true, force: true })
    .toFile(outPath);
}

/** PWA maskable: full logo scaled to ~84% on black (Android safe zone). */
async function writeMaskable(masterBuf, size, outPath) {
  const inner = Math.round(size * 0.84);
  const offset = Math.round((size - inner) / 2);
  const logo = await sharp(masterBuf).resize(inner, inner, { fit: "contain" }).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 3, background: FLATTEN_BG },
  })
    .composite([{ input: logo, left: offset, top: offset }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
}

/** Android adaptive background: solid brand black. */
async function writeAdaptiveBackground(size, outPath) {
  await sharp({
    create: { width: size, height: size, channels: 3, background: FLATTEN_BG },
  })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

/** Android adaptive foreground: logo scaled to ~66% on transparent canvas. */
async function writeAdaptiveForeground(masterBuf, size, outPath) {
  const inner = Math.round(size * 0.66);
  const offset = Math.round((size - inner) / 2);
  const logo = await sharp(masterBuf).resize(inner, inner, { fit: "contain" }).ensureAlpha().png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: logo, left: offset, top: offset }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
}

async function writeFaviconIco(png16Path, png32Path, icoPath) {
  const pngToIco = (await import("png-to-ico")).default;
  const ico = await pngToIco([png16Path, png32Path]);
  await writeFile(icoPath, ico);
}

async function main() {
  await mkdir(storeDir, { recursive: true });
  const masterBuf = await resolveMasterBuffer();

  for (const { dir, label } of OUTPUTS) {
    await mkdir(dir, { recursive: true });
    console.log(`Generating ${label}…`);

    for (const { name, size } of STANDARD_SIZES) {
      const dest = join(dir, name);
      await rasterizeMaster(masterBuf, size, dest, { opaque: true });
      console.log(`  ${name} (${size}px)`);
    }

    await writeMaskable(masterBuf, 512, join(dir, "icon-512-maskable.png"));
    console.log("  icon-512-maskable.png (512px, maskable safe zone)");

    await writeAdaptiveBackground(432, join(dir, "android-adaptive-background.png"));
    console.log("  android-adaptive-background.png (432px)");

    await writeAdaptiveForeground(masterBuf, 432, join(dir, "android-adaptive-foreground.png"));
    console.log("  android-adaptive-foreground.png (432px, RGBA)");

    const fav16 = join(dir, "favicon-16.png");
    const fav32 = join(dir, "favicon-32.png");
    try {
      await writeFaviconIco(fav16, fav32, join(dir, "..", "favicon.ico"));
      console.log("  favicon.ico (16+32 multi-size)");
    } catch {
      await copyFile(fav32, join(dir, "..", "favicon.ico"));
      console.log("  favicon.ico (32px fallback)");
    }

    const faviconSvgDest = dir.includes("public")
      ? join(root, "public", "favicon.svg")
      : join(root, "docs", "favicon.svg");
    await copyFile(MASTER_SVG, faviconSvgDest);
    console.log("  favicon.svg (master vector)");
  }

  console.log("Generating assets/icons/store/…");
  const primaryDir = OUTPUTS[0].dir;
  for (const { from, to } of STORE_COPIES) {
    await copyFile(join(primaryDir, from), join(storeDir, to));
    console.log(`  ${to}`);
  }
  await copyFile(MASTER_SVG, join(storeDir, "booray-icon-master.svg"));
  console.log("  booray-icon-master.svg (source)");
  try {
    await access(MASTER_PNG);
    await copyFile(MASTER_PNG, join(storeDir, "booray-logo-source.png"));
    console.log("  booray-logo-source.png (source)");
  } catch {
    /* optional */
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
