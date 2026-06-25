/**
 * Robot draw authority gating (draw-only; settlement untouched).
 * Run: node --test scripts/robot-draw-authority.test.mjs
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
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
});
