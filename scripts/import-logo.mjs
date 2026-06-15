#!/usr/bin/env node
/**
 * Import official BOORAY logo PNG and regenerate all platform icons.
 *
 * Usage:
 *   npm run icons:import -- ./path/to/booray-logo.png
 *   npm run icons:import -- assets/icons/booray-logo-source.png
 */
import { access, copyFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dest = join(root, "assets", "icons", "booray-logo-source.png");

const inputArg = process.argv[2];
if (!inputArg) {
  console.error("Usage: npm run icons:import -- <path-to-logo.png>");
  console.error("Example: npm run icons:import -- ./Booray-logo.png");
  process.exit(1);
}

const input = resolve(process.cwd(), inputArg);

async function main() {
  await access(input);
  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) {
    throw new Error("Could not read image dimensions.");
  }

  console.log(`Importing ${input} (${meta.width}x${meta.height})…`);

  await sharp(input)
    .resize(1024, 1024, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .flatten({ background: { r: 0, g: 0, b: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(dest);

  console.log(`Saved ${dest}`);

  const gen = spawnSync(process.execPath, ["scripts/generate-icons.mjs"], {
    cwd: root,
    stdio: "inherit",
  });
  if (gen.status !== 0) process.exit(gen.status ?? 1);

  await copyFile(dest, join(root, "assets", "icons", "store", "booray-logo-source.png"));
  console.log("Copied to assets/icons/store/booray-logo-source.png");
  console.log("Done.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
