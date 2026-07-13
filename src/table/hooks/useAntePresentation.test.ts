import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldRunAntePresentation } from "./useAntePresentation";

describe("shouldRunAntePresentation", () => {
  it("runs on ante phase when armed", () => {
    assert.equal(shouldRunAntePresentation("ante", true, 2), true);
  });

  it("skips trumpReveal — deal must follow ante first", () => {
    assert.equal(shouldRunAntePresentation("trumpReveal", true, 2), false);
  });

  it("skips when anteAnimActive is false", () => {
    assert.equal(shouldRunAntePresentation("ante", false, 2), false);
  });

  it("skips when anteAmount is zero", () => {
    assert.equal(shouldRunAntePresentation("ante", true, 0), false);
  });

  it("skips unrelated presentation phases including deal", () => {
    assert.equal(shouldRunAntePresentation("deal", true, 2), false);
    assert.equal(shouldRunAntePresentation("drawPlayer", true, 2), false);
  });
});
