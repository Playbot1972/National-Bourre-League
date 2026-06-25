// Ensure docs/firebase-config.js has real Firebase web config before production deploy.
// Loads optional .env.firebase (gitignored), then writes via write-firebase-config.js.

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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

function hasPlaceholderConfig() {
  if (!existsSync(configPath)) return true;
  const src = readFileSync(configPath, "utf8");
  return (
    src.includes("REPLACE_WITH_YOUR_API_KEY") ||
    src.includes("REPLACE_WITH_YOUR_APP_ID") ||
    src.includes("demo-national-bourre-league")
  );
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
} else if (hasPlaceholderConfig()) {
  console.error("docs/firebase-config.js still has placeholder Firebase config.");
  console.error("");
  console.error("Option A — service account deploy (no firebase login):");
  console.error("  cp .env.firebase.example .env.firebase   # fill in web app keys");
  console.error("  npm run setup:service-account -- national-bourre-league");
  console.error("  npm run deploy:hosting:sa:patch");
  console.error("");
  console.error("Option B — fetch from Firebase CLI:");
  console.error("  npx firebase login");
  console.error("  npm run setup:webapp -- national-bourre-league booray.win");
  console.error("");
  console.error("Option C — copy .env.firebase.example → .env.firebase, fill in values, then:");
  console.error("  npm run deploy");
  console.error("");
  console.error("Option D — export env vars, then deploy:");
  console.error("  export FIREBASE_API_KEY=... FIREBASE_PROJECT_ID=national-bourre-league \\");
  console.error("         FIREBASE_APP_ID=... FIREBASE_AUTH_DOMAIN=booray.win");
  console.error("  npm run deploy");
  process.exit(1);
}

if (hasPlaceholderConfig()) {
  console.error("Firebase config is still placeholder after write — check your values.");
  process.exit(1);
}

console.log("Firebase config OK for production deploy.");
