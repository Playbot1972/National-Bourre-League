import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dealInitialHand } from "./deal";
import {
  activateHandDecision,
  applyDecisionPass,
  applyDecisionPlay,
  applyDecisionTimeout,
  buildHandDecision,
  currentDecisionPlayer,
} from "./decision";
import { serializePagatRevealHand } from "./serialize";
import { HAND_PHASE } from "./types";

const ALL_SEATED = ["p1", "p2", "p3", "p4"];
const DEALT = ["p1", "p2", "p3"];
const DEAL_CTX = { dealerId: "p1", sortedPlayerIds: ALL_SEATED, dealingRule: null };

describe("next-hand transition — busted / out player excluded from decision", () => {
  it("deal decision queue includes only dealt participants, not full seated ring", () => {
    const deal = dealInitialHand({
      dealerId: "p1",
      participantIds: DEALT,
      sortedPlayerIds: ALL_SEATED,
      seed: 55,
    });
    const bundle = serializePagatRevealHand(deal, {
      dealerId: "p1",
      actionOrder: deal.dealOrder,
      seatedIds: ALL_SEATED,
    });
    assert.deepEqual(bundle.publicHand.participantIds, DEALT);
    assert.deepEqual(bundle.publicHand.seatedIds, ALL_SEATED);
    const ordered = bundle.publicHand.handDecision?.orderedPlayerIds ?? [];
    assert.ok(!ordered.includes("p4"), "busted seat p4 must not be in decision order");
    assert.deepEqual(ordered, ["p2", "p3", "p1"]);
  });

  it("out player pass advances decision without stalling on undelt seat", () => {
    const deal = dealInitialHand({
      dealerId: "p1",
      participantIds: DEALT,
      sortedPlayerIds: ALL_SEATED,
      seed: 56,
    });
    const bundle = serializePagatRevealHand(deal, {
      dealerId: "p1",
      actionOrder: deal.dealOrder,
      seatedIds: ALL_SEATED,
    });
    let hand = activateHandDecision(bundle.publicHand, 1_000);
    let decision = hand.handDecision!;
    assert.equal(currentDecisionPlayer(decision), "p2");

    let step = applyDecisionPlay(hand as never, decision, "p2", 0, DEAL_CTX, 2_000);
    decision = step.handDecision!;
    hand = step.publicHand;
    step = applyDecisionPlay(hand as never, decision, "p3", 0, DEAL_CTX, 3_000);
    decision = step.handDecision!;
    hand = step.publicHand;
    step = applyDecisionPlay(hand as never, decision, "p1", 0, DEAL_CTX, 4_000);

    assert.equal(step.kind, "draw");
    if (step.kind !== "draw") return;
    assert.deepEqual(step.publicHand.participantIds, ["p2", "p3", "p1"]);
    assert.equal(step.publicHand.phase, HAND_PHASE.DRAW);
  });

  it("decision restart after all-pass uses dealt participants only", () => {
    const decision = buildHandDecision(DEALT, "p1", true, 1_000);
    const hand = {
      phase: HAND_PHASE.DECISION,
      participantIds: DEALT,
      seatedIds: ALL_SEATED,
      dealerId: "p1",
      trumpSuit: "hearts" as const,
      trumpUpcard: { rank: "K", suit: "hearts" },
      handDecision: decision,
      actionOrder: ["p2", "p3", "p1"],
      tricksByPlayer: Object.fromEntries(DEALT.map((id) => [id, 0])),
    };

    let step = applyDecisionTimeout(hand as never, decision, DEAL_CTX, 2_000);
    let d = step.handDecision!;
    let h = step.publicHand;
    step = applyDecisionTimeout(h as never, d, DEAL_CTX, 3_000);
    d = step.handDecision!;
    h = step.publicHand;
    step = applyDecisionTimeout(h as never, d, DEAL_CTX, 4_000);

    assert.equal(step.kind, "restart");
    if (step.kind !== "restart") return;
    const restarted = step.handDecision.orderedPlayerIds;
    assert.ok(!restarted.includes("p4"));
    assert.deepEqual(restarted, ["p2", "p3", "p1"]);
  });
});
