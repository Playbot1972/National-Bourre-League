/**
 * Draw-phase bot presentation gate — e2e-style integration across bridge + app.js wiring.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServerBotAdvanceRuntime } from "../docs/bot-orchestration-runtime.js";

const appSrc = readFileSync(
  fileURLToPath(new URL("../docs/app.js", import.meta.url)),
  "utf8",
);

describe("bot draw presentation integration", () => {
  it("app.js syncs server session phase into table gate before evaluating presentation", () => {
    assert.match(appSrc, /function syncBotPresentationSessionPhase/);
    assert.match(appSrc, /setBotPresentationSessionPhase/);
    assert.match(appSrc, /evaluateBotPresentationGate\(Date\.now\(\), sessionPhase\)/);
    const blockStart = appSrc.indexOf("function shouldBlockRobotForPresentation");
    const blockBody = appSrc.slice(blockStart, blockStart + 400);
    assert.match(blockBody, /isRawTablePresentationBusy\(s\)/);
  });

  it("draw branch restores turnId and drawDone for client fallback bot submit", () => {
    const drawIdx = appSrc.indexOf('if (handPhase === "draw")');
    assert.ok(drawIdx >= 0);
    const drawSlice = appSrc.slice(drawIdx, drawIdx + 1200);
    assert.match(drawSlice, /const turnId = currentHand\.turnPlayerId/);
    assert.match(drawSlice, /const drawDone = currentHand\.drawCompletedIds/);
    assert.match(drawSlice, /robotSubmitDraw/);
  });

  it("server bot advance executes draw after presentation clears (no infinite blocked loop)", async () => {
    let presentationBlocked = true;
    let advanceCalls = 0;
    const session = {
      id: "sess_draw",
      status: "active",
      currentHand: {
        phase: "draw",
        turnPlayerId: "bot_h9zxag4r",
        participantIds: ["human", "bot_h9zxag4r"],
        drawCompletedIds: [],
        trumpSuit: "hearts",
      },
    };
    const scores = [{ playerId: "bot_h9zxag4r", isRobot: true }];
    const runtime = createServerBotAdvanceRuntime({
      shouldRequestAdvance: () => true,
      sessionNeedsBotDriver: () => true,
      shouldBlockForPresentation: () => presentationBlocked,
      snapshotContext: () => ({
        handNumber: 1,
        trickNumber: null,
        turnPlayerId: "bot_h9zxag4r",
      }),
      getRoomId: () => "room_1",
      getSessionId: () => "sess_draw",
      getHandPhase: (s) => s.currentHand?.phase ?? null,
      advanceSessionBots: async () => {
        advanceCalls += 1;
        return { ok: true };
      },
      findSession: () => session,
      getScores: () => scores,
      onWake: () => {},
    });

    runtime.schedule(session, scores, "human", { reason: "draw-bot-turn" });
    await new Promise((r) => setTimeout(r, 220));
    assert.equal(advanceCalls, 1, "draw-phase bot advance ignores visual presentation catch-up");
  });

  it("server bot advance executes reveal while trump presentation is busy", async () => {
    let advanceCalls = 0;
    const session = {
      id: "sess_reveal",
      status: "active",
      currentHand: {
        phase: "reveal",
        turnPlayerId: "bot_h9zxag4r",
        participantIds: ["human", "bot_h9zxag4r"],
        trumpUpcard: { rank: "A", suit: "hearts" },
      },
    };
    const scores = [{ playerId: "bot_h9zxag4r", isRobot: true }];
    const runtime = createServerBotAdvanceRuntime({
      shouldRequestAdvance: () => true,
      sessionNeedsBotDriver: () => true,
      shouldBlockForPresentation: () => true,
      snapshotContext: () => ({
        handNumber: 1,
        trickNumber: null,
        turnPlayerId: "bot_h9zxag4r",
      }),
      getRoomId: () => "room_1",
      getSessionId: () => "sess_reveal",
      getHandPhase: (s) => s.currentHand?.phase ?? null,
      advanceSessionBots: async () => {
        advanceCalls += 1;
        return { ok: true, steps: [{ kind: "advance_reveal" }] };
      },
      findSession: () => session,
      getScores: () => scores,
      onWake: () => {},
    });

    runtime.schedule(session, scores, "human", { reason: "play-now-reveal" });
    await new Promise((r) => setTimeout(r, 220));
    assert.equal(advanceCalls, 1);
  });
});
