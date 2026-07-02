import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
  trickCollectionActive: false,
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

  it("does not block bots for cosmetic deal/draw presentation", () => {
    assert.equal(handPresentingBlocksBots(true, "drawPlayer", "draw"), false);
    assert.equal(handPresentingBlocksBots(true, "drawReady", "draw"), false);
    assert.equal(handPresentingBlocksBots(true, "trumpReveal", "draw"), false);
    assert.equal(handPresentingBlocksBots(true, "trumpReveal", "reveal"), false);
    assert.equal(handPresentingBlocksBots(true, "ante", "reveal"), false);
    assert.equal(handPresentingBlocksBots(true, "settle", "draw"), true);
  });

  it("soft-unblocks bots after presentation wait threshold for hand deal only", () => {
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

  it("does not soft-unblock play reveal catch-up — bots wait for serialized cards", () => {
    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleTrickFields,
      revealCatchUp: true,
      peakPlayCount: 2,
      displayedPlayCount: 1,
    });
    const start = 3_000_000;
    assert.equal(evaluateBotPresentationGate(start).blocked, true);
    assert.equal(
      evaluateBotPresentationGate(start + BOT_PRESENTATION_SOFT_UNBLOCK_MS).blocked,
      true,
    );
    assert.equal(
      isTablePresentationBusyForBots(start + BOT_PRESENTATION_SOFT_UNBLOCK_MS),
      true,
    );
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
