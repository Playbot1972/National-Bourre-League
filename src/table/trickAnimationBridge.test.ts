import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getTablePresentationBlockReason,
  getTrickAnimationBusyState,
  isTablePresentationBusy,
  isTrickAnimationBusy,
  resetTrickAnimationBusyState,
  setTrickAnimationBusyState,
} from "./trickAnimationBridge";

const idleTrickFields = {
  pipelineActive: false,
  revealCatchUp: false,
  motionGateActive: false,
  peakPlayCount: 0,
  displayedPlayCount: 0,
  handPresenting: false,
  handPresentationPhase: "idle",
};

describe("trickAnimationBridge", () => {
  it("is idle by default", () => {
    resetTrickAnimationBusyState();
    assert.equal(isTrickAnimationBusy(), false);
    assert.equal(isTablePresentationBusy(), false);
  });

  it("blocks while trick pipeline is active", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleTrickFields,
      pipelineActive: true,
    });
    assert.equal(isTrickAnimationBusy(), true);
    assert.equal(isTablePresentationBusy(), true);
  });

  it("blocks while peak plays exceed displayed count", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleTrickFields,
      peakPlayCount: 3,
      displayedPlayCount: 1,
    });
    assert.equal(isTrickAnimationBusy(), true);
    assert.equal(isTablePresentationBusy(), true);
  });

  it("does not block when peak matches display", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleTrickFields,
      peakPlayCount: 2,
      displayedPlayCount: 2,
    });
    assert.equal(isTrickAnimationBusy(), false);
    assert.equal(isTablePresentationBusy(), false);
  });

  it("blocks while hand presentation is active", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleTrickFields,
      handPresenting: true,
      handPresentationPhase: "trumpReveal",
    });
    assert.equal(isTrickAnimationBusy(), false);
    assert.equal(isTablePresentationBusy(), true);
    assert.equal(getTablePresentationBlockReason(getTrickAnimationBusyState()), "handPresenting");
  });

  it("does not block bots for trump motion gate alone", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleTrickFields,
      motionGateActive: true,
      handPresentationPhase: "play",
    });
    assert.equal(isTrickAnimationBusy(), true);
    assert.equal(isTablePresentationBusy(), false);
    assert.equal(getTablePresentationBlockReason(getTrickAnimationBusyState()), null);
  });

  it("reports peak play catch-up as block reason", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleTrickFields,
      peakPlayCount: 3,
      displayedPlayCount: 1,
    });
    assert.equal(getTablePresentationBlockReason(getTrickAnimationBusyState()), "peakPlayCatchUp");
  });

  it("getTrickAnimationBusyState returns latest snapshot", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleTrickFields,
      revealCatchUp: true,
      peakPlayCount: 1,
      displayedPlayCount: 0,
    });
    assert.equal(getTrickAnimationBusyState().revealCatchUp, true);
    assert.equal(getTrickAnimationBusyState().handPresentationPhase, "idle");
  });
});
