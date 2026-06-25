import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { wonTrickBookKey, wonTrickPilePlacement } from "./wonTrickPileModel";

describe("wonTrickPileModel", () => {
  it("produces stable placement for the same trick book", () => {
    const a = wonTrickPilePlacement("p1:h2:t3", 2);
    const b = wonTrickPilePlacement("p1:h2:t3", 2);
    assert.deepEqual(a, b);
    assert.ok(a.scale > 0.8 && a.scale <= 1);
    assert.ok(Math.abs(a.rotation) <= 12);
  });

  it("offsets later books in the stack", () => {
    const first = wonTrickPilePlacement("key", 0);
    const third = wonTrickPilePlacement("key", 2);
    assert.notEqual(first.offsetX, third.offsetX);
    assert.ok(third.offsetY < first.offsetY);
  });

  it("builds deterministic book keys", () => {
    assert.equal(
      wonTrickBookKey({ playerId: "u1", handNumber: 4, trickNumber: 2 }),
      "u1:h4:t2",
    );
  });
});
