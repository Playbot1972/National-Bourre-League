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
      const yMax = total === 7 ? 92 : 56;
      for (const layout of layouts) {
        assert.equal(layout.handLane, "below");
        assert.ok(layout.x >= 8 && layout.x <= 92);
        assert.ok(layout.y >= 8 && layout.y <= yMax);
      }
      const xs = layouts.map((l) => l.x);
      if (opponents >= 3) {
        assert.ok(Math.max(...xs) - Math.min(...xs) >= 20);
      }
      assert.equal(isClockwiseOnScreen(buildSeatLayoutMap(total, { isMobile: true, orientation: "portrait" })), true);
    });
  }
});

describe("7-seat preset", () => {
  it("desktop 7 seats stay clockwise on screen", () => {
    const map = buildSeatLayoutMap(7, { isMobile: false });
    assert.equal(map.length, 7);
    assert.equal(isClockwiseOnScreen(map), true);
    const unique = new Set(map.map((s) => `${s.x.toFixed(1)},${s.y.toFixed(1)}`));
    assert.equal(unique.size, 7);
  });

  it("keeps Bot 4 locked at top-center brown edge", () => {
    const map = buildSeatLayoutMap(7, { isMobile: false });
    const bot4 = map[4]!;
    assert.equal(bot4.region, "top");
    assert.ok(Math.abs(bot4.x - 69.5) < 0.05);
    assert.ok(Math.abs(bot4.y - 11.3) < 0.05);
  });

  it("centers Bot 2 on the left brown mid-rail", () => {
    const map = buildSeatLayoutMap(7, { isMobile: false });
    const bot2 = map[2]!;

    assert.equal(bot2.region, "left");
    assert.ok(bot2.x < 6.1, "Bot 2 moves outward onto left brown edge");
    assert.ok(Math.abs(bot2.y - 40.4) < 0.05, "Bot 2 vertical rail position preserved");
    assert.equal(bot2.handLane, "side");
  });

  it("places kiddie-corner seats at diagonal rails", () => {
    const map = buildSeatLayoutMap(7, { isMobile: false });
    const hero = map[0]!;
    const bot1 = map[1]!;
    const bot3 = map[3]!;
    const bot5 = map[5]!;
    const bot6 = map[6]!;

    assert.ok(bot1.x < 8 && bot1.y > hero.y, "Bot 1 lower-left below hero");
    assert.ok(bot1.x < hero.x, "Bot 1 left of hero");

    assert.ok(bot3.x < 12 && bot3.y < 12, "Bot 3 upper-left kiddie corner");
    assert.ok(bot5.x > 88 && bot5.y < 12, "Bot 5 upper-right kiddie corner");
    assert.equal(bot6.region, "bottom");
    assert.ok(bot6.x > 92 && bot6.y > hero.y, "Bot 6 lower-right below hero");
    assert.ok(bot6.x > hero.x, "Bot 6 right of hero");
  });

  it("keeps inward hand lanes on desktop", () => {
    const map = buildSeatLayoutMap(7, { isMobile: false });
    assert.equal(map[2]?.handLane, "side");
    assert.equal(map[6]?.handLane, "below");
    for (const seat of map) {
      assert.ok(["below", "side"].includes(seat.handLane));
    }
  });
});

describe("8-seat full table", () => {
  it("desktop 8 seats stay clockwise on screen", () => {
    const map = buildSeatLayoutMap(8, { isMobile: false });
    assert.equal(map.length, 8);
    assert.equal(isClockwiseOnScreen(map), true);
    const unique = new Set(map.map((s) => `${s.x.toFixed(1)},${s.y.toFixed(1)}`));
    assert.equal(unique.size, 8);
  });

  it("uses kiddie-corner preset for host + 7 bots", () => {
    const map = buildSeatLayoutMap(8, { isMobile: false });
    const hero = map[0]!;
    const bot1 = map[1]!;
    const bot2 = map[2]!;
    const bot4 = map[4]!;
    const bot7 = map[7]!;

    assert.ok(Math.abs(hero.x - 50) < 0.1 && hero.y >= 95, "hero bottom center on brown rim");
    assert.equal(bot1.region, "bottom");
    assert.ok(bot1.x < 8 && bot1.y > hero.y, "Bot 1 lower-left below hero");
    assert.ok(bot2.x < 6.1, "Bot 2 on left brown mid-rail");
    assert.ok(Math.abs(bot4.x - 50) < 0.1 && bot4.y < 12, "Bot 4 top center");
    assert.equal(bot7.region, "bottom");
    assert.ok(bot7.x > 92 && bot7.y > hero.y, "Bot 7 lower-right below hero");
    assert.ok(bot7.x > hero.x, "Bot 7 right of hero");
  });
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
  it("maps the 4-player ring to bottom/left/top/right", () => {
    assert.equal(regionAtIndex(0, 4), "bottom");
    assert.equal(regionAtIndex(1, 4), "left");
    assert.equal(regionAtIndex(2, 4), "top");
    assert.equal(regionAtIndex(3, 4), "right");
  });
});

describe("dealer-relative seating", () => {
  it("places the seat clockwise from hero on the left (not right)", () => {
    const map = buildSeatLayoutMap(4, { isMobile: false });
    const hero = map[0]!;
    const next = map[1]!;
    assert.ok(next.x < hero.x, "next seat should be left of hero");
    assert.equal(next.region, "left");
  });
});
