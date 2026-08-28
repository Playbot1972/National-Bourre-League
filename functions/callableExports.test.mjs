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

function callableBlock(exportName, nextExportName) {
  return indexSource.slice(
    indexSource.indexOf(`export const ${exportName}`),
    indexSource.indexOf(`export const ${nextExportName}`),
  );
}

describe("callable export registration", () => {
  it("exports gameVerifySessionLedger from index.js", () => {
    assert.match(indexSource, /export const gameVerifySessionLedger\s*=/);
    assert.match(
      indexSource,
      /import\s*\{\s*handleVerifySessionLedger\s*\}\s*from\s*"\.\/sessionLedgerVerify\.js"/,
    );
  });

  it("gameVerifySessionLedger uses the same Gen2 onCall shell as gameRecordHand", () => {
    const recordHandBlock = callableBlock("gameRecordHand", "gameVerifySessionLedger");
    const verifyBlock = callableBlock("gameVerifySessionLedger", "gameVoteCoWinSettlement");
    assert.match(recordHandBlock, /wrap\(handleRecordHand,\s*"gameRecordHand"\)/);
    assert.match(verifyBlock, /wrapWithAuthToken\([\s\S]*handleVerifySessionLedger[\s\S]*"gameVerifySessionLedger"/);
    assert.match(indexSource, /const callableOptions = \{[\s\S]*invoker:\s*"public"/);
    assert.match(indexSource, /return onCall\(callableOptions,/);
    assert.match(indexSource, /function wrapWithAuthToken/);
    assert.doesNotMatch(verifyBlock, /region:\s*"/);
    assert.doesNotMatch(recordHandBlock, /region:\s*"/);
  });

  it("gameVerifySessionLedger passes verified auth token after payload spread", () => {
    const wrapBlock = indexSource.slice(
      indexSource.indexOf("function wrapWithAuthToken"),
      indexSource.indexOf("/** Nudge bot enrollment"),
    );
    assert.match(wrapBlock, /authToken:\s*request\.auth\.token/);
    const spreadIdx = wrapBlock.indexOf("...data");
    const tokenIdx = wrapBlock.indexOf("authToken:");
    assert.ok(spreadIdx >= 0 && tokenIdx > spreadIdx, "authToken must follow ...data spread");
  });
});
