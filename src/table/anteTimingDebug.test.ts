import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  _resetAnteTimingDebugForTests,
  anteTimingMark,
  isAnteDebugSlowMode,
  isAnteTimingDebugEnabled,
} from "./anteTimingDebug";
import { anteSequenceDurationMs } from "./antePresentationTiming";
import { forceGameFlowDebugForTests } from "./gameFlowDebug";

describe("anteTimingDebug", () => {
  it("marks sequence timing in debug mode", () => {
    const lines: string[] = [];
    const restore = forceGameFlowDebugForTests();
    const originalLog = console.log;
    console.log = (line: string) => {
      if (typeof line === "string" && line.startsWith("[nbl-ante-timing]")) {
        lines.push(line);
      }
    };
    _resetAnteTimingDebugForTests();
    try {
      anteTimingMark("sequence-start", { handNumber: 9, playerCount: 2 });
      anteTimingMark("player-launch", { handNumber: 9, playerId: "p1", playerIndex: 0 });
      anteTimingMark("player-landed", { handNumber: 9, playerId: "p1", playerIndex: 0 });
      anteTimingMark("deal-start", { handNumber: 9, source: "test" });
      assert.ok(lines.some((l) => l.includes("sequence-start")));
      assert.ok(lines.some((l) => l.includes("player-launch")));
      assert.ok(lines.some((l) => l.includes("summary")));
    } finally {
      console.log = originalLog;
      restore();
    }
  });

  it("slow mode flag is readable in node tests", () => {
    const normal = anteSequenceDurationMs(4, false);
    assert.ok(normal > 0);
    assert.equal(typeof isAnteTimingDebugEnabled(), "boolean");
    assert.equal(typeof isAnteDebugSlowMode(), "boolean");
  });
});
