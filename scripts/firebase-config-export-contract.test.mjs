/**
 * CI generator output must export every named import used by shipped docs modules.
 */
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  discoverFirebaseConfigImports,
  parseFirebaseConfigNamedExports,
  validateFirebaseConfigExportContract,
} from "./lib/firebase-config-export-contract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = join(root, "docs", "firebase-config.js");
const docsDir = join(root, "docs");

const GENERATOR_ENV = {
  ...process.env,
  FIREBASE_API_KEY: "test-api-key",
  FIREBASE_PROJECT_ID: "test-project",
  FIREBASE_APP_ID: "1:123:web:abc",
  FIREBASE_AUTH_DOMAIN: "example.test",
};

function runWriteFirebaseConfig() {
  const result = spawnSync(process.execPath, ["scripts/write-firebase-config.js"], {
    cwd: root,
    env: GENERATOR_ENV,
  });
  assert.equal(result.status, 0, result.stderr?.toString() || "write-firebase-config.js failed");
}

describe("firebase-config export contract (generated config)", () => {
  it("discovers imports from shipped docs modules including firestore, game-functions, auth", () => {
    const imports = discoverFirebaseConfigImports(docsDir);
    assert.ok(imports.has("firestore.js"), "expected firestore.js importer");
    assert.ok(imports.has("game-functions.js"), "expected game-functions.js importer");
    assert.ok(imports.has("auth.js"), "expected auth.js importer");
    assert.ok(imports.get("firestore.js").has("SERVER_MONEY_AUTHORITY"));
  });

  it("generated docs/firebase-config.js exports every named import", () => {
    const backup = readFileSync(configPath, "utf8");
    try {
      runWriteFirebaseConfig();
      const generated = readFileSync(configPath, "utf8");
      assert.match(generated, /export const SERVER_MONEY_AUTHORITY = true/);

      const result = validateFirebaseConfigExportContract({ configPath, docsDir });
      if (!result.ok) {
        for (const failure of result.failures) {
          console.error(
            `missing export: importer=${failure.importer} binding=${failure.binding} config=${failure.configPath}`,
          );
        }
      }
      assert.equal(result.ok, true, "generated config missing named exports required by docs importers");

      const exports = parseFirebaseConfigNamedExports(generated);
      assert.ok(exports.has("SERVER_HAND_AUTHORITY"));
      assert.ok(exports.has("SERVER_MONEY_AUTHORITY"));
    } finally {
      writeFileSync(configPath, backup);
    }
  });
});
