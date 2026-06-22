import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildSevenPlayerMobileSeatMap,
  sevenPlayerMobileAnchor,
  SEVEN_PLAYER_MOBILE_LOCKED_SEATS,
} from "./sevenPlayerMobileSeatMap";
import { SHARED_MOBILE_ANCHORS, placementMatches } from "./seatPresetAnchors";
import { isClockwiseOnScreen } from "./seatLayout";

const LOCKED_BEFORE = SEVEN_PLAYER_MOBILE_LOCKED_SEATS;

describe("sevenPlayerMobileSeatMap", () => {
  it("portrait preset stays clockwise with unique anchors", () => {
    const map = buildSevenPlayerMobileSeatMap("portrait");
    assert.equal(map.length, 7);
    assert.equal(isClockwiseOnScreen(map), true);
    const unique = new Set(map.map((s) => `${s.x},${s.y}`));
    assert.equal(unique.size, 7);
  });

  it("locks bottom corners and left mid-rail", () => {
    const map = buildSevenPlayerMobileSeatMap("portrait");
    for (const [idx, want] of Object.entries(LOCKED_BEFORE)) {
      const seat = map[Number(idx)]!;
      assert.equal(seat.region, want.region);
      assert.ok(Math.abs(seat.x - want.x) < 0.05);
      assert.ok(Math.abs(seat.y - want.y) < 0.05);
    }
  });

  it("mirrors top corners to bottom corners for Bot 1 and Bot 6", () => {
    const map = buildSevenPlayerMobileSeatMap("portrait");
    const bot1 = map[1]!;
    const bot3 = map[3]!;
    const bot5 = map[5]!;
    const bot6 = map[6]!;
    const hero = map[0]!;

    assert.equal(bot3.x, bot1.x, "Bot 1 x mirrors Bot 3");
    assert.equal(bot5.x, bot6.x, "Bot 6 x mirrors Bot 5");
    assert.ok(bot1.y > 85 && bot3.y < 12, "Bot 1 bottom mirrors Bot 3 top");
    assert.ok(bot6.y > 85 && bot5.y < 12, "Bot 6 bottom mirrors Bot 5 top");
    assert.ok(bot1.y > hero.y, "Bot 1 below hero");
    assert.ok(bot6.y > hero.y, "Bot 6 below hero");
  });

  it("centers Bot 4 on the top rail at x=50", () => {
    const bot4 = sevenPlayerMobileAnchor(4, "portrait")!;
    assert.equal(bot4.x, 50);
    assert.equal(bot4.region, "top");
    assert.ok(
      placementMatches(bot4, SHARED_MOBILE_ANCHORS.sixBotTopCenterPortrait),
      "Bot 4 uses shared top-rail center anchor",
    );
  });

  it("centers hero on bottom rail at x=50", () => {
    const hero = sevenPlayerMobileAnchor(0, "portrait")!;
    assert.equal(hero.x, 50);
    assert.equal(hero.region, "bottom");
    assert.ok(hero.y > 85);
  });

  it("keeps anchors inside horizontal bounds", () => {
    for (const orientation of ["portrait", "landscape"] as const) {
      const map = buildSevenPlayerMobileSeatMap(orientation);
      for (const seat of map) {
        assert.ok(seat.x >= 8 && seat.x <= 92);
        assert.ok(seat.y >= 8 && seat.y <= 92);
      }
    }
  });
});
