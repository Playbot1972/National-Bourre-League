import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyDrawFold } from "./draw";
import { HAND_PHASE } from "./types";
import type { PublicHandState } from "./types";
import {
  allEligibleDrawsComplete,
  canonicalHandDrawMetrics,
  drawCompletedAmongEligible,
  drawTotalEligible,
  staleDrawCompletedIds,
} from "./handParticipants";
import { assertMatchKeyInvariants } from "../table/matchKey";

function baseHand(participantIds: string[]): PublicHandState {
  return {
    phase: HAND_PHASE.DRAW,
    participantIds,
    dealerId: participantIds[0] ?? null,
    seatedIds: participantIds,
    actionOrder: participantIds,
    drawCompletedIds: [],
    tricksByPlayer: Object.fromEntries(participantIds.map((id) => [id, 0])),
    turnPlayerId: participantIds[1] ?? participantIds[0] ?? null,
  };
}

describe("canonical hand participants", () => {
  it("drawCompleted and drawTotal derive from the same eligible participant set", () => {
    const hand = {
      participantIds: ["a", "b"],
      drawCompletedIds: ["a"],
      dealerId: "a",
      seatedIds: ["a", "b"],
      actionOrder: ["b", "a"],
    };
    const metrics = canonicalHandDrawMetrics(hand);
    assert.equal(metrics.drawTotal, 2);
    assert.equal(metrics.drawCompleted, 1);
    assert.equal(drawTotalEligible(hand), metrics.eligibleIds.length);
    assert.equal(drawCompletedAmongEligible(hand), metrics.drawCompleted);
  });

  it("2-player active hand cannot produce drawCompleted > drawTotal", () => {
    const hand = baseHand(["p1", "p2"]);
    hand.drawCompletedIds = ["p1", "p2"];
    const metrics = canonicalHandDrawMetrics(hand);
    assert.ok(metrics.drawCompleted <= metrics.drawTotal);
    assert.equal(metrics.drawCompleted, 2);
    assert.equal(metrics.drawTotal, 2);
  });

  it("fold during draw keeps drawCompleted within drawTotal for remaining players", () => {
    const hand = baseHand(["p1", "p2", "p3", "p4", "p5"]);
    hand.drawCompletedIds = ["p1", "p2", "p3"];
    const folded = applyDrawFold(hand, hand.actionOrder!, "p3");
    assert.equal(folded.kind, "continue");
    const metrics = canonicalHandDrawMetrics(folded.publicHand);
    assert.equal(metrics.drawTotal, 4);
    assert.equal(metrics.drawCompleted, 2);
    assert.ok(metrics.drawCompleted <= metrics.drawTotal);
    assert.deepEqual(staleDrawCompletedIds(folded.publicHand), ["p3"]);
  });

  it("actionOrder stays consistent with eligible participants after fold", () => {
    const hand = baseHand(["bot_a", "bot_b", "host"]);
    hand.drawCompletedIds = ["bot_a"];
    const folded = applyDrawFold(hand, hand.actionOrder!, "host");
    const metrics = canonicalHandDrawMetrics(folded.publicHand);
    assert.deepEqual(metrics.eligibleIds, ["bot_a", "bot_b"]);
    assert.ok(metrics.actionOrder.every((id) => metrics.eligibleIds.includes(id)));
    assert.equal(metrics.actionOrder.length, metrics.eligibleIds.length);
  });

  it("allEligibleDrawsComplete matches draw metrics at completion", () => {
    const hand = baseHand(["p1", "p2"]);
    hand.drawCompletedIds = ["p1", "p2"];
    assert.equal(allEligibleDrawsComplete(hand), true);
    const metrics = canonicalHandDrawMetrics(hand);
    assert.equal(metrics.drawCompleted, metrics.drawTotal);
  });

  it("matchKey invariant no longer fires when a folded seat remains in drawCompletedIds", () => {
    const hand = baseHand(["p1", "p2", "p3"]);
    hand.drawCompletedIds = ["p1", "p2", "p3"];
    const folded = applyDrawFold(hand, hand.actionOrder!, "p3");
    const metrics = canonicalHandDrawMetrics(folded.publicHand);
    assert.doesNotThrow(() =>
      assertMatchKeyInvariants({
        matchKey: "s-h1-t0-turn0-aseq1",
        turnPlayerId: folded.publicHand.turnPlayerId ?? null,
        heroId: "p1",
        botIds: new Set<string>(),
        presentation: {
          matchKey: "s-h1-t0-turn0-aseq1",
          pipelineActive: false,
          motionGateActive: false,
          revealCatchUp: false,
          handPresenting: false,
        },
        drawCompleted: metrics.drawCompleted,
        drawTotal: metrics.drawTotal,
        isHeroTurn: false,
        isBotTurn: false,
        visualCatchUpBusy: false,
        canHeroAct: false,
        needsBotDriver: false,
      }),
    );
    assert.equal(metrics.drawCompleted, 2);
    assert.equal(metrics.drawTotal, 2);
  });
});
