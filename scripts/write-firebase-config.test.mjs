import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = join(root, "docs", "firebase-config.js");
const backup = readFileSync(configPath, "utf8");

try {
  const result = spawnSync(
    process.execPath,
    ["scripts/write-firebase-config.js"],
    {
      cwd: root,
      env: {
        ...process.env,
        FIREBASE_API_KEY: "test-api-key",
        FIREBASE_PROJECT_ID: "test-project",
        FIREBASE_APP_ID: "1:123:web:abc",
        FIREBASE_AUTH_DOMAIN: "example.test",
      },
    },
  );
  assert.equal(result.status, 0, result.stderr?.toString() || "write failed");

  const generated = readFileSync(configPath, "utf8");
  for (const name of [
    "FIREBASE_SDK_VERSION",
    "AUTH_EMULATOR_URL",
    "FIRESTORE_EMULATOR",
    "FUNCTIONS_EMULATOR",
    "SERVER_HAND_AUTHORITY",
  ]) {
    assert.match(generated, new RegExp(`export const ${name}`), `missing ${name}`);
  }
} finally {
  writeFileSync(configPath, backup);
}

console.log("write-firebase-config.test.mjs: ok");
