import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  deriveWinnersFromTricks,
  isHandComplete,
  seatPosition,
  tableAspectForPlayers,
  totalTricksPlayed,
  tricksToWinHint,
} from "./logic";

describe("table logic — tricks and winners", () => {
  it("totalTricksPlayed sums participant tricks", () => {
    assert.equal(totalTricksPlayed({ p1: 2, p2: 3, p3: 0 }, ["p1", "p2", "p3"]), 5);
  });

  it("isHandComplete at five tricks", () => {
    assert.equal(isHandComplete({ p1: 3, p2: 2 }, ["p1", "p2"]), true);
    assert.equal(isHandComplete({ p1: 2, p2: 1 }, ["p1", "p2"]), false);
  });

  it("deriveWinnersFromTricks finds top trick count", () => {
    const { ready, winnerIds, maxTricks } = deriveWinnersFromTricks(
      { p1: 3, p2: 2, p3: 3 },
      ["p1", "p2", "p3"],
    );
    assert.equal(ready, true);
    assert.equal(maxTricks, 3);
    assert.deepEqual(winnerIds.sort(), ["p1", "p3"]);
  });

  it("tricksToWinHint scales with player count", () => {
    assert.equal(tricksToWinHint(2), 3);
    assert.equal(tricksToWinHint(3), 2);
    assert.equal(tricksToWinHint(4), 2);
  });
});

describe("G — seat layout helpers", () => {
  it("places three seats at distinct positions", () => {
    const positions = [0, 1, 2].map((i) => seatPosition(i, 3));
    assert.equal(positions.length, 3);
    const unique = new Set(positions.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`));
    assert.equal(unique.size, 3);
    for (const pos of positions) {
      assert.ok(["bottom", "top", "left", "right"].includes(pos.region));
    }
  });

  it("widens table aspect for more players", () => {
    assert.ok(tableAspectForPlayers(8) > tableAspectForPlayers(3));
    assert.ok(tableAspectForPlayers(3) >= tableAspectForPlayers(2));
  });
});
