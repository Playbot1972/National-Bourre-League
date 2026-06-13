// Reads Firebase CLI sdkconfig output (JSON) and writes docs/firebase-config.js.
// Usage: node scripts/apply-sdkconfig.js <sdkconfig-file> <project-id> [auth-domain]

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const [sdkPath, projectId, authDomainArg] = process.argv.slice(2);
if (!sdkPath || !projectId) {
  console.error("Usage: node scripts/apply-sdkconfig.js <sdkconfig-file> <project-id> [auth-domain]");
  process.exit(1);
}

const authDomain = authDomainArg || `${projectId}.firebaseapp.com`;
const raw = readFileSync(sdkPath, "utf8");

// Firebase CLI may mix log lines with JSON — extract the JSON object.
const start = raw.indexOf("{");
const end = raw.lastIndexOf("}");
if (start === -1 || end === -1) {
  console.error("Could not find JSON in sdkconfig file:", sdkPath);
  console.error(raw.slice(0, 500));
  process.exit(1);
}

let cfg;
try {
  cfg = JSON.parse(raw.slice(start, end + 1));
} catch (err) {
  console.error("Invalid JSON in sdkconfig file:", err.message);
  process.exit(1);
}

const apiKey = cfg.apiKey ?? cfg.sdkConfig?.apiKey;
const appId = cfg.appId ?? cfg.app_id ?? cfg.sdkConfig?.appId;

if (!apiKey || !appId) {
  console.error("sdkconfig missing apiKey or appId. Keys found:", Object.keys(cfg));
  process.exit(1);
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const writeScript = join(root, "scripts", "write-firebase-config.js");

const result = spawnSync(
  process.execPath,
  [writeScript],
  {
    env: {
      ...process.env,
      FIREBASE_API_KEY: apiKey,
      FIREBASE_APP_ID: appId,
      FIREBASE_PROJECT_ID: projectId,
      FIREBASE_AUTH_DOMAIN: authDomain,
    },
    stdio: "inherit",
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`apiKey: ${apiKey}`);
console.log(`appId:  ${appId}`);
