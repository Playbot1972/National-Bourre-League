import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { playerOrderFromDealer } from "../../game/playerOrder";
import { orderPlayersForTable, seatRingPlayerIds } from "./seatOrder";
import {
  buildSeatLayoutMap,
  isClockwiseOnScreen,
  regionAtIndex,
  resolveHandLane,
  resolveMobileOpponentLayout,
} from "./seatLayout";
import type { TablePlayer } from "../types";

function botPlayers(count: number, selfIndex = 0): TablePlayer[] {
  return Array.from({ length: count }, (_, i) => ({
    playerId: i === selfIndex ? "human" : `bot_${i}`,
    displayName: i === selfIndex ? "You" : `Bot ${i}`,
    handsWon: 0,
    inHand: true,
    tricksThisHand: 0,
    isSelf: i === selfIndex,
    isDealer: i === 1,
    isWinner: false,
    canToggleInHand: false,
    canEditTricks: false,
  }));
}

const sessionBase = {
  dealerId: "bot_1",
  participantIds: [] as string[],
  handEnrollment: null as null,
};

describe("seatRingPlayerIds", () => {
  it("orders by dealer ring instead of display name", () => {
    const ids = ["human", "bot_1", "bot_2", "bot_3"];
    const ring = seatRingPlayerIds(ids, {
      ...sessionBase,
      dealerId: "bot_1",
      participantIds: ids,
    });
    assert.deepEqual(ring, playerOrderFromDealer("bot_1", ids));
    assert.notDeepEqual(
      ring,
      [...ids].sort((a, b) => a.localeCompare(b)),
    );
  });

  it("prefers enrollment orderedPlayerIds when roster matches", () => {
    const ids = ["human", "bot_1", "bot_2", "bot_3"];
    const ring = seatRingPlayerIds(ids, {
      ...sessionBase,
      dealerId: "bot_1",
      participantIds: ids,
      handEnrollment: {
        orderedPlayerIds: ["bot_2", "bot_3", "human", "bot_1"],
      },
    });
    assert.deepEqual(ring, ["bot_2", "bot_3", "human", "bot_1"]);
  });
});

describe("orderPlayersForTable", () => {
  it("rotates self to index 0 while preserving clockwise ring", () => {
    const players = botPlayers(4, 0);
    const ordered = orderPlayersForTable(players, {
      ...sessionBase,
      dealerId: "bot_1",
      participantIds: players.map((p) => p.playerId),
    }, "human");
    assert.equal(ordered[0]?.playerId, "human");
    assert.deepEqual(
      ordered.map((p) => p.playerId),
      ["human", "bot_1", "bot_2", "bot_3"],
    );
  });

  it("does not sort opponents alphabetically", () => {
    const players: TablePlayer[] = [
      { ...botPlayers(1, 0)[0]!, playerId: "human", displayName: "You" },
      { ...botPlayers(1)[0]!, playerId: "bot_2", displayName: "Bot 2", isDealer: false },
      { ...botPlayers(1)[0]!, playerId: "bot_10", displayName: "Bot 10", isDealer: true },
      { ...botPlayers(1)[0]!, playerId: "bot_1", displayName: "Bot 1", isDealer: false },
    ];
    const ordered = orderPlayersForTable(players, {
      ...sessionBase,
      dealerId: "bot_10",
      participantIds: players.map((p) => p.playerId),
    }, "human");
    assert.deepEqual(
      ordered.map((p) => p.displayName),
      ["You", "Bot 2", "Bot 10", "Bot 1"],
    );
    assert.notDeepEqual(
      ordered.map((p) => p.displayName).slice(1).sort(),
      ordered.map((p) => p.displayName).slice(1),
    );
  });
});

describe("seat layout map — 3 to 6 opponents (4–7 total)", () => {
  for (const total of [4, 5, 6, 7]) {
    it(`desktop ${total} seats stay clockwise on screen`, () => {
      const map = buildSeatLayoutMap(total, { isMobile: false });
      assert.equal(map.length, total);
      assert.equal(map[0]?.region, "bottom");
      assert.equal(isClockwiseOnScreen(map), true);
      const unique = new Set(map.map((s) => `${s.x.toFixed(1)},${s.y.toFixed(1)}`));
      assert.equal(unique.size, total);
    });

    it(`mobile portrait ${total} opponents stay in bounds with below hand lane`, () => {
      const opponents = total - 1;
      const layouts = Array.from({ length: opponents }, (_, i) =>
        resolveMobileOpponentLayout(i, total, "portrait"),
      );
      assert.equal(layouts.length, opponents);
      for (const layout of layouts) {
        assert.equal(layout.handLane, "below");
        assert.ok(layout.x >= 8 && layout.x <= 92);
        assert.ok(layout.y >= 8 && layout.y <= 56);
      }
      const xs = layouts.map((l) => l.x);
      if (opponents >= 3) {
        assert.ok(Math.max(...xs) - Math.min(...xs) >= 20);
      }
      assert.equal(isClockwiseOnScreen(buildSeatLayoutMap(total, { isMobile: true, orientation: "portrait" })), true);
    });
  }
});

describe("resolveHandLane", () => {
  it("defaults mobile opponents to below", () => {
    const lane = resolveHandLane(
      { x: 8, y: 44, region: "left" },
      { isMobile: true, isSelf: false, total: 6 },
    );
    assert.equal(lane, "below");
  });

  it("uses side lane only on far desktop rails with 6+ seats", () => {
    assert.equal(
      resolveHandLane(
        { x: 8, y: 44, region: "left" },
        { isMobile: false, isSelf: false, total: 6 },
      ),
      "side",
    );
    assert.equal(
      resolveHandLane(
        { x: 50, y: 10, region: "top" },
        { isMobile: false, isSelf: false, total: 6 },
      ),
      "below",
    );
  });
});

describe("regionAtIndex", () => {
  it("maps the 4-player ring consistently with seatPosition", () => {
    assert.equal(regionAtIndex(0, 4), "bottom");
    assert.equal(regionAtIndex(1, 4), "right");
    assert.equal(regionAtIndex(2, 4), "left");
    assert.equal(regionAtIndex(3, 4), "top");
  });
});
