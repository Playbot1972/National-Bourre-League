import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { activateHandPacingModeForHand, setApeSpeedModeEnabledForTests } from "./handPacingMode";
import {
  BOT_PRESENTATION_FORCE_RELEASE_MS,
  BOT_PRESENTATION_SOFT_UNBLOCK_MS,
  evaluateBotPresentationGate,
  getTablePresentationBlockReason,
  getTrickAnimationBusyState,
  handPresentingBlocksBots,
  isTablePresentationBusy,
  isTablePresentationBusyForBots,
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
  dealPresentationActive: false,
  antePresentationActive: false,
  trickCollectionActive: false,
};

describe("trickAnimationBridge", () => {
  beforeEach(() => {
    resetTrickAnimationBusyState();
    setApeSpeedModeEnabledForTests(true);
    activateHandPacingModeForHand(1);
  });

  it("is idle by default", () => {
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

  it("does not block bots for drawPlayer during server draw phase", () => {
    assert.equal(handPresentingBlocksBots(true, "drawPlayer", "draw"), false);
    assert.equal(handPresentingBlocksBots(true, "drawReady", "draw"), false);
    assert.equal(handPresentingBlocksBots(true, "trumpReveal", "draw"), true);
  });

  it("blocks while deal presentation is active", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleTrickFields,
      dealPresentationActive: true,
    });
    assert.equal(getTablePresentationBlockReason(getTrickAnimationBusyState()), "dealPresentationActive");
    assert.equal(isTablePresentationBusyForBots(), true);
  });

  it("blocks while ante coin presentation is active", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleTrickFields,
      antePresentationActive: true,
    });
    assert.equal(getTablePresentationBlockReason(getTrickAnimationBusyState()), "antePresentationActive");
    assert.equal(isTablePresentationBusy(), true);
    assert.equal(isTablePresentationBusyForBots(), true);
  });

  it("syncs ante presentation flag from motion-busy module", async () => {
    resetTrickAnimationBusyState();
    const { setAntePresentationActive, resetPresentationMotionBusy } = await import(
      "./presentationMotionBusy"
    );
    const { syncPresentationMotionBusyFlags } = await import("./trickAnimationBridge");
    resetPresentationMotionBusy();
    setAntePresentationActive(true);
    syncPresentationMotionBusyFlags();
    assert.equal(getTrickAnimationBusyState().antePresentationActive, true);
    assert.equal(getTablePresentationBlockReason(getTrickAnimationBusyState()), "antePresentationActive");
    resetPresentationMotionBusy();
  });

  it("soft-unblocks bots after presentation wait threshold", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleTrickFields,
      handPresenting: true,
      handPresentationPhase: "trumpReveal",
    });
    const start = 1_000_000;
    const blocked = evaluateBotPresentationGate(start);
    assert.equal(blocked.blocked, true);
    const soft = evaluateBotPresentationGate(start + BOT_PRESENTATION_SOFT_UNBLOCK_MS);
    assert.equal(soft.blocked, false);
    assert.equal(soft.softUnblock, true);
    assert.equal(isTablePresentationBusyForBots(start + BOT_PRESENTATION_SOFT_UNBLOCK_MS), false);
  });

  it("force-releases presentation after hard timeout", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleTrickFields,
      pipelineActive: true,
    });
    const start = 2_000_000;
    evaluateBotPresentationGate(start);
    const forced = evaluateBotPresentationGate(start + BOT_PRESENTATION_FORCE_RELEASE_MS);
    assert.equal(forced.forceReleased, true);
    assert.equal(isTablePresentationBusy(), false);
    assert.equal(isTablePresentationBusyForBots(start + BOT_PRESENTATION_FORCE_RELEASE_MS + 100), false);
  });
});
