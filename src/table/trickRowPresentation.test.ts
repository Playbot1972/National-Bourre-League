import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveTrickRowPresentationClasses } from "./trickRowPresentation";

describe("resolveTrickRowPresentationClasses", () => {
  it("applies hold during trickComplete and winnerReveal", () => {
    assert.deepEqual(resolveTrickRowPresentationClasses("trickComplete"), {
      isHold: true,
      isRake: false,
      isEcho: false,
    });
    assert.deepEqual(resolveTrickRowPresentationClasses("winnerReveal"), {
      isHold: true,
      isRake: false,
      isEcho: false,
    });
  });

  it("applies rake only during collectTrick", () => {
    assert.deepEqual(resolveTrickRowPresentationClasses("collectTrick"), {
      isHold: false,
      isRake: true,
      isEcho: false,
    });
  });

  it("has no hold or rake during live and nextLeadReady", () => {
    for (const phase of ["live", "nextLeadReady"] as const) {
      assert.deepEqual(resolveTrickRowPresentationClasses(phase), {
        isHold: false,
        isRake: false,
        isEcho: false,
      });
    }
  });

  it("marks echo variant", () => {
    const echo = resolveTrickRowPresentationClasses("winnerReveal", "echo");
    assert.equal(echo.isEcho, true);
    assert.equal(echo.isHold, true);
  });
});
