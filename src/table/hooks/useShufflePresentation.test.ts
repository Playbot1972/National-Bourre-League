import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldRunShufflePresentation } from "./useShufflePresentation";

describe("shouldRunShufflePresentation", () => {
  it("runs only in shuffle phase", () => {
    assert.equal(shouldRunShufflePresentation("shuffle"), true);
    assert.equal(shouldRunShufflePresentation("ante"), false);
    assert.equal(shouldRunShufflePresentation("deal"), false);
    assert.equal(shouldRunShufflePresentation("trumpReveal"), false);
  });
});
