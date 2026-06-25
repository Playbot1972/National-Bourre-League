/**
 * Robot draw authority gating (draw-only; settlement untouched).
 * Run: node --test scripts/robot-draw-authority.test.mjs
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  shouldClientDriveRobotDraw,
  shouldUseServerBotAdvanceForDraw,
} from "../docs/robot-draw-authority.js";

describe("robot draw authority", () => {
  it("server authority ON + table open → server advance, not client robotSubmitDraw", () => {
    assert.equal(shouldUseServerBotAdvanceForDraw(true, true), true);
    assert.equal(shouldClientDriveRobotDraw(true), false);
  });

  it("server authority ON + table closed → no client robotSubmitDraw", () => {
    assert.equal(shouldUseServerBotAdvanceForDraw(true, false), false);
    assert.equal(shouldClientDriveRobotDraw(true), false);
  });

  it("server authority OFF → client may drive robotSubmitDraw", () => {
    assert.equal(shouldUseServerBotAdvanceForDraw(false, true), false);
    assert.equal(shouldClientDriveRobotDraw(false), true);
  });

  it("draw branch in app.js gates robotSubmitDraw behind server authority", () => {
    const src = readFileSync(fileURLToPath(new URL("../docs/app.js", import.meta.url)), "utf8");
    const drawIdx = src.indexOf('if (handPhase === "draw")');
    assert.ok(drawIdx >= 0);
    const slice = src.slice(drawIdx, drawIdx + 2500);
    assert.ok(slice.includes("shouldUseServerBotAdvanceForDraw"));
    assert.ok(slice.includes("advanceSessionBots"));
    assert.ok(slice.indexOf("advanceSessionBots") < slice.indexOf("robotSubmitDraw"));
    assert.ok(slice.indexOf("shouldClientDriveRobotDraw") < slice.indexOf("robotSubmitDraw"));
  });
});
