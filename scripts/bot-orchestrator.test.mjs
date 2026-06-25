/**
 * Bot orchestrator — single server-owner path when SERVER_HAND_AUTHORITY is on.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  shouldClientDriveBotsDirectly,
  shouldRequestServerBotAdvance,
} from "../docs/bot-orchestrator.js";

describe("bot orchestrator authority", () => {
  it("server authority ON + table open → request server only", () => {
    assert.equal(shouldRequestServerBotAdvance(true, true), true);
    assert.equal(shouldClientDriveBotsDirectly(true), false);
  });

  it("server authority ON + table closed → no client bot drive", () => {
    assert.equal(shouldRequestServerBotAdvance(true, false), false);
    assert.equal(shouldClientDriveBotsDirectly(true), false);
  });

  it("server authority OFF → legacy client may drive bots", () => {
    assert.equal(shouldRequestServerBotAdvance(false, true), false);
    assert.equal(shouldClientDriveBotsDirectly(false), true);
  });
});

describe("app.js bot paths", () => {
  const src = readFileSync(fileURLToPath(new URL("../docs/app.js", import.meta.url)), "utf8");

  it("server path uses scheduleServerBotAdvance before legacy robotPlayCard", () => {
    const idx = src.indexOf("function processRobotActionsInner");
    assert.ok(idx >= 0);
    const slice = src.slice(idx, idx + 4500);
    assert.ok(slice.includes("shouldRequestServerBotAdvance"));
    assert.ok(slice.includes("scheduleServerBotAdvance"));
    const serverIdx = slice.indexOf("scheduleServerBotAdvance");
    const playIdx = slice.indexOf("robotPlayCard");
    assert.ok(serverIdx >= 0 && playIdx >= 0);
    assert.ok(serverIdx < playIdx, "server schedule must precede legacy robotPlayCard");
  });

  it("does not call robotSubmitDraw when server authority requests advance", () => {
    const idx = src.indexOf("shouldRequestServerBotAdvance(SERVER_HAND_AUTHORITY");
    assert.ok(idx >= 0);
    const earlyReturn = src.indexOf("scheduleServerBotAdvance", idx);
    const robotDraw = src.indexOf("robotSubmitDraw", idx);
    assert.ok(earlyReturn >= 0 && robotDraw >= 0);
    assert.ok(earlyReturn < robotDraw);
  });
});
