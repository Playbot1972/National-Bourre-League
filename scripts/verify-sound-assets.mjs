#!/usr/bin/env node
/**
 * Verify docs/sounds/ matches MANIFEST.json and soundPacks registry.
 * Optionally checks dist/social/sounds/ after build:hosting.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SOUNDS_DIR = join(ROOT, "docs", "sounds");
const MANIFEST_PATH = join(SOUNDS_DIR, "MANIFEST.json");
const DIST_SOUNDS = join(ROOT, "dist", "social", "sounds");

function fail(msg) {
  console.error(`FAIL  ${msg}`);
  process.exitCode = 1;
}

function pass(msg) {
  console.log(`PASS  ${msg}`);
}

if (!existsSync(MANIFEST_PATH)) {
  fail("docs/sounds/MANIFEST.json missing");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const expectedFiles = manifest.assets.map((a) => a.file);
const onDisk = readdirSync(SOUNDS_DIR).filter((f) => f.endsWith(".wav")).sort();
const expectedSorted = [...expectedFiles].sort();

if (onDisk.length !== 15) {
  fail(`expected 15 WAV files in docs/sounds/, found ${onDisk.length}`);
} else {
  pass(`docs/sounds/ contains 15 WAV files`);
}

for (const file of expectedSorted) {
  if (!onDisk.includes(file)) {
    fail(`missing file: ${file}`);
  }
}
if (process.exitCode !== 1) {
  pass("all MANIFEST.json filenames present on disk");
}

for (const asset of manifest.assets) {
  const dupes = manifest.assets.filter((a) => a.file === asset.file);
  if (dupes.length > 1) fail(`duplicate manifest entry: ${asset.file}`);
  if (!asset.id || !asset.file) fail(`invalid manifest row: ${JSON.stringify(asset)}`);
}
if (process.exitCode !== 1) {
  pass("MANIFEST.json entries are well-formed");
}

// Registry cross-check (import-free: parse SOUND_ASSET_FILES from source)
const packsSrc = readFileSync(join(ROOT, "src", "table", "feedback", "soundPacks.ts"), "utf8");
const fileRe = /"([^"]+)":\s*"([^"]+\.wav)"/g;
const registryFiles = new Set();
let m;
while ((m = fileRe.exec(packsSrc)) !== null) {
  if (m[2].endsWith(".wav")) registryFiles.add(m[2]);
}
for (const file of expectedSorted) {
  if (!registryFiles.has(file)) {
    fail(`soundPacks.ts missing registry entry for ${file}`);
  }
}
if (process.exitCode !== 1) {
  pass("soundPacks.ts registry matches MANIFEST filenames");
}

if (process.argv.includes("--dist")) {
  if (!existsSync(DIST_SOUNDS)) {
    fail("dist/social/sounds/ missing — run npm run build:hosting first");
  } else {
    const built = readdirSync(DIST_SOUNDS).filter((f) => f.endsWith(".wav")).sort();
    if (built.length !== 15) {
      fail(`dist/social/sounds/ has ${built.length} WAV files, expected 15`);
    } else {
      pass("dist/social/sounds/ contains 15 WAV files for hosting");
    }
    for (const file of expectedSorted) {
      if (!built.includes(file)) fail(`dist missing: ${file}`);
    }
    if (process.exitCode !== 1) {
      pass("hosting output paths match manifest");
    }
  }
}

if (process.exitCode) {
  console.error("\nSound asset verification failed.");
  process.exit(1);
}
console.log("\nSound asset verification passed.");
