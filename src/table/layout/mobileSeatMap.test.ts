import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mobileOpponentSeatPosition, mobileTableAspect } from "./mobileSeatMap";

describe("mobile seat map", () => {
  it("uses squarer aspect in portrait than landscape", () => {
    const portrait = mobileTableAspect(3, "portrait");
    const landscape = mobileTableAspect(3, "landscape");
    assert.ok(portrait < landscape);
    assert.ok(portrait >= 0.8 && portrait <= 1);
    assert.ok(landscape >= 1 && landscape <= 1.35);
  });

  it("places opponents at distinct positions", () => {
    const positions = [0, 1, 2].map((i) => mobileOpponentSeatPosition(i, 3, "portrait"));
    const unique = new Set(positions.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`));
    assert.equal(unique.size, 3);
    for (const pos of positions) {
      assert.ok(pos.y < 55, "portrait opponents sit on upper felt");
    }
  });

  it("spreads many opponents without bunching at center", () => {
    const positions = Array.from({ length: 7 }, (_, i) =>
      mobileOpponentSeatPosition(i, 7, "landscape"),
    );
    const xs = positions.map((p) => p.x);
    assert.ok(Math.max(...xs) - Math.min(...xs) >= 50);
  });
});
