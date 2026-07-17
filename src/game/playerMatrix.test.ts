import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { deriveWinnersFromTricks } from "../table/logic";
import {
  assertNoDuplicateCards,
  isHandPlayComplete,
  simulateFullHand,
} from "./testHelpers";

function playerIds(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `p${i + 1}`);
}

describe("I — player matrix (2–8 seats, bots + humans)", () => {
  for (let count = 2; count <= 8; count += 1) {
    const ids = playerIds(count);

    it(`${count}-player all-in hand completes with 5 tricks`, () => {
      const final = simulateFullHand({
        participantIds: ids,
        sortedPlayerIds: ids,
        dealerId: ids[0],
        seed: 1000 + count,
      });
      assert.ok(isHandPlayComplete(final));
      const total = Object.values(final.publicHand.tricksByPlayer).reduce((s, n) => s + (n || 0), 0);
      assert.equal(total, 5);
      assertNoDuplicateCards(final);
    });

    if (count >= 3) {
      it(`${count}-player enrollment with sit-outs deals and finishes`, () => {
        const sitOutCount = Math.max(1, count - 5);
        const sitOut = new Set(ids.slice(count - sitOutCount));
        const final = simulateFullHand({
          skipEnrollment: false,
          sortedPlayerIds: ids,
          dealerId: ids[0],
          seed: 2000 + count,
          enrollmentJoin: (id) => !sitOut.has(id),
        });
        assert.ok(isHandPlayComplete(final));
        assert.ok(final.publicHand.participantIds.length >= 2);
        assert.ok(final.publicHand.participantIds.length <= count - sitOutCount);
        const { ready } = deriveWinnersFromTricks(
          final.publicHand.tricksByPlayer,
          final.publicHand.participantIds,
        );
        assert.equal(ready, true);
      });
    }
  }

  it("8-seat table with 5 enrolled (3 sat out) — full hand across seeds", () => {
    const ids = playerIds(8);
    const sitOut = new Set(["p6", "p7", "p8"]);
    for (const seed of [1, 7, 42, 99, 256]) {
      const final = simulateFullHand({
        skipEnrollment: false,
        sortedPlayerIds: ids,
        dealerId: ids[0],
        seed,
        enrollmentJoin: (id) => !sitOut.has(id),
      });
      assert.ok(isHandPlayComplete(final));
      assert.equal(final.publicHand.participantIds.length, 5);
    }
  });
});
