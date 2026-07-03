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
  const runtimeSrc = readFileSync(
    fileURLToPath(new URL("../docs/bot-orchestration-runtime.js", import.meta.url)),
    "utf8",
  );

  it("server path uses scheduleServerBotAdvance before legacy client bot play schedule", () => {
    const idx = src.indexOf("function processRobotActionsInner");
    assert.ok(idx >= 0);
    const slice = src.slice(idx, idx + 7000);
    assert.ok(slice.includes("shouldRequestServerBotAdvance"));
    assert.ok(slice.includes("scheduleServerBotAdvance"));
    const serverIdx = slice.indexOf("scheduleServerBotAdvance");
    const playIdx = slice.indexOf("scheduleClientBotPlayCard");
    assert.ok(serverIdx >= 0 && playIdx >= 0);
    assert.ok(serverIdx < playIdx, "server schedule must precede legacy client bot play schedule");
  });

  it("does not call robotSubmitDraw when server authority requests advance", () => {
    const idx = src.indexOf("shouldRequestServerBotAdvance(SERVER_HAND_AUTHORITY");
    assert.ok(idx >= 0);
    const earlyReturn = src.indexOf("scheduleServerBotAdvance", idx);
    const robotDraw = src.indexOf("robotSubmitDraw", idx);
    assert.ok(earlyReturn >= 0 && robotDraw >= 0);
    assert.ok(earlyReturn < robotDraw);
  });

  it("guards duplicate in-flight server advancement", () => {
    assert.ok(src.includes("createServerBotAdvanceRuntime"));
    assert.ok(runtimeSrc.includes("coalesce-request"));
    assert.ok(runtimeSrc.includes("advance_in_flight"));
    assert.ok(runtimeSrc.includes("assertBotAdvanceNotInFlight"));
    assert.ok(runtimeSrc.includes("let inFlight = false"));
    assert.ok(runtimeSrc.includes("bot-think-armed"));
    assert.ok(runtimeSrc.includes("bot-delay-chosen"));
    assert.ok(runtimeSrc.includes("createBotThinkScheduleState"));
  });

  it("advanceSessionBots is wired only through bot orchestration runtime", () => {
    const callSites = [...src.matchAll(/advanceSessionBots\(/g)];
    assert.equal(callSites.length, 0, "app.js should not call advanceSessionBots directly");
    assert.ok(src.includes("createServerBotAdvanceRuntime"));
    assert.ok(src.includes("advanceSessionBots,"));
    assert.ok(runtimeSrc.includes("deps.advanceSessionBots"));
  });
});
