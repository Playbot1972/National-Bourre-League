import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  deriveWinnersFromTricks,
  formatSeatDisplayName,
  isHandComplete,
  isPlayerAtBourreRisk,
  playersAtBourreRisk,
  seatPosition,
  tableAspectForPlayers,
  totalTricksPlayed,
  tricksToWinHint,
  displayLiveBankroll,
} from "./logic";
import { mobileSelfSeatPosition } from "./layout/mobileSeatMap";

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

  it("max co-win tie is 2 tricks with three players (2+2+1=5)", () => {
    const { winnerIds, maxTricks } = deriveWinnersFromTricks(
      { p1: 2, p2: 2, p3: 1 },
      ["p1", "p2", "p3"],
    );
    assert.equal(maxTricks, 2);
    assert.deepEqual(winnerIds.sort(), ["p1", "p2"]);
    assert.equal(totalTricksPlayed({ p1: 2, p2: 2, p3: 1 }, ["p1", "p2", "p3"]), 5);
  });

  it("tricksToWinHint scales with player count", () => {
    assert.equal(tricksToWinHint(2), 3);
    assert.equal(tricksToWinHint(3), 2);
    assert.equal(tricksToWinHint(4), 2);
  });
});

describe("bourré pressure — final trick risk", () => {
  const participants = ["p1", "p2", "p3"];

  it("flags only zero-trick players on the final trick during play", () => {
    const tricks = { p1: 2, p2: 2, p3: 0 };
    assert.deepEqual(playersAtBourreRisk(tricks, participants, "play"), ["p3"]);
    assert.equal(isPlayerAtBourreRisk("p3", tricks, participants, "play"), true);
    assert.equal(isPlayerAtBourreRisk("p1", tricks, participants, "play"), false);
  });

  it("does not warn before the final trick", () => {
    const tricks = { p1: 1, p2: 1, p3: 0 };
    assert.deepEqual(playersAtBourreRisk(tricks, participants, "play"), []);
  });

  it("does not warn outside play phase", () => {
    const tricks = { p1: 2, p2: 2, p3: 0 };
    assert.deepEqual(playersAtBourreRisk(tricks, participants, "draw"), []);
    assert.deepEqual(playersAtBourreRisk(tricks, participants, null), []);
  });

  it("allows multiple at-risk players when tied at zero tricks", () => {
    const four = ["p1", "p2", "p3", "p4"];
    const tricks = { p1: 2, p2: 2, p3: 0, p4: 0 };
    assert.deepEqual(playersAtBourreRisk(tricks, four, "play").sort(), ["p3", "p4"]);
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

  it("uses taller felt for 3–4 players than larger tables", () => {
    assert.ok(tableAspectForPlayers(3) < tableAspectForPlayers(6));
    assert.ok(tableAspectForPlayers(4) < tableAspectForPlayers(8));
    assert.ok(tableAspectForPlayers(3) <= tableAspectForPlayers(4));
  });

  it("allocates distinct rail radii per player count", () => {
    const two = seatPosition(0, 2);
    const eight = seatPosition(0, 8);
    assert.ok(Math.abs(two.x - 50) > Math.abs(eight.x - 50) - 2);
  });
});

describe("mobileSelfSeatPosition", () => {
  it("keeps the local seat inside the mobile felt", () => {
    const pos = mobileSelfSeatPosition(4);
    assert.equal(pos.region, "bottom");
    assert.ok(pos.y <= 88);
    assert.ok(pos.y >= 70);
  });
});

describe("displayLiveBankroll", () => {
  it("does not subtract ante when server already posted it", () => {
    assert.equal(
      displayLiveBankroll(8, 2, {
        inHand: true,
        anteAnimActive: true,
        anteAlreadyPosted: true,
      }),
      8,
    );
  });

  it("previews ante during animation before postedAntes land", () => {
    assert.equal(
      displayLiveBankroll(10, 2, {
        inHand: true,
        anteAnimActive: true,
        anteAlreadyPosted: false,
      }),
      8,
    );
  });
});

describe("formatSeatDisplayName", () => {
  it("strips trailing bot suffix", () => {
    assert.equal(formatSeatDisplayName("Owen bot"), "Owen");
    assert.equal(formatSeatDisplayName("Owen Bot"), "Owen");
  });

  it("strips leading bot prefix", () => {
    assert.equal(formatSeatDisplayName("bot Owen"), "Owen");
    assert.equal(formatSeatDisplayName("Bot Owen"), "Owen");
  });

  it("keeps ordinary display names", () => {
    assert.equal(formatSeatDisplayName("Owen"), "Owen");
    assert.equal(formatSeatDisplayName("  Alex  "), "Alex");
  });

  it("falls back when empty", () => {
    assert.equal(formatSeatDisplayName(""), "?");
    assert.equal(formatSeatDisplayName("   "), "?");
  });
});
