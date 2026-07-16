import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { playerOrderFromDealer } from "../../game/playerOrder";
import { antePostOrder } from "./antePresentationMotion";
import {
  antePresentationFlightMs,
  antePresentationScheduleMs,
  ANTE_CHIP_STAGGER_MS,
  ANTE_CHIP_TRAVEL_MS,
  ANTE_POST_HOLD_MS,
} from "../handPresentationTiming";
import {
  createHandPresentationStore,
  phaseScheduleMs,
  reduceHandPresentation,
} from "../handPresentationMachine";

describe("antePresentationMotion", () => {
  it("posts clockwise with dealer last", () => {
    const ring = ["p1", "p2", "p3", "p4", "p5", "p6"];
    const order = antePostOrder("p3", ring, ring);
    assert.deepEqual(order, playerOrderFromDealer("p3", ring));
    assert.equal(order[order.length - 1], "p3");
    assert.equal(order[0], "p4");
  });

  it("targets ~600–900ms flight for six seats", () => {
    const flight = antePresentationFlightMs(6, false);
    assert.ok(flight >= 600 && flight <= 900, `expected 600–900ms, got ${flight}ms`);
    assert.equal(flight, 5 * ANTE_CHIP_STAGGER_MS + ANTE_CHIP_TRAVEL_MS);
  });

  it("includes a post-ante hold in the full schedule", () => {
    const schedule = antePresentationScheduleMs(6, false);
    assert.equal(schedule, antePresentationFlightMs(6, false) + ANTE_POST_HOLD_MS);
    assert.ok(ANTE_POST_HOLD_MS >= 200 && ANTE_POST_HOLD_MS <= 300);
  });
});

describe("handPresentationMachine ante gate", () => {
  const snap = {
    sessionKey: "s1",
    handNumber: 2,
    phase: "reveal",
    enrollmentActive: false,
    participantIds: ["p1", "p2", "p3", "p4"],
    actionOrder: ["p2", "p3", "p4", "p1"],
    drawCompletedIds: [] as string[],
    turnPlayerId: "p2",
    trumpUpcard: { rank: "A", suit: "hearts" },
    dealerId: "p1",
    handComplete: false,
    potAmount: 20,
    carryOverPot: 0,
    enrolledIds: [] as string[],
    declinedIds: [] as string[],
  };

  it("does not auto-advance ante on player-count timer", () => {
    let store = createHandPresentationStore(snap);
    assert.equal(phaseScheduleMs(store, false), 0);
    assert.equal(store.antePotRevealed, false);
  });

  it("reveals pot and clears ante animation after sequence completion", () => {
    let store = createHandPresentationStore(snap);
    store = reduceHandPresentation(store, { type: "anteCoinLanded", playerId: "p2" });
    assert.equal(store.antePotRevealed, false);
    assert.deepEqual(store.anteLandedPlayerIds, ["p2"]);

    store = reduceHandPresentation(store, { type: "anteSequenceComplete" });
    assert.equal(store.antePotRevealed, true);
    assert.equal(store.anteAnimActive, false);
  });
});
