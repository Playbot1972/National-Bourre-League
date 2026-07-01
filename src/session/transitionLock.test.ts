import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTransitionLock } from "./transitionLock";

describe("createTransitionLock", () => {
  it("clears lock after fn completes", async () => {
    const lock = createTransitionLock();
    await lock.runLockedTransition("DRAW_RESOLVE", async () => {
      assert.equal(lock.current, "DRAW_RESOLVE");
    });
    assert.equal(lock.current, null);
  });

  it("skips when another transition is in flight", async () => {
    const lock = createTransitionLock();
    let blocked = false;
    await lock.runLockedTransition("HAND_END", async () => {
      const result = await lock.runLockedTransition("ROUND_ADVANCE", async () => {
        blocked = true;
      });
      assert.equal(result, undefined);
    });
    assert.equal(blocked, false);
  });
});
