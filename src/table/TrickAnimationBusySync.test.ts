import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { buildTrickAnimationBusyState } from "./TrickAnimationBusySync";
import {
  resetPresentationMotionBusy,
  setDealPresentationActive,
  setTrickCollectionActive,
} from "./presentationMotionBusy";
import {
  getTrickAnimationBusyState,
  resetTrickAnimationBusyState,
  setTrickAnimationBusyState,
} from "./trickAnimationBridge";

const baseInput = {
  pipelineActive: false,
  revealCatchUp: false,
  motionGateActive: false,
  peakPlayCount: 0,
  displayedPlayCount: 0,
  handPresenting: false,
  handPresentationPhase: "idle",
};

describe("buildTrickAnimationBusyState", () => {
  afterEach(() => {
    resetPresentationMotionBusy();
    resetTrickAnimationBusyState();
  });

  it("merges trick collection flag from presentationMotionBusy", () => {
    resetPresentationMotionBusy();
    setTrickCollectionActive(true);
    const state = buildTrickAnimationBusyState(baseInput);
    assert.equal(state.trickCollectionActive, true);
    assert.equal(state.dealPresentationActive, false);
  });

  it("merges deal presentation flag from presentationMotionBusy", () => {
    resetPresentationMotionBusy();
    setDealPresentationActive(true);
    const state = buildTrickAnimationBusyState(baseInput);
    assert.equal(state.dealPresentationActive, true);
    assert.equal(state.trickCollectionActive, false);
  });

  it("passes through trick pipeline and hand presentation fields", () => {
    resetPresentationMotionBusy();
    const state = buildTrickAnimationBusyState({
      ...baseInput,
      pipelineActive: true,
      handPresenting: true,
      handPresentationPhase: "settle",
      peakPlayCount: 4,
      displayedPlayCount: 2,
    });
    assert.equal(state.pipelineActive, true);
    assert.equal(state.handPresenting, true);
    assert.equal(state.handPresentationPhase, "settle");
    assert.equal(state.peakPlayCount, 4);
    assert.equal(state.displayedPlayCount, 2);
  });
});

describe("setTrickAnimationBusyState with buildTrickAnimationBusyState", () => {
  afterEach(() => {
    resetPresentationMotionBusy();
    resetTrickAnimationBusyState();
  });

  it("updates bridge snapshot when motion flags toggle", () => {
    resetPresentationMotionBusy();
    resetTrickAnimationBusyState();
    setTrickCollectionActive(true);
    setTrickAnimationBusyState(buildTrickAnimationBusyState(baseInput));
    assert.equal(getTrickAnimationBusyState().trickCollectionActive, true);
  });
});
