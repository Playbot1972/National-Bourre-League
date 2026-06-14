import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { deriveWinnersFromTricks } from "../table/logic";
import {
  assertNoDuplicateCards,
  initSimulatedHand,
  isHandPlayComplete,
  runDrawPhase,
  runPlayPhase,
  simulateFullHand,
} from "./testHelpers";

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
});
