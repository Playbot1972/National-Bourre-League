import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeVisualSuppressTurn, isTrickPlayRevealCatchUp } from "./visualTurnGate";

describe("visualTurnGate", () => {
  it("suppresses during trick pipeline but not live reveal catch-up", () => {
    assert.equal(
      computeVisualSuppressTurn({
        trickSuppressTurn: false,
        handSuppressTurn: false,
        trickPipelineActive: true,
        trickPhase: "live",
        revealedCount: 2,
        revealTarget: 4,
      }),
      true,
    );

    assert.equal(
      computeVisualSuppressTurn({
        trickSuppressTurn: false,
        handSuppressTurn: false,
        trickPipelineActive: false,
        trickPhase: "live",
        revealedCount: 1,
        revealTarget: 3,
      }),
      false,
    );

    assert.equal(
      computeVisualSuppressTurn({
        trickSuppressTurn: false,
        handSuppressTurn: false,
        trickPipelineActive: false,
        trickPhase: "live",
        revealedCount: 3,
        revealTarget: 3,
      }),
      false,
    );
  });

  it("detects reveal catch-up only during live presentation", () => {
    assert.equal(
      isTrickPlayRevealCatchUp({
        trickPhase: "live",
        revealedCount: 0,
        revealTarget: 2,
      }),
      true,
    );
    assert.equal(
      isTrickPlayRevealCatchUp({
        trickPhase: "winnerReveal",
        revealedCount: 0,
        revealTarget: 4,
      }),
      false,
    );
  });
});
