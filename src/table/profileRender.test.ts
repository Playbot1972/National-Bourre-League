import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { onRenderProfile } from "./profileRender";

describe("onRenderProfile", () => {
  it("logs only when actualDuration exceeds threshold", () => {
    const lines: unknown[] = [];
    const original = console.log;
    console.log = (...args: unknown[]) => {
      lines.push(args);
    };
    try {
      onRenderProfile("GameTable", "update", 8, 4, 100, 108);
      assert.equal(lines.length, 0);
      onRenderProfile("PlayerSeats", "mount", 12.345, 6.1, 50.2, 62.5);
      assert.equal(lines.length, 1);
    } finally {
      console.log = original;
    }
  });
});
