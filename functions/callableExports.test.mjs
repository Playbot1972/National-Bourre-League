/**
 * Callable export registration — gameVerifySessionLedger present in functions/index.js.
 *
 * Run: cd functions && node --test callableExports.test.mjs
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const indexPath = join(dirname(fileURLToPath(import.meta.url)), "index.js");
const indexSource = readFileSync(indexPath, "utf8");

describe("callable export registration", () => {
  it("exports gameVerifySessionLedger from index.js", () => {
    assert.match(indexSource, /export const gameVerifySessionLedger\s*=/);
    assert.match(indexSource, /import\s*\{\s*handleVerifySessionLedger\s*\}\s*from\s*"\.\/sessionLedgerVerify\.js"/);
  });

  it("gameVerifySessionLedger uses Gen2 onCall with public invoker and auth token from request.auth", () => {
    const block = indexSource.slice(
      indexSource.indexOf("export const gameVerifySessionLedger"),
      indexSource.indexOf("export const gameVoteCoWinSettlement"),
    );
    assert.match(block, /onCall\s*\(/);
    assert.match(block, /invoker:\s*"public"/);
    assert.match(block, /cors:\s*true/);
    assert.match(block, /serviceAccount:\s*runtimeServiceAccount/);
    assert.match(block, /request\.auth\.token/);
    assert.match(block, /handleVerifySessionLedger/);
    assert.doesNotMatch(block, /\.\.\.data,\s*actorId[\s\S]*authToken:\s*data\.authToken/);
  });

  it("gameVerifySessionLedger authToken cannot be overridden by request payload spread", () => {
    const block = indexSource.slice(
      indexSource.indexOf("export const gameVerifySessionLedger"),
      indexSource.indexOf("export const gameVoteCoWinSettlement"),
    );
    assert.match(block, /authToken:\s*request\.auth\.token/);
    const spreadIdx = block.indexOf("...data");
    const tokenIdx = block.indexOf("authToken:");
    assert.ok(spreadIdx >= 0 && tokenIdx > spreadIdx, "authToken must follow ...data spread");
  });
});
