import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mobileOpponentSeatPosition, mobileSelfSeatPosition, mobileTableAspect, buildSevenPlayerMobileSeatMap } from "./mobileSeatMap";
import { resolveMobileOpponentLayout } from "./seatLayout";

describe("mobile seat map", () => {
  it("uses squarer aspect in portrait than landscape", () => {
    const portrait = mobileTableAspect(3, "portrait");
    const landscape = mobileTableAspect(3, "landscape");
    assert.ok(portrait < landscape);
    assert.ok(portrait >= 0.78 && portrait <= 1);
    assert.ok(landscape >= 0.95 && landscape <= 1.35);
  });

  it("places opponents at distinct positions", () => {
    const total = 4;
    const positions = [0, 1, 2].map((i) =>
      mobileOpponentSeatPosition(i, total - 1, "portrait"),
    );
    const unique = new Set(positions.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`));
    assert.equal(unique.size, 3);
    for (const pos of positions) {
      assert.ok(pos.y <= 56, "portrait opponents stay on upper felt");
      assert.ok(pos.x >= 8 && pos.x <= 92, "portrait opponents stay in horizontal bounds");
    }
  });

  it("uses the same clockwise ring as desktop seatPosition for non-preset tables", () => {
    const mobile = resolveMobileOpponentLayout(0, 4, "portrait");
    const desktop = mobileOpponentSeatPosition(0, 3, "portrait");
    assert.equal(mobile.region, desktop.region);
  });

  it("7-player portrait uses explicit bottom corners below hero", () => {
    const map = buildSevenPlayerMobileSeatMap("portrait");
    const hero = map[0]!;
    const bot1 = map[1]!;
    const bot6 = map[6]!;
    assert.ok(bot1.y >= hero.y);
    assert.ok(bot6.y >= hero.y);
    assert.ok(bot1.y > 85);
    assert.ok(bot6.y > 85);
  });

  it("keeps local seat inside the mobile felt", () => {
    const pos = mobileSelfSeatPosition(4);
    assert.equal(pos.region, "bottom");
    assert.ok(pos.y <= 88);
    assert.ok(pos.y >= 70);
  });

  it("spreads many opponents without bunching at center", () => {
    const positions = Array.from({ length: 7 }, (_, i) =>
      mobileOpponentSeatPosition(i, 7, "landscape"),
    );
    const xs = positions.map((p) => p.x);
    assert.ok(Math.max(...xs) - Math.min(...xs) >= 50);
  });
});
