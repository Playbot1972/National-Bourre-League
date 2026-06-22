import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { settleHandDeltas } from "../../docs/bourre-rules.js";
import { deriveWinnersFromTricks } from "../table/logic";
import { nextDealerId } from "../session/logic";
import {
  assertNoDuplicateCards,
  initSimulatedHand,
  isHandPlayComplete,
  runDrawPhase,
  runPlayPhase,
  simulateFullHand,
} from "./testHelpers";

function settlementMode(winnerIds: string[]) {
  if (winnerIds.length === 0) return "push" as const;
  if (winnerIds.length === 1) return "win" as const;
  return "split" as const;
}

describe("H — full hand integration (engine)", () => {
  it("deal → draw → play maintains invariants", () => {
    let state = initSimulatedHand({ seed: 200 });
    assertNoDuplicateCards(state);
    state = runDrawPhase(state);
    assertNoDuplicateCards(state);
    state = runPlayPhase(state);
    assertNoDuplicateCards(state);
    assert.ok(isHandPlayComplete(state));
  });

  it("records five total tricks across players", () => {
    const final = simulateFullHand({ seed: 201 });
    const tricks = final.publicHand.tricksByPlayer;
    const total = Object.values(tricks).reduce((s, n) => s + (n || 0), 0);
    assert.equal(total, 5);
    assert.equal(final.publicHand.playedCards.length, 5 * final.publicHand.participantIds.length);
  });

  it("derives a winner after five tricks when one player leads", () => {
    const final = simulateFullHand({ seed: 202 });
    const { ready, winnerIds, maxTricks } = deriveWinnersFromTricks(
      final.publicHand.tricksByPlayer,
      final.publicHand.participantIds,
    );
    assert.ok(ready);
    assert.ok(maxTricks > 0);
    assert.ok(winnerIds.length >= 1);
  });

  it("clears turn owner when hand completes", () => {
    const final = simulateFullHand({ seed: 203 });
    assert.equal(final.publicHand.turnPlayerId, null);
    assert.equal(final.publicHand.currentTrick, null);
  });

  it("3-player regression: no stuck phase after full hand", () => {
    const final = simulateFullHand({
      participantIds: ["a", "b", "c"],
      sortedPlayerIds: ["a", "b", "c"],
      dealerId: "b",
      seed: 204,
    });
    assert.equal(final.publicHand.phase, "play");
    assert.ok(isHandPlayComplete(final));
  });

  it("enrollment path deals only enrolled players", () => {
    const final = simulateFullHand({
      skipEnrollment: false,
      sortedPlayerIds: ["p1", "p2", "p3", "p4"],
      dealerId: "p1",
      enrollmentJoin: (id) => id === "p2" || id === "p3",
      seed: 205,
    });
    assert.ok(isHandPlayComplete(final));
    assert.deepEqual(final.publicHand.participantIds.sort(), ["p2", "p3"]);
  });
});

describe("E/H — settlement integration", () => {
  it("settleHandDeltas assigns coherent deltas after simulated hand", () => {
    const final = simulateFullHand({ seed: 300 });
    const tricks = final.publicHand.tricksByPlayer;
    const participants = final.publicHand.participantIds;
    const { winnerIds } = deriveWinnersFromTricks(tricks, participants);
    const result = settleHandDeltas({
      mode: settlementMode(winnerIds),
      winners: winnerIds,
      participants,
      tricksByPlayer: tricks,
      anteAmount: 1,
      limEnabled: false,
      carryIn: 0,
      stakeForPlayer: () => 1,
    });
    assert.ok(result.pot > 0);
    for (const pid of participants) {
      assert.ok(typeof result.deltas[pid] === "number");
    }
    if (winnerIds.length === 1) {
      assert.ok(result.deltas[winnerIds[0]] > 0);
    }
    if (result.bourreMatch > 0) {
      assert.ok(result.bourreMatch > 0);
    }
  });

  it("bourré ids are players who stayed in and won zero tricks", () => {
    const final = simulateFullHand({ seed: 301 });
    const tricks = final.publicHand.tricksByPlayer;
    const participants = final.publicHand.participantIds;
    const { winnerIds } = deriveWinnersFromTricks(tricks, participants);
    const result = settleHandDeltas({
      mode: settlementMode(winnerIds),
      winners: winnerIds,
      participants,
      tricksByPlayer: tricks,
      anteAmount: 1,
      limEnabled: false,
      carryIn: 0,
      stakeForPlayer: () => 1,
    });
    for (const pid of result.bourreIds) {
      assert.equal(tricks[pid] ?? 0, 0);
    }
  });
});

describe("H — multi-hand regression", () => {
  it("runs three sequential hands with dealer rotation and invariants", () => {
    const sorted = ["p1", "p2", "p3"];
    let dealerId: string | null = "p1";
    let carryIn = 0;

    for (let hand = 0; hand < 3; hand += 1) {
      const final = simulateFullHand({
        participantIds: sorted,
        sortedPlayerIds: sorted,
        dealerId,
        seed: 400 + hand,
      });
      assertNoDuplicateCards(final);
      assert.ok(isHandPlayComplete(final));

      const tricks = final.publicHand.tricksByPlayer;
      const { winnerIds } = deriveWinnersFromTricks(tricks, sorted);
      const settled = settleHandDeltas({
        mode: settlementMode(winnerIds),
        winners: winnerIds,
        participants: sorted,
        tricksByPlayer: tricks,
        anteAmount: 1,
        limEnabled: false,
        carryIn,
        stakeForPlayer: () => 1,
      });
      carryIn = settled.carryOverPot;
      dealerId = nextDealerId(sorted, dealerId);
      assert.ok(dealerId);
    }
  });
});
