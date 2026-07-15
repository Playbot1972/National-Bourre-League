import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { botPlayCardIndex } from "../game/play";
import { getLegalPlayIndices } from "../game/legal";
import type { Card } from "../types";
import {
  activateHandPacingModeForHand,
  buildClassicAnteCoinDelayPlan,
  getActiveHandPacingMode,
  getApeSpeedModeEnabled,
  getHandPacingMode,
  lockHandPacingMode,
  PACING_FORCE_RELEASE_MS,
  PACING_SOFT_UNBLOCK_MS,
  resetHandPacingModeForTests,
  resolveAnteCoinDelayPlan,
  resolveHandPacingModeFromPrefs,
  saveApeSpeedModeEnabled,
  setApeSpeedModeEnabledForTests,
} from "./handPacingMode";
import { antePresentationDurationMs } from "./handPresentationTiming";
import { phaseScheduleMs } from "./handPresentationMachine";
import {
  BOT_PRESENTATION_FORCE_RELEASE_MS,
  BOT_PRESENTATION_SOFT_UNBLOCK_MS,
  evaluateBotPresentationGate,
  forceReleasePresentationForBots,
  setTrickAnimationBusyState,
} from "./trickAnimationBridge";

describe("handPacingMode", () => {
  beforeEach(() => {
    resetHandPacingModeForTests();
    setApeSpeedModeEnabledForTests(null);
    try {
      localStorage.removeItem("nbl-ape-speed-mode");
    } catch {
      /* ignore */
    }
  });

  it("defaults OFF (classic pacing)", () => {
    assert.equal(getApeSpeedModeEnabled(), false);
    assert.equal(resolveHandPacingModeFromPrefs(), "classic");
  });

  it("locks pacing per hand so mid-hand toggles apply next hand", () => {
    setApeSpeedModeEnabledForTests(false);
    assert.equal(lockHandPacingMode(3), "classic");
    setApeSpeedModeEnabledForTests(true);
    assert.equal(getHandPacingMode(3), "classic");
    assert.equal(lockHandPacingMode(4), "apeSpeed");
  });

  it("classic ante schedule uses full visual duration", () => {
    const playerIds = ["p1", "p2", "p3", "p4"];
    const classic = antePresentationDurationMs(1, playerIds, false, "classic");
    const apePlan = resolveAnteCoinDelayPlan(1, playerIds, false, "apeSpeed");
    const ape = apePlan.totalThinkMs;
    assert.equal(classic, 1_440);
    assert.ok(ape >= 4 * 250);
    assert.ok(ape <= 4 * 700);
  });

  it("ape speed ante schedule uses think-only duration", () => {
    const playerIds = ["p1", "p2"];
    const plan = resolveAnteCoinDelayPlan(2, playerIds, false, "apeSpeed");
    const ape = antePresentationDurationMs(2, playerIds, false, "apeSpeed");
    assert.equal(ape, plan.totalThinkMs);
    assert.ok(plan.totalDurationMs > plan.totalThinkMs);
  });

  it("classic ante plan uses fixed stagger between seats", () => {
    const plan = buildClassicAnteCoinDelayPlan(1, ["a", "b", "c"], false);
    assert.deepEqual(plan.thinkBeforeMs, [0, 380, 380]);
    assert.ok(plan.totalDurationMs > plan.totalThinkMs);
  });

  it("phaseScheduleMs ante case respects pacing mode", () => {
    const playerIds = ["bot_1", "bot_2", "bot_3"];
    const store = {
      phase: "ante",
      handNumber: 5,
      prevSnapshot: { participantIds: playerIds },
    } as Parameters<typeof phaseScheduleMs>[0];
    const classic = phaseScheduleMs(store, false, "classic");
    const ape = phaseScheduleMs(store, false, "apeSpeed");
    assert.equal(classic, 1_060);
    assert.ok(ape >= 3 * 250);
    assert.ok(ape <= 3 * 700);
  });

  it("activates bot gate pacing profile for the current hand", () => {
    setApeSpeedModeEnabledForTests(true);
    activateHandPacingModeForHand(9);
    assert.equal(getActiveHandPacingMode(), "apeSpeed");
    assert.equal(PACING_SOFT_UNBLOCK_MS.apeSpeed, BOT_PRESENTATION_SOFT_UNBLOCK_MS);
    assert.equal(PACING_FORCE_RELEASE_MS.apeSpeed, BOT_PRESENTATION_FORCE_RELEASE_MS);
  });

  it("classic mode waits longer before soft-unblocking presentation", () => {
    setApeSpeedModeEnabledForTests(false);
    activateHandPacingModeForHand(1);
    const start = 1_000_000;
    setTrickAnimationBusyState({
      pipelineActive: true,
      revealCatchUp: false,
      motionGateActive: false,
      peakPlayCount: 0,
      displayedPlayCount: 0,
      handPresenting: false,
      handPresentationPhase: "idle",
      dealPresentationActive: false,
      antePresentationActive: false,
      trickCollectionActive: false,
    });
    assert.equal(evaluateBotPresentationGate(start).blocked, true);
    assert.equal(evaluateBotPresentationGate(start + 5_500).blocked, true);
    assert.equal(evaluateBotPresentationGate(start + 8_500).blocked, false);
    forceReleasePresentationForBots("test");
  });

  it("bot card choice is unchanged in both pacing modes", () => {
    const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });
    const hand = [card("A", "clubs"), card("2", "clubs")];
    const ctx = {
      hand,
      trumpSuit: "hearts" as const,
      leadSuit: null,
      trickPlays: [],
      isLeading: true,
    };
    const idx = botPlayCardIndex(hand, ctx);
    const legal = getLegalPlayIndices(ctx);
    assert.ok(legal.includes(idx));
    saveApeSpeedModeEnabled(true);
    activateHandPacingModeForHand(1);
    assert.equal(botPlayCardIndex(hand, ctx), idx);
    setApeSpeedModeEnabledForTests(false);
    activateHandPacingModeForHand(2);
    assert.equal(botPlayCardIndex(hand, ctx), idx);
  });
});
