import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getTrickAnimationBusyState,
  isTrickAnimationBusy,
  resetTrickAnimationBusyState,
  setTrickAnimationBusyState,
} from "./trickAnimationBridge";

describe("trickAnimationBridge", () => {
  it("is idle by default", () => {
    resetTrickAnimationBusyState();
    assert.equal(isTrickAnimationBusy(), false);
  });

  it("blocks while trick pipeline is active", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      pipelineActive: true,
      revealCatchUp: false,
      motionGateActive: false,
      peakPlayCount: 0,
      displayedPlayCount: 0,
    });
    assert.equal(isTrickAnimationBusy(), true);
  });

  it("blocks while peak plays exceed displayed count", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      pipelineActive: false,
      revealCatchUp: false,
      motionGateActive: false,
      peakPlayCount: 3,
      displayedPlayCount: 1,
    });
    assert.equal(isTrickAnimationBusy(), true);
  });

  it("does not block when peak matches display", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      pipelineActive: false,
      revealCatchUp: false,
      motionGateActive: false,
      peakPlayCount: 2,
      displayedPlayCount: 2,
    });
    assert.equal(isTrickAnimationBusy(), false);
  });

  it("getTrickAnimationBusyState returns latest snapshot", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      pipelineActive: false,
      revealCatchUp: true,
      motionGateActive: false,
      peakPlayCount: 1,
      displayedPlayCount: 0,
    });
    assert.equal(getTrickAnimationBusyState().revealCatchUp, true);
  });
});
