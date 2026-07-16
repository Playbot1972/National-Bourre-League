import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clearPlayOriginCache,
  enhanceShallowFlyOffset,
  flyOffsetMagnitude,
  flyOffsetToSlot,
  MIN_READABLE_FLY_OFFSET_PX,
  playFlyKey,
  primePlayOrigin,
  readCachedPlayOrigin,
  readPrimedPlayOrigin,
  readSeatPlayOrigin,
  resolvePlayOrigin,
  shallowFlyTravelMs,
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

  it("leaves long fly paths unchanged", () => {
    const offset = { dx: 300, dy: -120 };
    const enhanced = enhanceShallowFlyOffset(offset);
    assert.equal(enhanced.shallowBoosted, false);
    assert.equal(enhanced.dx, offset.dx);
    assert.equal(enhanced.dy, offset.dy);
    assert.equal(enhanced.magnitude, flyOffsetMagnitude(offset));
  });

  it("boosts shallow fly paths along the same direction", () => {
    const offset = { dx: 80, dy: -40 };
    const raw = flyOffsetMagnitude(offset);
    const enhanced = enhanceShallowFlyOffset(offset);
    assert.equal(enhanced.shallowBoosted, true);
    assert.ok(enhanced.magnitude >= MIN_READABLE_FLY_OFFSET_PX - 0.5);
    const angleBefore = Math.atan2(offset.dy, offset.dx);
    const angleAfter = Math.atan2(enhanced.dy, enhanced.dx);
    assert.ok(Math.abs(angleBefore - angleAfter) < 1e-6);
    assert.ok(enhanced.magnitude > raw);
  });

  it("extends travel time only for shallow boosted paths", () => {
    const base = 395;
    assert.equal(shallowFlyTravelMs(base, 200, false), base);
    assert.ok(shallowFlyTravelMs(base, 90, true) > base);
    assert.ok(shallowFlyTravelMs(base, 90, true) <= base + 180);
  });

  it("returns undefined for uncached origins", () => {
    assert.equal(readCachedPlayOrigin("missing:key"), undefined);
  });

  it("reads stable seat play-origin anchors", { skip: typeof document === "undefined" }, () => {
    clearPlayOriginCache();
    const host = document.createElement("div");
    const anchor = document.createElement("span");
    anchor.setAttribute("data-seat-play-origin", "bot-1");
    Object.defineProperty(anchor, "getBoundingClientRect", {
      value: () => ({
        left: 80,
        top: 120,
        width: 34,
        height: 48,
        right: 114,
        bottom: 168,
        x: 80,
        y: 120,
        toJSON: () => ({}),
      }),
    });
    host.appendChild(anchor);
    document.body.appendChild(host);

    const rect = readSeatPlayOrigin("bot-1");
    assert.deepEqual(rect, { left: 80, top: 120, width: 34, height: 48 });

    const primed = primePlayOrigin("bot-1");
    assert.deepEqual(primed, rect);
    assert.deepEqual(readPrimedPlayOrigin("bot-1"), rect);

    const key = playFlyKey({ playerId: "bot-1", card: { rank: "K", suit: "spades" } });
    const snap = snapshotPlayOrigin("bot-1", key);
    assert.deepEqual(snap, rect);
    assert.deepEqual(resolvePlayOrigin("bot-1", key), rect);

    host.remove();
  });

  it("clears primed and cached origins together", () => {
    clearPlayOriginCache();
    assert.equal(readPrimedPlayOrigin("p1"), undefined);
    assert.equal(readCachedPlayOrigin("p1:A:hearts"), undefined);
  });

  it("keeps primed origin until force refresh", { skip: typeof document === "undefined" }, () => {
    clearPlayOriginCache();
    const host = document.createElement("div");
    const anchor = document.createElement("span");
    anchor.setAttribute("data-seat-play-origin", "bot-2");
    Object.defineProperty(anchor, "getBoundingClientRect", {
      value: () => ({
        left: 10,
        top: 20,
        width: 34,
        height: 48,
        right: 44,
        bottom: 68,
        x: 10,
        y: 20,
        toJSON: () => ({}),
      }),
    });
    host.appendChild(anchor);
    document.body.appendChild(host);

    const first = primePlayOrigin("bot-2", { force: true });
    assert.deepEqual(first, { left: 10, top: 20, width: 34, height: 48 });

    Object.defineProperty(anchor, "getBoundingClientRect", {
      value: () => ({
        left: 99,
        top: 99,
        width: 34,
        height: 48,
        right: 133,
        bottom: 147,
        x: 99,
        y: 99,
        toJSON: () => ({}),
      }),
    });

    const second = primePlayOrigin("bot-2");
    assert.deepEqual(second, first);

    const forced = primePlayOrigin("bot-2", { force: true });
    assert.deepEqual(forced, { left: 99, top: 99, width: 34, height: 48 });

    host.remove();
  });
});
