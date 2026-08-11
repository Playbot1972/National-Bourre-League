#!/usr/bin/env node
/**
 * Write public/.well-known/assetlinks.json for Android App Links verification.
 * Requires ANDROID_APP_LINKS_SHA256 (colon-separated SHA-256 from Play App Signing).
 *
 * Usage:
 *   export ANDROID_APP_LINKS_SHA256=AA:BB:CC:...
 *   node scripts/write-assetlinks-json.js
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const examplePath = join(root, "public", ".well-known", "assetlinks.json.example");
const outDir = join(root, "public", ".well-known");
const outPath = join(outDir, "assetlinks.json");

const sha256 = process.env.ANDROID_APP_LINKS_SHA256?.trim();
if (!sha256) {
  console.error("Missing ANDROID_APP_LINKS_SHA256 (Play App Signing certificate SHA-256).");
  console.error("Get it from Play Console → Setup → App signing after the first AAB upload.");
  console.error("Then run:");
  console.error("  export ANDROID_APP_LINKS_SHA256=AA:BB:CC:...");
  console.error("  node scripts/write-assetlinks-json.js");
  process.exit(1);
}

if (sha256.includes("REPLACE_WITH") || !/^[0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){31}$/.test(sha256)) {
  console.error("ANDROID_APP_LINKS_SHA256 must be a colon-separated SHA-256 fingerprint.");
  process.exit(1);
}

if (!existsSync(examplePath)) {
  console.error(`Missing template: ${examplePath}`);
  process.exit(1);
}

const template = JSON.parse(readFileSync(examplePath, "utf8"));
template[0].target.package_name = "win.booray.app";
template[0].target.sha256_cert_fingerprints = [sha256.toUpperCase()];

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, `${JSON.stringify(template, null, 2)}\n`);
console.log(`Wrote ${outPath} for package win.booray.app`);
