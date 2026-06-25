/**
 * Pagat-style rule compliance — play order and opening lead (canonical engine).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dealInitialHand } from "./deal";
import { buildHandEnrollment, currentEnrollmentPlayer, runEnrollmentPhase } from "./enrollment";
import {
  activateHandDecision,
  applyDecisionPass,
  applyDecisionPlay,
  buildHandDecision,
  currentDecisionPlayer,
} from "./decision";
import { advanceAfterDraw } from "./draw";
import { applyPlayCard } from "./play";
import { effectivePlayerHand } from "./invariants";
import { activePlayerOrder, openingLeaderId, playerOrderFromDealer } from "./playerOrder";
import { serializePagatRevealHand } from "./serialize";
import { nextDealerId } from "../session/logic";
import { dealForTest, publicHandFromDeal } from "./testHelpers";
import { HAND_PHASE } from "./types";

const ROSTER = ["p1", "p2", "p3", "p4"];
const DEALER = "p1";

describe("Pagat play order compliance", () => {
  it("1 — deal order starts left of dealer clockwise", () => {
    const deal = dealInitialHand({
      dealerId: DEALER,
      participantIds: ROSTER,
      sortedPlayerIds: ROSTER,
      seed: 1,
    });
    assert.equal(deal.dealOrder[0], "p2");
    assert.deepEqual(deal.dealOrder, playerOrderFromDealer(DEALER, ROSTER));
  });

  it("2 — enrollment play/pass order starts left of dealer clockwise", () => {
    const enrollment = buildHandEnrollment(ROSTER, DEALER, 1_000);
    assert.equal(currentEnrollmentPlayer(enrollment), "p2");
    assert.deepEqual(enrollment.orderedPlayerIds, ["p2", "p3", "p4", "p1"]);
  });

  it("2b — Pagat decision order starts left of dealer clockwise", () => {
    const decision = buildHandDecision(ROSTER, DEALER, true, 1_000);
    assert.equal(currentDecisionPlayer(decision), "p2");
    assert.deepEqual(decision.orderedPlayerIds, ["p2", "p3", "p4", "p1"]);
  });

  it("3 — opening lead is left of dealer or next active clockwise", () => {
    const roster = ROSTER;
    const playing = ["p3", "p4", "p1"];
    assert.equal(openingLeaderId(DEALER, playing, roster), "p3");

    const deal = dealInitialHand({
      dealerId: DEALER,
      participantIds: playing,
      sortedPlayerIds: roster,
      seed: 2,
    });
    assert.equal(deal.turnPlayerId, "p3");
  });

  it("4 — trick winner leads the next trick", () => {
    const deal = dealForTest({ participantIds: ["p1", "p2"], seed: 5 });
    let pub = {
      ...publicHandFromDeal(deal, "p1"),
      phase: HAND_PHASE.PLAY,
      turnPlayerId: deal.dealOrder[0],
      currentTrick: {
        trickNumber: 1,
        leadPlayerId: deal.dealOrder[0],
        leadSuit: null,
        plays: [],
      },
    };
    const order = deal.dealOrder;
    let hands = { ...deal.privateHands };
    for (const pid of order) {
      const effective = effectivePlayerHand(pid, hands[pid], pub);
      const result = applyPlayCard({
        publicHand: pub,
        playerHand: effective,
        playerId: pid,
        cardIndex: 0,
        actionOrder: order,
      });
      pub = result.publicHand;
      hands[pid] = result.playerHand;
    }
    const prevWinner = Object.entries(pub.tricksByPlayer).find(([, n]) => (n ?? 0) > 0)?.[0];
    assert.equal(pub.turnPlayerId, prevWinner);
    assert.equal(pub.currentTrick?.leadPlayerId, prevWinner);
  });

  it("5 — dealer rotates clockwise between hands", () => {
    assert.equal(nextDealerId(ROSTER, "p1"), "p2");
    assert.equal(nextDealerId(ROSTER, "p4"), "p1");
  });

  it("6 — passed players are not opening leader when next active should lead", () => {
    const deal = dealInitialHand({
      dealerId: DEALER,
      participantIds: ROSTER,
      sortedPlayerIds: ROSTER,
      seed: 3,
    });
    const bundle = serializePagatRevealHand(deal, {
      dealerId: DEALER,
      actionOrder: deal.dealOrder,
      seatedIds: ROSTER,
    });
    let hand = activateHandDecision(bundle.publicHand, 1_000);
    let decision = hand.handDecision!;
    const ctx = { dealerId: DEALER, sortedPlayerIds: ROSTER, dealingRule: null };

    let step = applyDecisionPass(hand as never, decision, "p2", ctx, 2_000);
    decision = step.handDecision!;
    hand = step.publicHand;
    step = applyDecisionPlay(hand as never, decision, "p3", 0, ctx, 3_000);
    decision = step.handDecision!;
    hand = step.publicHand;
    step = applyDecisionPlay(hand as never, decision, "p4", 0, ctx, 4_000);
    decision = step.handDecision!;
    hand = step.publicHand;
    step = applyDecisionPlay(hand as never, decision, "p1", 0, ctx, 5_000);

    assert.equal(step.kind, "draw");
    if (step.kind !== "draw") return;
    const playing = step.publicHand.participantIds;
    assert.ok(!playing.includes("p2"));
    const leftActive = activePlayerOrder(DEALER, playing, ROSTER)[0];
    assert.equal(leftActive, "p3");

    const afterDraw = advanceAfterDraw(
      { ...step.publicHand, drawCompletedIds: playing },
      step.publicHand.actionOrder ?? [],
      playing[playing.length - 1]!,
    );
    assert.equal(afterDraw.turnPlayerId, "p3");
    assert.equal(afterDraw.currentTrick?.leadPlayerId, "p3");
  });

  it("6b — solo win when only one player stays in during enrollment", () => {
    const result = runEnrollmentPhase(ROSTER, DEALER, (id) => id === "p3", { seed: 1 }, 1_000);
    assert.equal(result.kind, "soloWin");
    if (result.kind !== "soloWin") return;
    assert.equal(result.winnerId, "p3");
  });
});
