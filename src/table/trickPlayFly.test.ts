import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  flyOffsetToSlot,
  playFlyKey,
  readCachedPlayOrigin,
  snapshotPlayOrigin,
} from "./trickPlayFly";

describe("trickPlayFly", () => {
  it("builds stable fly keys per play", () => {
    assert.equal(
      playFlyKey({ playerId: "p1", card: { rank: "A", suit: "hearts" } }),
      "p1:A:hearts",
    );
  });

  it("computes offset from origin center to trick slot card center", () => {
    const offset = flyOffsetToSlot(
      { left: 100, top: 200, width: 40, height: 60 },
      { left: 300, top: 400, width: 80, height: 100 } as DOMRect,
      { left: 320, top: 420, width: 52, height: 74 } as DOMRect,
    );
    assert.equal(offset.dx, 100 + 20 - (320 + 26));
    assert.equal(offset.dy, 200 + 30 - (420 + 37));
  });

  it("returns undefined for uncached origins", () => {
    assert.equal(readCachedPlayOrigin("missing:key"), undefined);
  });
});
