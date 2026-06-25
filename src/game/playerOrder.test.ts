import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activePlayerOrder,
  openingLeaderId,
  resolveActionOrder,
  resolveSeatRing,
  nextActivePlayerClockwise,
} from "./playerOrder";
import { advanceAfterDraw } from "./draw";
import { HAND_PHASE } from "./types";

const SORTED = ["host", "bot_a", "bot_b"];

describe("resolveActionOrder", () => {
  it("does not use join-order participantIds when actionOrder is missing", () => {
    const hand = {
      dealerId: "host",
      participantIds: ["host", "bot_a", "bot_b"],
      seatedIds: SORTED,
    };
    const order = resolveActionOrder(hand);
    assert.deepEqual(order, ["bot_a", "bot_b", "host"]);
    assert.notEqual(order[0], "host");
  });

  it("opens trick play left of dealer when actionOrder was stripped", () => {
    const dealerId = "host";
    const participantIds = ["host", "bot_a", "bot_b"];
    const leftActive = activePlayerOrder(dealerId, participantIds, SORTED)[0];
    const publicHand = {
      phase: HAND_PHASE.DRAW,
      participantIds,
      seatedIds: SORTED,
      dealerId,
      drawCompletedIds: participantIds,
      tricksByPlayer: Object.fromEntries(participantIds.map((id) => [id, 0])),
    };
    const afterDraw = advanceAfterDraw(
      publicHand as never,
      resolveActionOrder(publicHand as never),
      "bot_b",
    );
    assert.equal(afterDraw.phase, HAND_PHASE.PLAY);
    assert.equal(afterDraw.turnPlayerId, leftActive);
    assert.notEqual(afterDraw.turnPlayerId, dealerId);
    assert.equal(afterDraw.currentTrick?.leadPlayerId, leftActive);
  });

  it("resolveSeatRing prefers seatedIds over participant join order", () => {
    const ring = resolveSeatRing({
      participantIds: ["host", "bot_a"],
      seatedIds: SORTED,
    });
    assert.deepEqual(ring, SORTED);
    assert.equal(openingLeaderId("host", ["host", "bot_a"], ring), "bot_a");
  });

  it("resolveActionOrder ignores join-order actionOrder when seatedIds are present", () => {
    const hand = {
      dealerId: "host",
      participantIds: ["host", "bot_a", "bot_b"],
      seatedIds: SORTED,
      actionOrder: ["host", "bot_a", "bot_b"],
    };
    assert.deepEqual(resolveActionOrder(hand), ["bot_a", "bot_b", "host"]);
  });

  it("resolveSeatRing does not treat dealer-relative actionOrder as roster ring", () => {
    const ring = resolveSeatRing({
      participantIds: ["host", "bot_a", "bot_b"],
      actionOrder: ["bot_a", "bot_b", "host"],
    } as never);
    assert.deepEqual(ring, ["host", "bot_a", "bot_b"]);
  });

  it("resolveActionOrder dealer-normalizes when only join-order participantIds exist", () => {
    const hand = {
      dealerId: "host",
      participantIds: ["host", "bot_a", "bot_b"],
    };
    assert.deepEqual(resolveActionOrder(hand), ["bot_a", "bot_b", "host"]);
  });

  it("openingLeaderId skips passed seat left of dealer", () => {
    const roster = ["p1", "p2", "p3", "p4"];
    const playing = ["p3", "p4", "p1"];
    assert.equal(openingLeaderId("p1", playing, roster), "p3");
  });

  it("resolveActionOrder recovers when seatedIds mismatch active participants", () => {
    const hand = {
      dealerId: "host",
      participantIds: ["host", "bot_a", "bot_b"],
      seatedIds: ["host", "bot_a", "bot_b"],
      actionOrder: ["host", "bot_a", "bot_b"],
    };
    assert.deepEqual(resolveActionOrder(hand), ["bot_a", "bot_b", "host"]);
  });

  it("nextActivePlayerClockwise wraps within the action ring", () => {
    const order = ["bot_a", "bot_b", "host"];
    assert.equal(nextActivePlayerClockwise(order, "host"), "bot_a");
    assert.equal(nextActivePlayerClockwise(order, "bot_a"), "bot_b");
  });
});
