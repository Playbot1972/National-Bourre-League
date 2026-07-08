#!/usr/bin/env node
/**
 * Rasterize Booray icons into assets/capacitor/ for @capacitor/assets.
 * Run: node scripts/prepare-capacitor-assets.mjs (or npm run cap:assets)
 */
import { access, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "assets", "capacitor");
const masterSvg = join(root, "assets", "icons", "booray-icon-master.svg");
const icon1024 = join(root, "docs", "icons", "icon-1024.png");

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function loadIconBuffer() {
  if (await fileExists(icon1024)) {
    return readFile(icon1024);
  }
  return sharp(await readFile(masterSvg))
    .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const iconBuffer = await loadIconBuffer();
  await sharp(iconBuffer).png().toFile(join(outDir, "icon.png"));

  const splashSize = 2732;
  const logoSize = 1024;
  const splash = await sharp({
    create: {
      width: splashSize,
      height: splashSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(iconBuffer).resize(logoSize, logoSize, { fit: "contain" }).png().toBuffer(),
        gravity: "center",
      },
    ])
    .png()
    .toBuffer();

  await sharp(splash).toFile(join(outDir, "splash.png"));
  console.log(`Capacitor asset sources written to ${outDir}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
