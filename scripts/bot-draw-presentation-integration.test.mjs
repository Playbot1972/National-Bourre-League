/**
 * Draw-phase bot presentation gate — baseline (v1.04.55) wiring checks.
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

describe("bot draw presentation integration (v1.04.55 baseline)", () => {
  it("app.js uses simple presentation busy check without session phase sync", () => {
    assert.doesNotMatch(appSrc, /function syncBotPresentationSessionPhase/);
    const fnStart = appSrc.indexOf("function isRawTablePresentationBusy");
    assert.ok(fnStart >= 0);
    const fnBody = appSrc.slice(fnStart, fnStart + 400);
    assert.match(fnBody, /isTablePresentationBusyForBots/);
    assert.doesNotMatch(fnBody, /sessionPhase/);
  });

  it("draw branch restores turnId and drawDone for client fallback bot submit", () => {
    const drawIdx = appSrc.indexOf('if (handPhase === "draw")');
    assert.ok(drawIdx >= 0);
    const drawSlice = appSrc.slice(drawIdx, drawIdx + 1200);
    assert.match(drawSlice, /const turnId = currentHand\.turnPlayerId/);
    assert.match(drawSlice, /const drawDone = currentHand\.drawCompletedIds/);
    assert.match(drawSlice, /robotSubmitDraw/);
  });

  it("server bot advance waits for presentation clear in draw phase", async () => {
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
    assert.equal(advanceCalls, 0, "blocked while presentation busy");

    presentationBlocked = false;
    runtime.schedule(session, scores, "human", { reason: "presentation-clear" });
    await new Promise((r) => setTimeout(r, 220));
    assert.equal(advanceCalls, 1, "bot advance fires once presentation clears");
  });
});
