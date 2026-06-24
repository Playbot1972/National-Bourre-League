import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dealInitialHand } from "./deal";
import { playerOrderFromDealer } from "./playerOrder";
import { serializePagatRevealHand } from "./serialize";
import { HAND_PHASE } from "./types";
import {
  activateHandDecision,
  applyDecisionPass,
  applyDecisionPlay,
  applyDecisionTimeout,
  buildHandDecision,
  currentDecisionPlayer,
  dealerMustPlayTrumpAce,
} from "./decision";

const SORTED = ["p1", "p2", "p3", "p4"];
const DEAL_CTX = { dealerId: "p1", sortedPlayerIds: SORTED, dealingRule: null };

describe("Pagat decision phase", () => {
  it("deals into reveal with inactive decision clock", () => {
    const deal = dealInitialHand({
      dealerId: "p1",
      participantIds: SORTED,
      sortedPlayerIds: SORTED,
      seed: 42,
    });
    const bundle = serializePagatRevealHand(deal, {
      dealerId: "p1",
      actionOrder: deal.dealOrder,
      seatedIds: SORTED,
    });
    assert.equal(bundle.publicHand.phase, HAND_PHASE.REVEAL);
    assert.equal(bundle.publicHand.handDecision?.active, false);
    assert.deepEqual(bundle.publicHand.seatedIds, SORTED);
    assert.deepEqual(bundle.publicHand.handDecision?.orderedPlayerIds, ["p2", "p3", "p4", "p1"]);
  });

  it("activates decision after reveal", () => {
    const deal = dealInitialHand({
      dealerId: "p1",
      participantIds: SORTED,
      sortedPlayerIds: SORTED,
      seed: 1,
    });
    const bundle = serializePagatRevealHand(deal, {
      dealerId: "p1",
      actionOrder: deal.dealOrder,
    });
    const activated = activateHandDecision(bundle.publicHand, 1_000);
    assert.equal(activated.phase, HAND_PHASE.DECISION);
    assert.equal(activated.handDecision?.active, true);
    assert.equal(currentDecisionPlayer(activated.handDecision!), "p2");
  });

  it("does not reset the decision clock when already active", () => {
    const deal = dealInitialHand({
      dealerId: "p1",
      participantIds: SORTED,
      sortedPlayerIds: SORTED,
      seed: 2,
    });
    const bundle = serializePagatRevealHand(deal, {
      dealerId: "p1",
      actionOrder: deal.dealOrder,
    });
    const first = activateHandDecision(bundle.publicHand, 1_000);
    const deadline = first.handDecision?.turnDeadlineMs;
    const again = activateHandDecision(first, 9_500);
    assert.equal(again.handDecision?.turnDeadlineMs, deadline);
    assert.equal(again.handDecision?.currentIndex, first.handDecision?.currentIndex);
  });

  it("play records planned discard count and advances", () => {
    const decision = buildHandDecision(SORTED, "p1", true, 1_000);
    const hand = {
      phase: HAND_PHASE.DECISION,
      participantIds: SORTED,
      seatedIds: SORTED,
      dealerId: "p1",
      trumpSuit: "hearts" as const,
      trumpUpcard: { rank: "K", suit: "hearts" },
      handDecision: decision,
      actionOrder: playerOrderFromDealer("p1", SORTED),
      tricksByPlayer: Object.fromEntries(SORTED.map((id) => [id, 0])),
    };
    const step = applyDecisionPlay(hand as never, decision, "p2", 2, DEAL_CTX, 2_000);
    assert.equal(step.kind, "continue");
    if (step.kind !== "continue") return;
    assert.deepEqual(step.handDecision.playingIds, ["p2"]);
    assert.equal(step.handDecision.plannedDiscards.p2, 2);
    assert.equal(currentDecisionPlayer(step.handDecision), "p3");
  });

  it("pass marks player sat out", () => {
    const decision = buildHandDecision(SORTED, "p1", true, 1_000);
    const hand = {
      phase: HAND_PHASE.DECISION,
      participantIds: SORTED,
      seatedIds: SORTED,
      dealerId: "p1",
      trumpSuit: "hearts" as const,
      trumpUpcard: { rank: "K", suit: "hearts" },
      handDecision: decision,
      actionOrder: playerOrderFromDealer("p1", SORTED),
      tricksByPlayer: Object.fromEntries(SORTED.map((id) => [id, 0])),
    };
    const step = applyDecisionPass(hand as never, decision, "p2", DEAL_CTX, 2_000);
    assert.equal(step.kind, "continue");
    if (step.kind !== "continue") return;
    assert.deepEqual(step.handDecision.passedIds, ["p2"]);
  });

  it("dealer cannot pass on ace trump", () => {
    const decision = {
      ...buildHandDecision(["p1", "p2"], "p1", true, 1_000),
      currentIndex: 1,
      orderedPlayerIds: ["p2", "p1"],
    };
    const hand = {
      phase: HAND_PHASE.DECISION,
      participantIds: ["p1", "p2"],
      seatedIds: ["p1", "p2"],
      dealerId: "p1",
      trumpSuit: "spades" as const,
      trumpUpcard: { rank: "A", suit: "spades" },
      handDecision: decision,
      actionOrder: ["p2", "p1"],
      tricksByPlayer: { p1: 0, p2: 0 },
    };
    assert.throws(
      () => applyDecisionPass(hand as never, decision, "p1", DEAL_CTX, 2_000),
      /must play/i,
    );
    assert.equal(dealerMustPlayTrumpAce("p1", "p1", { rank: "A", suit: "spades" }), true);
  });

  it("stay pat players skip draw turn when decision completes", () => {
    let decision = buildHandDecision(["p1", "p2", "p3"], "p1", true, 1_000);
    const baseHand = {
      phase: HAND_PHASE.DECISION,
      participantIds: ["p1", "p2", "p3"],
      seatedIds: ["p1", "p2", "p3"],
      dealerId: "p1",
      trumpSuit: "clubs" as const,
      trumpUpcard: { rank: "9", suit: "clubs" },
      actionOrder: ["p2", "p3", "p1"],
      tricksByPlayer: { p1: 0, p2: 0, p3: 0 },
      deckSeed: 1,
      deckNextIndex: 16,
      remainingDeckCount: 36,
    };

    let hand = { ...baseHand, handDecision: decision };
    let step = applyDecisionPlay(hand as never, decision, "p2", 0, DEAL_CTX, 2_000);
    decision = step.handDecision!;
    hand = step.publicHand;
    step = applyDecisionPlay(hand as never, decision, "p3", 3, DEAL_CTX, 3_000);
    decision = step.handDecision!;
    hand = step.publicHand;
    step = applyDecisionPlay(hand as never, decision, "p1", 0, DEAL_CTX, 4_000);

    assert.equal(step.kind, "draw");
    if (step.kind !== "draw") return;
    assert.equal(step.publicHand.phase, HAND_PHASE.DRAW);
    assert.deepEqual(step.publicHand.participantIds, ["p2", "p3", "p1"]);
    assert.ok(step.publicHand.drawCompletedIds?.includes("p2"));
    assert.ok(step.publicHand.drawCompletedIds?.includes("p1"));
    assert.equal(step.publicHand.turnPlayerId, "p3");
  });

  it("timeout auto-passes except forced dealer ace", () => {
    const decision = buildHandDecision(["p1", "p2"], "p1", true, 1_000);
    const hand = {
      phase: HAND_PHASE.DECISION,
      participantIds: ["p1", "p2"],
      seatedIds: ["p1", "p2"],
      dealerId: "p1",
      trumpSuit: "hearts" as const,
      trumpUpcard: { rank: "Q", suit: "hearts" },
      handDecision: decision,
      actionOrder: ["p2", "p1"],
      tricksByPlayer: { p1: 0, p2: 0 },
    };
    const step = applyDecisionTimeout(hand as never, decision, DEAL_CTX, 2_000);
    assert.equal(step.kind, "continue");
    if (step.kind !== "continue") return;
    assert.deepEqual(step.handDecision.passedIds, ["p2"]);
  });
});
