import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createTrickPresentationStore,
  reduceTrickPresentation,
} from "./trickPresentationMachine";
import { serializedPlays } from "./trickTiming";
import {
  getTablePresentationBlockReason,
  getTrickAnimationBusyState,
  handPresentingBlocksBots,
  isTablePresentationBusy,
  resetTrickAnimationBusyState,
  setTrickAnimationBusyState,
} from "./trickAnimationBridge";

/** Mirrors TableSessionView — server play/draw is authoritative for bot gating. */
function handPresentingForBotGate(
  isPresenting: boolean,
  sessionPhase: string | null | undefined,
  handPresentationPhase = "drawReady",
): boolean {
  return handPresentingBlocksBots(isPresenting, handPresentationPhase, sessionPhase);
}

const idleBusy = {
  pipelineActive: false,
  revealCatchUp: false,
  motionGateActive: false,
  peakPlayCount: 0,
  displayedPlayCount: 0,
  revealedCount: 0,
  revealTarget: 0,
  handPresenting: false,
  handPresentationPhase: "idle",
};

describe("play-start presentation gate", () => {
  it("opening trick 1 is not blocked after draw/trump presentation while server is play", () => {
    resetTrickAnimationBusyState();

    // Client drawReady beat may still be running when server enters play.
    const handPresenting = handPresentingForBotGate(true, "play");
    assert.equal(handPresenting, false);

    setTrickAnimationBusyState({
      ...idleBusy,
      handPresenting,
      handPresentationPhase: "drawReady",
      motionGateActive: true,
    });

    assert.equal(isTablePresentationBusy(), false);
    assert.equal(getTablePresentationBlockReason(getTrickAnimationBusyState()), null);
  });

  it("play entry reinit clears stale prior-hand peak so catch-up does not block bots", () => {
    let store = createTrickPresentationStore({ p0: 4, bot_a: 1 }, {
      trickNumber: 5,
      leadSuit: "hearts",
      plays: [
        { playerId: "p0", card: { rank: "A", suit: "hearts" } },
        { playerId: "bot_a", card: { rank: "K", suit: "hearts" } },
      ],
    });
    store = {
      ...store,
      phase: "trickComplete",
      revealedCount: 2,
      peakTrickPlays: serializedPlays(store.prevTrick),
      displayRevealFloor: 2,
    };

    const trick1Empty = { trickNumber: 1, leadSuit: null, plays: [] as const };
    store = reduceTrickPresentation(store, {
      type: "reinit",
      snapshot: {
        currentTrick: trick1Empty,
        tricksByPlayer: { p0: 0, bot_a: 0 },
        playedCards: [],
      },
    });

    assert.equal(store.phase, "live");
    assert.equal(store.peakTrickPlays.length, 0);
    assert.equal(store.displayRevealFloor, 0);
    assert.equal(store.revealedCount, 0);

    resetTrickAnimationBusyState();
    setTrickAnimationBusyState({
      ...idleBusy,
      handPresenting: false,
      handPresentationPhase: "play",
      peakPlayCount: 0,
      displayedPlayCount: 0,
    });
    assert.equal(isTablePresentationBusy(), false);
  });

  it("draw-phase peer animations do not block bots", () => {
    resetTrickAnimationBusyState();
    const handPresenting = handPresentingForBotGate(true, "draw", "drawPlayer");
    assert.equal(handPresenting, false);
    setTrickAnimationBusyState({
      ...idleBusy,
      handPresenting,
      handPresentationPhase: "drawPlayer",
    });
    assert.equal(isTablePresentationBusy(), false);
  });

  it("stale ante presentation does not block bots once server is in draw", () => {
    resetTrickAnimationBusyState();
    const handPresenting = handPresentingForBotGate(true, "draw", "ante");
    assert.equal(handPresenting, false);
    setTrickAnimationBusyState({
      ...idleBusy,
      handPresenting,
      handPresentationPhase: "ante",
    });
    assert.equal(getTablePresentationBlockReason(getTrickAnimationBusyState()), null);
  });
});
