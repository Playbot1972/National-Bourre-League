import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { activePlayerOrder, openingLeaderId } from "../game/playerOrder";
import { dealInitialHand } from "../game/deal";
import { advanceAfterDraw } from "../game/draw";
import { serializeHandState } from "../game/serialize";
import { nextDealerId, nextEligibleDealerId } from "./logic";
import { eligibleIdsForAnteCollection } from "../game/money/core";
import { resolveHandDealerId } from "./dealer";
import { HAND_PHASE } from "../game/types";

const SORTED = ["p1", "p2", "p3", "p4"];

describe("dealer flow", () => {
  it("rotates dealer clockwise between hands", () => {
    assert.equal(nextDealerId(SORTED, "p1"), "p2");
    assert.equal(nextDealerId(SORTED, "p4"), "p1");
  });

  it("skips out players when advancing dealer for the next hand", () => {
    const eligible = ["p1", "p3", "p4"];
    assert.equal(nextEligibleDealerId(SORTED, "p1", eligible), "p3");
    assert.equal(nextEligibleDealerId(SORTED, "p2", eligible), "p3");
    assert.equal(nextEligibleDealerId(SORTED, "p4", eligible), "p1");
  });

  it("uses ante eligibility projection after settlement scores", () => {
    const scoreById = {
      p1: { bankroll: 100, out: false },
      p2: { bankroll: 0, out: true },
      p3: { bankroll: 80 },
      p4: { bankroll: 0, out: true },
    };
    const eligible = eligibleIdsForAnteCollection(SORTED, scoreById, 250);
    assert.deepEqual(eligible, ["p1", "p3"]);
    assert.equal(nextEligibleDealerId(SORTED, "p2", eligible), "p3");
    assert.equal(nextEligibleDealerId(SORTED, "p4", eligible), "p1");
  });

  it("keeps per-hand dealer stable while hand is live", () => {
    const sessionDealer = "p2";
    const currentHand = {
      dealerId: "p1",
      phase: HAND_PHASE.PLAY,
      participantIds: SORTED,
    };
    assert.equal(resolveHandDealerId(sessionDealer, currentHand), "p1");
  });

  it("uses session dealer between hands", () => {
    assert.equal(
      resolveHandDealerId("p3", { dealerId: "p1", phase: null, participantIds: [] }),
      "p3",
    );
  });

  it("does not let the dealer open when dealer leads the unrotated roster", () => {
    assert.equal(openingLeaderId("p1", ["p1", "p2", "p3"], ["p1", "p2", "p3"]), "p2");
  });

  it("opens first trick with seat left of dealer, skipping inactive players", () => {
    const dealerId = "p1";
    const participantIds = ["p2", "p3"];
    const deal = dealInitialHand({
      dealerId,
      participantIds,
      sortedPlayerIds: SORTED,
      seed: 7,
    });
    const leftActive = activePlayerOrder(dealerId, participantIds, SORTED)[0];
    assert.equal(deal.turnPlayerId, leftActive);
    assert.equal(deal.dealOrder[0], leftActive);

    const bundle = serializeHandState(deal, {
      dealerId,
      actionOrder: deal.dealOrder,
    });
    const afterDraw = advanceAfterDraw(
      { ...bundle.publicHand, drawCompletedIds: participantIds },
      deal.dealOrder,
      participantIds[participantIds.length - 1]!,
    );
    assert.equal(afterDraw.turnPlayerId, leftActive);
    assert.equal(afterDraw.currentTrick?.plays.length, 0);
    assert.equal(afterDraw.leadSuit, null);
  });

  it("deal does not assign the opening turn to the dealer", () => {
    const deal = dealInitialHand({
      dealerId: "p1",
      participantIds: SORTED,
      sortedPlayerIds: SORTED,
      seed: 1,
    });
    assert.notEqual(deal.turnPlayerId, "p1");
    assert.equal(deal.turnPlayerId, "p2");
  });
});
