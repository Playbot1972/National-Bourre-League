import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canTriggerSessionPlay,
  waitUntilStable,
  SESSION_PLAY_RETRY_ATTEMPTS,
} from "../docs/play-now-flow.js";

describe("play-now-flow", () => {
  it("waitUntilStable requires consecutive passing ticks", async () => {
    let hits = 0;
    await waitUntilStable(
      () => {
        hits += 1;
        return hits >= 2;
      },
      { stableTicks: 2, intervalMs: 10, timeoutMs: 500, label: "test" },
    );
    assert.ok(hits >= 2);
  });

  it("waitUntilStable resets when predicate flickers", async () => {
    let ticks = 0;
    const promise = waitUntilStable(
      () => {
        ticks += 1;
        return ticks === 2 || ticks === 4;
      },
      { stableTicks: 2, intervalMs: 10, timeoutMs: 200, label: "flicker" },
    );
    await assert.rejects(promise, /flicker timed out/);
  });

  it("canTriggerSessionPlay blocks in-flight and insufficient roster", () => {
    assert.equal(
      canTriggerSessionPlay({
        sessionPlayInFlight: true,
        tablePlayOpen: false,
        sessionObj: { status: "in_progress" },
        readyCount: 4,
      }),
      false,
    );
    assert.equal(
      canTriggerSessionPlay({
        sessionPlayInFlight: false,
        tablePlayOpen: false,
        sessionObj: { status: "in_progress" },
        readyCount: 1,
      }),
      false,
    );
    assert.equal(
      canTriggerSessionPlay({
        sessionPlayInFlight: false,
        tablePlayOpen: false,
        sessionObj: { status: "in_progress" },
        readyCount: 2,
      }),
      true,
    );
  });

  it("exports retry constants for triggerSessionPlay", () => {
    assert.equal(SESSION_PLAY_RETRY_ATTEMPTS, 3);
  });
});
