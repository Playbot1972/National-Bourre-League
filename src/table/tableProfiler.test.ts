import assert from "node:assert/strict";
import test from "node:test";
import { onRenderProfile } from "./tableProfiler";

test("onRenderProfile logs when actualDuration exceeds 8ms", () => {
  const lines: unknown[] = [];
  const original = console.log;
  console.log = (...args: unknown[]) => {
    lines.push(args);
  };
  try {
    onRenderProfile("GameTable", "update", 9, 4, 100, 110);
    assert.equal(lines.length, 1);
    assert.deepEqual(lines[0], [
      "[PROFILE]",
      {
        id: "GameTable",
        phase: "update",
        actualDuration: 9,
        baseDuration: 4,
        startTime: 100,
        commitTime: 110,
      },
    ]);

    lines.length = 0;
    onRenderProfile("PlayerSeats", "mount", 8, 2, 50, 58);
    assert.equal(lines.length, 0);
  } finally {
    console.log = original;
  }
});
