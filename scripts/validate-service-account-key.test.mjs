import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

const script = new URL("./validate-service-account-key.mjs", import.meta.url).pathname;
const validKey = {
  type: "service_account",
  project_id: "demo-project",
  private_key_id: "abc123",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIE\n-----END PRIVATE KEY-----\n",
  client_email: "github-firebase-deploy@demo-project.iam.gserviceaccount.com",
  client_id: "123456789",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

function run(args, input) {
  return spawnSync(process.execPath, [script, ...args], {
    encoding: "utf8",
    input,
  });
}

describe("validate-service-account-key", () => {
  it("accepts a well-formed service account JSON file", () => {
    const dir = mkdtempSync(join(tmpdir(), "sa-key-"));
    const file = join(dir, "key.json");
    writeFileSync(file, JSON.stringify(validKey));
    const result = run([file]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /client_email=github-firebase-deploy@demo-project/);
  });

  it("rejects corrupted binary-like content", () => {
    const result = run(["--stdin"], "rX\x00\x01not json");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /not valid JSON/);
  });

  it("rejects JSON missing private_key", () => {
    const dir = mkdtempSync(join(tmpdir(), "sa-key-"));
    const file = join(dir, "bad.json");
    const { private_key: _pk, ...rest } = validKey;
    writeFileSync(file, JSON.stringify(rest));
    const result = run([file]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /missing fields/);
  });

  it("checks project_id when --project is passed", () => {
    const dir = mkdtempSync(join(tmpdir(), "sa-key-"));
    const file = join(dir, "key.json");
    writeFileSync(file, JSON.stringify(validKey));
    const result = run([file, "--project", "other-project"]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /does not match expected/);
  });
});
