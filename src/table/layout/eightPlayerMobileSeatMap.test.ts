import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildEightPlayerMobileSeatMap,
  eightPlayerMobileAnchor,
} from "./eightPlayerMobileSeatMap";
import {
  DESKTOP_SEVEN_BOT_SEAT_MAP,
  DESKTOP_SIX_BOT_SEAT_MAP,
  SHARED_DESKTOP_ANCHORS,
  SHARED_MOBILE_ANCHORS,
  placementMatches,
} from "./seatPresetAnchors";
import { isClockwiseOnScreen } from "./seatLayout";

describe("eightPlayerMobileSeatMap", () => {
  it("portrait preset stays clockwise with unique anchors", () => {
    const map = buildEightPlayerMobileSeatMap("portrait");
    assert.equal(map.length, 8);
    assert.equal(isClockwiseOnScreen(map), true);
    const unique = new Set(map.map((s) => `${s.x},${s.y}`));
    assert.equal(unique.size, 8);
  });

  it("reuses 6-bot Bot 1 and Bot 6 anchors for Bot 1 and Bot 7", () => {
    const map = buildEightPlayerMobileSeatMap("portrait");
    assert.ok(
      placementMatches(map[1]!, SHARED_MOBILE_ANCHORS.sixBotBottomLeftPortrait),
      "Bot 1 matches 6-bot bottom-left",
    );
    assert.ok(
      placementMatches(map[7]!, SHARED_MOBILE_ANCHORS.sixBotBottomRightPortrait),
      "Bot 7 matches 6-bot bottom-right",
    );
  });

  it("places hero on the bottom rail with corner bots", () => {
    const hero = eightPlayerMobileAnchor(0, "portrait")!;
    const bot1 = eightPlayerMobileAnchor(1, "portrait")!;
    const bot7 = eightPlayerMobileAnchor(7, "portrait")!;
    assert.equal(hero.x, 50);
    assert.equal(hero.y, bot1.y);
    assert.equal(hero.y, bot7.y);
    assert.ok(hero.y > 88, "hero sits lower than the 6-bot hero rail");
  });

  it("centers Bot 4 on the top rail", () => {
    const bot4 = eightPlayerMobileAnchor(4, "portrait")!;
    assert.equal(bot4.x, 50);
    assert.equal(bot4.region, "top");
    assert.ok(bot4.y < 12);
  });

  it("keeps anchors inside horizontal bounds", () => {
    for (const orientation of ["portrait", "landscape"] as const) {
      const map = buildEightPlayerMobileSeatMap(orientation);
      for (const seat of map) {
        assert.ok(seat.x >= 8 && seat.x <= 92);
        assert.ok(seat.y >= 8 && seat.y <= 92);
      }
    }
  });
});

describe("desktop preset anchor reuse", () => {
  it("7-bot Bot 1 and Bot 7 match 6-bot bottom corners exactly", () => {
    assert.deepEqual(DESKTOP_SEVEN_BOT_SEAT_MAP[1], DESKTOP_SIX_BOT_SEAT_MAP[1]);
    assert.deepEqual(DESKTOP_SEVEN_BOT_SEAT_MAP[7], DESKTOP_SIX_BOT_SEAT_MAP[6]);
    assert.deepEqual(DESKTOP_SIX_BOT_SEAT_MAP[1], SHARED_DESKTOP_ANCHORS.sixBotBottomLeft);
    assert.deepEqual(DESKTOP_SIX_BOT_SEAT_MAP[6], SHARED_DESKTOP_ANCHORS.sixBotBottomRight);
  });
});
