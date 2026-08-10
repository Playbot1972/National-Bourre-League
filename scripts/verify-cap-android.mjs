#!/usr/bin/env node
/**
 * Repo-side readiness for Capacitor Android native builds.
 * Does not require google-services.json or keystore.properties (warns if absent).
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { nativeVersionsFromPackage } from "./lib/native-version.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const requireBundle = process.argv.includes("--require-bundle");

const errors = [];
const warnings = [];
const ok = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function requireIncludes(file, needle, message) {
  const text = read(file);
  if (!text.includes(needle)) errors.push(`${file}: ${message}`);
  else ok.push(`${file}: ${message}`);
}

function requireRegex(file, re, message) {
  const text = read(file);
  if (!re.test(text)) errors.push(`${file}: ${message}`);
  else ok.push(`${file}: ${message}`);
}

const appId = "win.booray.app";

requireIncludes("capacitor.config.ts", `appId: '${appId}'`, `capacitor appId ${appId}`);
requireIncludes("android/app/build.gradle", `applicationId "${appId}"`, "Android applicationId matches");
requireIncludes("android/app/src/main/res/values/strings.xml", appId, "strings.xml package_name");

if (!read("package.json").includes("@capacitor-firebase/authentication")) {
  errors.push("package.json: missing @capacitor-firebase/authentication");
} else {
  ok.push("package.json: @capacitor-firebase/authentication installed");
}

requireIncludes(
  "capacitor.config.ts",
  "providers: ['google.com']",
  "FirebaseAuthentication google.com provider configured",
);
requireIncludes("capacitor.config.ts", "webDir: 'dist/social'", "webDir dist/social");

const settings = read("android/capacitor.settings.gradle");
for (const marker of [
  ":capacitor-android",
  ":capacitor-firebase-authentication",
  ":capacitor-haptics",
  ":capacitor-splash-screen",
]) {
  if (!settings.includes(marker)) {
    errors.push(`android/capacitor.settings.gradle: missing ${marker}`);
  } else {
    ok.push(`android/capacitor.settings.gradle: ${marker} linked`);
  }
}

requireIncludes(
  "android/app/src/main/java/win/booray/app/MainActivity.java",
  "BridgeActivity",
  "MainActivity extends BridgeActivity",
);

const pkg = JSON.parse(read("package.json"));
const expectedNative = nativeVersionsFromPackage(pkg.version);
requireRegex(
  "android/app/build.gradle",
  new RegExp(`versionCode ${expectedNative.versionCode}`),
  `versionCode matches package.json (${expectedNative.versionCode})`,
);
requireRegex(
  "android/app/build.gradle",
  new RegExp(`versionName "${expectedNative.versionName.replace(/\./g, "\\.")}"`),
  `versionName matches package.json (${expectedNative.versionName})`,
);

requireRegex(
  "android/app/build.gradle",
  /signingConfigs\s*\{[\s\S]*release/,
  "release signingConfigs block present",
);

for (const file of ["docs/auth-google-native.js", "docs/capacitor-native-bridge.js"]) {
  if (!existsSync(join(root, file))) {
    errors.push(`missing ${file} — run npm run build:cap:web`);
  } else {
    ok.push(`${file} present`);
  }
}

const socialIndex = join(root, "dist", "social", "index.html");
if (!existsSync(socialIndex)) {
  if (requireBundle) {
    errors.push("dist/social/index.html missing — run npm run build:cap:release");
  } else {
    warnings.push("dist/social not built — run npm run build:cap:web before device testing");
  }
} else {
  ok.push("dist/social/index.html present");
}

if (!existsSync(join(root, "android/app/google-services.json.example"))) {
  errors.push("missing android/app/google-services.json.example");
} else {
  ok.push("google-services.json.example present");
}

if (existsSync(join(root, "android/app/google-services.json"))) {
  warnings.push(
    "android/app/google-services.json exists locally — do not commit; verify Play SHA fingerprints in Firebase",
  );
} else {
  warnings.push(
    "android/app/google-services.json not in repo (expected) — copy from Firebase Console before release builds",
  );
}

if (!existsSync(join(root, "android/keystore.properties"))) {
  warnings.push(
    "android/keystore.properties not present — required for npm run build:cap:android:release",
  );
} else {
  warnings.push("android/keystore.properties exists locally — must stay gitignored");
}

if (!existsSync(join(root, "android/keystore.properties.example"))) {
  errors.push("missing android/keystore.properties.example");
} else {
  ok.push("keystore.properties.example present");
}

const docPath = "docs/NATIVE_ANDROID_RELEASE.md";
if (!existsSync(join(root, docPath))) {
  errors.push(`missing ${docPath}`);
} else {
  ok.push(`${docPath} checklist present`);
}

const report = { ok, warnings, errors, ready: errors.length === 0 };
console.log(JSON.stringify(report, null, 2));

if (errors.length) {
  console.error(`\nverify-cap-android: ${errors.length} error(s)`);
  process.exit(1);
}

console.log("\nverify-cap-android: repo ready (manual Firebase/keystore steps may remain)");
if (warnings.length) {
  console.log("Manual follow-ups:");
  for (const w of warnings) console.log(`  • ${w}`);
}
