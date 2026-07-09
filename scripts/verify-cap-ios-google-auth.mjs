#!/usr/bin/env node
/**
 * Repo-side readiness for Capacitor iOS native Google sign-in.
 * Does not require GoogleService-Info.plist (manual Firebase/Xcode step).
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

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

// package + plugin
if (!read("package.json").includes("@capacitor-firebase/authentication")) {
  errors.push("package.json: missing @capacitor-firebase/authentication");
} else {
  ok.push("package.json: @capacitor-firebase/authentication installed");
}

// capacitor config
requireIncludes(
  "capacitor.config.ts",
  "providers: ['google.com']",
  "FirebaseAuthentication google.com provider configured",
);
requireIncludes("capacitor.config.ts", "authDomain: 'booray.win'", "authDomain booray.win");
requireIncludes(
  "capacitor.config.ts",
  "webContentsDebuggingEnabled",
  "ios.webContentsDebuggingEnabled for Safari Web Inspector",
);

// iOS SPM (no Podfile — project uses Swift Package Manager)
const pkgSwift = read("ios/App/CapApp-SPM/Package.swift");
if (!pkgSwift.includes("CapacitorFirebaseAuthentication")) {
  errors.push("ios/App/CapApp-SPM/Package.swift: missing CapacitorFirebaseAuthentication");
} else {
  ok.push("ios/App/CapApp-SPM/Package.swift: Firebase auth plugin linked");
}

const capAppSpmSwift = "ios/App/CapApp-SPM/Sources/CapApp-SPM/CapApp-SPM.swift";
if (!existsSync(join(root, capAppSpmSwift))) {
  errors.push(`missing ${capAppSpmSwift} — SPM plugin force-link`);
} else if (!read(capAppSpmSwift).includes("FirebaseAuthenticationPlugin")) {
  errors.push(`${capAppSpmSwift}: missing FirebaseAuthenticationPlugin force-link`);
} else {
  ok.push(`${capAppSpmSwift}: Firebase plugin SPM force-link present`);
}

// native Google bundle
for (const file of ["docs/auth-google-native.js", "src/native/auth-google-native.ts"]) {
  if (!existsSync(join(root, file))) {
    errors.push(`missing ${file} — run npm run build:auth-native`);
  } else {
    ok.push(`${file} present`);
  }
}

// auth.js: native path uses plugin bridge, not popup/redirect
requireIncludes("docs/auth.js", "signInWithGoogleNative", "native Google wrapper");
requireRegex(
  "docs/auth.js",
  /if\s*\(\s*isCapacitorNative\(\)\s*\)\s*\{\s*return\s+signInWithGoogleNative\(\)/,
  "signInWithGoogle returns native wrapper on Capacitor",
);
requireRegex(
  "docs/auth.js",
  /completeGoogleRedirectSignIn[\s\S]*?if\s*\(\s*usingEmulator\s*\|\|\s*isCapacitorNative\(\)\s*\)\s*return\s+null/,
  "completeGoogleRedirectSignIn skipped on native",
);

// Ensure signInWithRedirect is guarded (only after native branch in signInWithGoogle)
const signInWithGoogleFn = read("docs/auth.js").match(
  /export async function signInWithGoogle\(\)\s*\{[\s\S]*?\n\}/,
);
if (!signInWithGoogleFn) {
  errors.push("docs/auth.js: could not parse signInWithGoogle");
} else {
  const body = signInWithGoogleFn[0];
  const nativeIdx = body.indexOf("isCapacitorNative()");
  const redirectIdx = body.indexOf("signInWithRedirect");
  if (nativeIdx === -1 || redirectIdx === -1 || nativeIdx > redirectIdx) {
    errors.push("docs/auth.js: signInWithRedirect must follow isCapacitorNative() guard");
  } else {
    ok.push("docs/auth.js: signInWithRedirect only on web path");
  }
}

// Built bridge calls plugin API (not web popup)
if (existsSync(join(root, "docs/auth-google-native.js"))) {
  const nativeJs = read("docs/auth-google-native.js");
  const nativeBytes = readFileSync(join(root, "docs/auth-google-native.js")).length;
  if (!nativeJs.includes("signInWithGoogle")) {
    errors.push("docs/auth-google-native.js: missing signInWithGoogle call");
  } else if (
    nativeJs.includes("signInWithPopupOrRedirect") ||
    nativeJs.includes("signInWithPopup") ||
    nativeJs.includes("signInWithRedirect")
  ) {
    errors.push(
      "docs/auth-google-native.js: bundles web popup/redirect fallback — rebuild with window.Capacitor.registerPlugin only",
    );
  } else if (!nativeJs.includes("plugin-call-start")) {
    errors.push("docs/auth-google-native.js: missing native plugin diagnostics — run npm run build:auth-native");
  } else if (!nativeJs.includes("registerPlugin") && !nativeJs.includes("Plugins")) {
    errors.push(
      "docs/auth-google-native.js: must use window.Capacitor.Plugins or registerPlugin (no @capacitor-firebase bundle)",
    );
  } else if (nativeBytes > 50_000) {
    errors.push(
      `docs/auth-google-native.js: bundle too large (${nativeBytes} bytes) — likely still bundles web SDK; rebuild auth-native`,
    );
  } else {
    ok.push("docs/auth-google-native.js: native Capacitor bridge only (no web popup/redirect)");
  }
}

// Stage logs for device QA
for (const [file, marker, message] of [
  ["docs/app.js", "google-button-tapped", "google tap log"],
  ["docs/auth.js", "native-branch-selected", "native branch log"],
  ["docs/auth.js", "firebase-credential-start", "firebase credential log"],
  ["docs/capacitor-native-bridge.js", "bridge-loading", "boot bridge-loading log"],
  ["docs/capacitor-native-bridge.js", "plugin-check", "boot plugin-check log"],
]) {
  requireIncludes(file, marker, message);
}

// Example plist template (not the real secret file)
if (!existsSync(join(root, "ios/App/App/GoogleService-Info.plist.example"))) {
  errors.push("missing ios/App/App/GoogleService-Info.plist.example");
} else {
  ok.push("GoogleService-Info.plist.example present");
}

if (existsSync(join(root, "ios/App/App/GoogleService-Info.plist"))) {
  warnings.push(
    "ios/App/App/GoogleService-Info.plist exists locally — do not commit real keys; verify Xcode target membership",
  );
} else {
  warnings.push(
    "ios/App/App/GoogleService-Info.plist not in repo (expected) — add manually in Xcode after Firebase download",
  );
}

const infoPlist = read("ios/App/App/Info.plist");
if (!infoPlist.includes("CFBundleURLTypes")) {
  warnings.push(
    "Info.plist: CFBundleURLTypes not set — add REVERSED_CLIENT_ID URL scheme in Xcode after downloading plist",
  );
} else {
  ok.push("Info.plist: CFBundleURLTypes present");
}

const docPath = "docs/NATIVE_IOS_GOOGLE_AUTH.md";
if (!existsSync(join(root, docPath))) {
  errors.push(`missing ${docPath}`);
} else {
  ok.push(`${docPath} checklist present`);
}

const report = { ok, warnings, errors, ready: errors.length === 0 };
console.log(JSON.stringify(report, null, 2));

if (errors.length) {
  console.error(`\nverify-cap-ios-google-auth: ${errors.length} error(s)`);
  process.exit(1);
}

console.log("\nverify-cap-ios-google-auth: repo ready (manual Firebase/Xcode steps may remain)");
if (warnings.length) {
  console.log("Manual follow-ups:");
  for (const w of warnings) console.log(`  • ${w}`);
}
