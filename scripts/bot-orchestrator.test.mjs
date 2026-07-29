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
import { createServerBotAdvanceRuntime } from "../docs/bot-orchestration-runtime.js";
import { BOT_PLAY_DELAY_MIN_MS, BOT_PLAY_DELAY_MAX_MS } from "../docs/bot-play-delay.js";

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

  it("presentation gate prefers evaluateBotPresentationGate when table bundle exports it", () => {
    assert.match(src, /evaluateBotPresentationGate/);
    assert.match(src, /function isRawTablePresentationBusy/);
    const fnStart = src.indexOf("function isRawTablePresentationBusy");
    const fnBody = src.slice(fnStart, fnStart + 800);
    assert.match(fnBody, /evaluateBotPresentationGate\(Date\.now\(\), sessionPhase\)/);
    assert.match(src, /function syncBotPresentationSessionPhase/);
  });

  it("logs bot-submit-blocked when presentation defers draw/play", () => {
    assert.match(src, /bot-submit-blocked/);
  });

  it("draw-phase ante/trump hand presentation is visual-only for bots", () => {
    const bridgeSrc = readFileSync(
      fileURLToPath(new URL("../src/table/trickAnimationBridge.ts", import.meta.url)),
      "utf8",
    );
    assert.match(bridgeSrc, /drawPhaseHandPresentationBlocksBots/);
    assert.match(bridgeSrc, /"ante"/);
    assert.match(bridgeSrc, /"trumpReveal"/);
    assert.match(bridgeSrc, /sessionPhase === "draw"/);
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

  it("play-phase presentation block defers but still arms bot think timer", () => {
    assert.match(runtimeSrc, /presentationBlocked && handPhase !== "play"/);
    assert.match(runtimeSrc, /action: "deferred"/);
    assert.match(runtimeSrc, /action: presentationBlocked \? "waiting_presentation"/);
    assert.doesNotMatch(
      runtimeSrc,
      /presentationBlocked && handPhase !== "play"[\s\S]{0,500}return;\s*\n\s*if \(inFlight\)/,
      "non-play presentation defer must not return before debounced server advance",
    );
    assert.doesNotMatch(
      runtimeSrc,
      /waiting_presentation[\s\S]{0,400}return;\s*\n\s*if \(inFlight\)/,
      "play presentation wait must not return before armPlayThink",
    );
    const clientPlay = src.slice(
      src.indexOf("function scheduleClientBotPlayCard"),
      src.indexOf("function stopRobotPresentationSubscription"),
    );
    assert.match(clientPlay, /presentationBlocked/);
    assert.match(clientPlay, /action: "deferred"/);
    assert.doesNotMatch(
      clientPlay,
      /presentation_blocked[\s\S]{0,200}action: "blocked"[\s\S]{0,80}return;/,
      "client play must not return before armPlayThink when presentation blocked",
    );
  });
});

describe("server bot advance runtime presentation deferral", () => {
  const playThinkWaitMs = () => BOT_PLAY_DELAY_MAX_MS + 150;

  async function waitUntil(ms, predicate) {
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
      if (predicate()) return true;
      await new Promise((r) => setTimeout(r, 25));
    }
    return predicate();
  }

  it("arms think during play even when presentation is blocked, then executes after clear", async () => {
    let presentationBlocked = true;
    let advanceCalls = 0;
    const session = {
      id: "sess_1",
      status: "active",
      currentHand: {
        phase: "play",
        turnPlayerId: "bot_a",
        participantIds: ["human", "bot_a"],
        currentTrick: { trickNumber: 1, plays: [] },
        tricksByPlayer: { human: 0, bot_a: 0 },
      },
    };
    const scores = [{ playerId: "bot_a", isRobot: true }];
    const runtime = createServerBotAdvanceRuntime({
      shouldRequestAdvance: () => true,
      sessionNeedsBotDriver: () => true,
      shouldBlockForPresentation: () => presentationBlocked,
      snapshotContext: () => ({
        handNumber: 1,
        trickNumber: 1,
        turnPlayerId: "bot_a",
      }),
      getRoomId: () => "room_1",
      getSessionId: () => "sess_1",
      getHandPhase: (s) => s.currentHand?.phase ?? null,
      advanceSessionBots: async () => {
        advanceCalls += 1;
        return { ok: true };
      },
      findSession: () => session,
      getScores: () => scores,
      onWake: () => {},
    });

    runtime.schedule(session, scores, "human", { reason: "test" });
    await waitUntil(playThinkWaitMs(), () => advanceCalls === 0);
    assert.equal(advanceCalls, 0, "should not fire while presentation blocked");

    presentationBlocked = false;
    runtime.schedule(session, scores, "human", { reason: "presentation-clear" });
    const executed = await waitUntil(playThinkWaitMs(), () => advanceCalls >= 1);
    assert.equal(executed, true, "should execute after presentation clears");
    assert.equal(advanceCalls, 1);
  });

  it("defers reveal-phase advance when presentation blocked, then executes after clear", async () => {
    let presentationBlocked = true;
    let advanceCalls = 0;
    const session = {
      id: "sess_reveal",
      status: "active",
      currentHand: {
        phase: "reveal",
        trumpUpcard: { rank: "7", suit: "spades" },
        trumpSuit: "spades",
        participantIds: ["bot_a", "bot_b"],
        turnPlayerId: "bot_a",
      },
    };
    const scores = [
      { playerId: "bot_a", isRobot: true },
      { playerId: "bot_b", isRobot: true },
    ];
    const runtime = createServerBotAdvanceRuntime({
      shouldRequestAdvance: () => true,
      sessionNeedsBotDriver: () => true,
      shouldBlockForPresentation: () => presentationBlocked,
      snapshotContext: () => ({
        handNumber: 1,
        trickNumber: null,
        turnPlayerId: "bot_a",
      }),
      getRoomId: () => "room_1",
      getSessionId: () => "sess_reveal",
      getHandPhase: (s) => s.currentHand?.phase ?? null,
      advanceSessionBots: async () => {
        advanceCalls += 1;
        return { ok: true };
      },
      findSession: () => session,
      getScores: () => scores,
      onWake: () => {},
    });

    runtime.schedule(session, scores, "spectator_uid", { reason: "watch-only-open" });
    await new Promise((r) => setTimeout(r, 200));
    assert.equal(advanceCalls, 0, "should not fire while trump presentation blocks");

    presentationBlocked = false;
    runtime.schedule(session, scores, "spectator_uid", { reason: "presentation-clear" });
    await new Promise((r) => setTimeout(r, 250));
    assert.equal(advanceCalls, 1, "should advance reveal after presentation clears");
  });

  it("falls back when server advance returns skipped but bot draw is still pending", async () => {
    let fallbackCalls = 0;
    const session = {
      id: "sess_draw",
      status: "active",
      currentHand: {
        phase: "draw",
        turnPlayerId: "bot_a",
        participantIds: ["human", "bot_a"],
        drawCompletedIds: [],
      },
    };
    const scores = [{ playerId: "bot_a", isRobot: true }];
    const runtime = createServerBotAdvanceRuntime({
      shouldRequestAdvance: () => true,
      sessionNeedsBotDriver: () => true,
      shouldBlockForPresentation: () => false,
      snapshotContext: () => ({
        handNumber: 1,
        turnPlayerId: "bot_a",
      }),
      getRoomId: () => "room_1",
      getSessionId: () => "sess_draw",
      getHandPhase: (s) => s.currentHand?.phase ?? null,
      advanceSessionBots: async () => ({
        status: "ok",
        skipped: true,
        reason: "Invalid discard selection",
        steps: [],
      }),
      findSession: () => session,
      getScores: () => scores,
      onWake: () => {},
      onAdvanceError: () => {
        fallbackCalls += 1;
      },
    });

    await runtime.execute(session, scores, "human", { reason: "test-draw-noop" });
    assert.equal(fallbackCalls, 1);
  });
});
