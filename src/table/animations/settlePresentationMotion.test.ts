import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runSettlePresentationMotion } from "./settlePresentationMotion";

describe("settlePresentationMotion", () => {
  it("completes immediately when DOM targets are missing", () => {
    let done = false;
    const cleanup = runSettlePresentationMotion({
      kind: "potPayout",
      fromEl: null,
      toEl: null,
      durationMs: 480,
      onComplete: () => {
        done = true;
      },
    });
    assert.equal(done, true);
    cleanup();
  });
});
