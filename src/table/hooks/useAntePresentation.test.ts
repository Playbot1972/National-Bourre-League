import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldRunAntePresentation } from "./useAntePresentation";

describe("shouldRunAntePresentation", () => {
  it("runs on ante phase when armed", () => {
    assert.equal(shouldRunAntePresentation("ante", true, 2), true);
  });

  it("runs on trumpReveal phase when anteAnimActive (legacy enrollment→draw)", () => {
    assert.equal(shouldRunAntePresentation("trumpReveal", true, 2), true);
  });

  it("skips when anteAnimActive is false", () => {
    assert.equal(shouldRunAntePresentation("ante", false, 2), false);
    assert.equal(shouldRunAntePresentation("trumpReveal", false, 2), false);
  });

  it("skips when anteAmount is zero", () => {
    assert.equal(shouldRunAntePresentation("ante", true, 0), false);
  });

  it("skips unrelated presentation phases", () => {
    assert.equal(shouldRunAntePresentation("drawPlayer", true, 2), false);
    assert.equal(shouldRunAntePresentation("play", true, 2), false);
  });
});
