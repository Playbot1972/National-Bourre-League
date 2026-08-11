import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appJs = readFileSync(join(root, "docs/app.js"), "utf8");
const hook = readFileSync(join(root, "src/table/useCoWinResultVisibility.ts"), "utf8");

describe("tie result readability integration", () => {
  it("next-hand auto-open respects active tie latch bridge", () => {
    assert.match(
      appJs,
      /pendingCoWinSettlement \|\| tableMountApi\?\.isCoWinResultLatched\?\.\(\)/,
    );
  });

  it("tie hook keeps latch independent of hand presentation imports", () => {
    assert.doesNotMatch(hook, /handPresentation/);
    assert.doesNotMatch(hook, /trickPresentation/);
    assert.match(hook, /setCoWinResultLatched/);
    assert.match(hook, /TIE_RESULT_CONTINUE_GUARD_MS/);
    assert.match(hook, /tieResultAutoHideRemainingMs/);
  });
});
