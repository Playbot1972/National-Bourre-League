import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * React error #310 — playVisualTierFor was once declared after HeroHand early returns,
 * so signed-out / empty-hand renders skipped the hook while full-hand renders ran it.
 */
test("HeroHand declares playVisualTierFor useCallback before early returns", () => {
  const src = readFileSync(new URL("./HeroHand.tsx", import.meta.url), "utf8");
  const hookIdx = src.indexOf("const playVisualTierFor = useCallback");
  const earlyReturnIdx = src.indexOf("if (!signedIn) {");
  assert.ok(hookIdx >= 0, "playVisualTierFor hook missing");
  assert.ok(earlyReturnIdx >= 0, "signedIn guard missing");
  assert.ok(
    hookIdx < earlyReturnIdx,
    "playVisualTierFor must run on every render — declare it before early returns",
  );
});
