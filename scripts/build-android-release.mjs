#!/usr/bin/env node
/**
 * Build a signed Android App Bundle after Capacitor web sync.
 * Requires android/keystore.properties (copy from keystore.properties.example).
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { assertProductionFirebaseConfig } from "./lib/firebase-config-check.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const androidRoot = join(root, "android");
const keystorePropsPath = join(androidRoot, "keystore.properties");
const aabPath = join(androidRoot, "app", "build", "outputs", "bundle", "release", "app-release.aab");

function fail(message) {
  console.error(`\nbuild-android-release: ${message}`);
  process.exit(1);
}

if (!existsSync(keystorePropsPath)) {
  fail(
    [
      "Missing android/keystore.properties",
      "  cp android/keystore.properties.example android/keystore.properties",
      "  Edit paths/passwords and place your release keystore outside git.",
      "See docs/NATIVE_ANDROID_RELEASE.md",
    ].join("\n"),
  );
}

const props = Object.fromEntries(
  readFileSync(keystorePropsPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx), line.slice(idx + 1)];
    }),
);

for (const key of ["storeFile", "storePassword", "keyAlias", "keyPassword"]) {
  if (!props[key] || props[key].includes("REPLACE_")) {
    fail(`android/keystore.properties is missing a real value for ${key}`);
  }
}

const storePath = resolve(androidRoot, props.storeFile);
if (!existsSync(storePath)) {
  fail(`Keystore not found at ${storePath} (storeFile=${props.storeFile})`);
}

const socialIndex = join(root, "dist", "social", "index.html");
if (!existsSync(socialIndex)) {
  fail("dist/social/index.html missing — run npm run build:cap:release first");
}

const bundledFirebaseConfig = join(root, "dist", "social", "firebase-config.js");
if (!existsSync(bundledFirebaseConfig)) {
  fail("dist/social/firebase-config.js missing — run npm run build:cap:release first");
}
try {
  assertProductionFirebaseConfig(readFileSync(bundledFirebaseConfig, "utf8"), {
    label: "dist/social/firebase-config.js",
  });
} catch (err) {
  fail(
    [
      err.message,
      "",
      "Native release builds bundle dist/social — production Firebase web keys are required.",
      "  cp .env.firebase.example .env.firebase",
      "  node scripts/ensure-firebase-config.js",
      "  npm run build:cap:android:release",
    ].join("\n"),
  );
}

const ensureFirebase = spawnSync(process.execPath, ["scripts/ensure-firebase-config.js"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
if (ensureFirebase.status !== 0) {
  fail("Production Firebase web configuration check failed (see above)");
}

const gradlew = join(androidRoot, process.platform === "win32" ? "gradlew.bat" : "gradlew");
if (!existsSync(gradlew)) {
  fail("android/gradlew missing — Capacitor android platform not initialized?");
}

console.log("Building signed release AAB via Gradle bundleRelease…");
const result = spawnSync(gradlew, ["bundleRelease"], {
  cwd: androidRoot,
  stdio: "inherit",
  env: { ...process.env },
});

if (result.status !== 0) {
  fail("Gradle bundleRelease failed");
}

if (!existsSync(aabPath)) {
  fail(`Expected AAB at ${aabPath} but file was not created`);
}

console.log(`\nSigned release AAB ready:\n  ${aabPath}`);
