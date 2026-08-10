// Ensure docs/firebase-config.js has real Firebase web config before production deploy.
// Loads optional .env.firebase (gitignored), then writes via write-firebase-config.js.

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  analyzeFirebaseConfig,
  assertProductionFirebaseConfig,
} from "./lib/firebase-config-check.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = join(root, "docs", "firebase-config.js");
const envFile = join(root, ".env.firebase");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function readConfig() {
  if (!existsSync(configPath)) return "";
  return readFileSync(configPath, "utf8");
}

loadEnvFile(envFile);

const hasEnv =
  process.env.FIREBASE_API_KEY &&
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_APP_ID;

if (hasEnv) {
  const result = spawnSync(process.execPath, ["scripts/write-firebase-config.js"], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
} else if (!analyzeFirebaseConfig(readConfig()).isProductionReady) {
  console.error("docs/firebase-config.js still has placeholder Firebase config.");
  console.error("");
  console.error("Option A — local config file (recommended for native release builds):");
  console.error("  cp .env.firebase.example .env.firebase   # fill in web app keys");
  console.error("  node scripts/ensure-firebase-config.js");
  console.error("");
  console.error("Option B — fetch from Firebase CLI:");
  console.error("  npx firebase login");
  console.error("  npm run setup:webapp -- national-bourre-league booray.win");
  console.error("");
  console.error("Option C — export env vars, then run this script:");
  console.error("  export FIREBASE_API_KEY=... FIREBASE_PROJECT_ID=national-bourre-league \\");
  console.error("         FIREBASE_APP_ID=... FIREBASE_AUTH_DOMAIN=booray.win");
  console.error("  node scripts/ensure-firebase-config.js");
  console.error("");
  console.error("Required env vars: FIREBASE_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_APP_ID");
  console.error("Optional: FIREBASE_AUTH_DOMAIN (defaults to booray.win / {projectId}.firebaseapp.com)");
  process.exit(1);
}

try {
  assertProductionFirebaseConfig(readConfig());
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

console.log("Firebase config OK for production deploy.");
