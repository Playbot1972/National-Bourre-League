/**
 * UI layer boundaries — presentation vs intent vs orchestration.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createTableIntentHandlers } from "../docs/table-intents.js";
import { applyTableFeedbackDiff } from "../docs/table-feedback.js";

describe("table UI layer modules", () => {
  it("applyTableFeedbackDiff does not fire trick win from snapshot (animation-synced)", () => {
    const calls = [];
    const api = {
      playTrickWinFeedback: () => calls.push("trick"),
      playBigWinFeedback: () => calls.push("big"),
      playShuffleFeedback: () => calls.push("shuffle"),
    };
    const prev = {
      sessionId: "s1",
      phase: "play",
      trumpKey: null,
      drawCompletedIds: [],
      myTricks: 1,
      handComplete: false,
      myIsWinner: false,
      myBourre: false,
      heroCardKeys: "",
    };
    const next = { ...prev, myTricks: 2 };
    applyTableFeedbackDiff(prev, next, { api, myUid: "a", pendingDrawShuffle: false });
    assert.deepEqual(calls, []);
  });

  it("applyTableFeedbackDiff does not fire draw from snapshot (draw confirm audio only)", () => {
    const calls = [];
    const api = {
      playDrawFeedback: () => calls.push("draw"),
      playDrawCountFeedback: () => calls.push("draw-count"),
      playShuffleFeedback: () => calls.push("shuffle"),
    };
    const prev = {
      sessionId: "s1",
      phase: "draw",
      trumpKey: "7-spades",
      drawCompletedIds: [],
      myTricks: 0,
      handComplete: false,
      myIsWinner: false,
      myBourre: false,
      heroCardKeys: "a,b,c",
    };
    const next = {
      ...prev,
      drawCompletedIds: ["a"],
      heroCardKeys: "a,b,d",
    };
    applyTableFeedbackDiff(prev, next, { api, myUid: "a", pendingDrawShuffle: true });
    assert.deepEqual(calls, []);
  });

  it("applyTableFeedbackDiff fires bourre feedback when local player goes bourré", () => {
    const calls = [];
    const api = { playBourreFeedback: () => calls.push("bourre") };
    const prev = {
      sessionId: "s1",
      phase: "play",
      trumpKey: "7-spades",
      drawCompletedIds: [],
      myTricks: 0,
      handComplete: false,
      myIsWinner: false,
      myBourre: false,
      heroCardKeys: "",
    };
    const next = { ...prev, handComplete: true, myBourre: true };
    applyTableFeedbackDiff(prev, next, { api, myUid: "a", pendingDrawShuffle: false });
    assert.deepEqual(calls, ["bourre"]);
  });

  it("createTableIntentHandlers requires auth before submit", () => {
    const handlers = createTableIntentHandlers({
      getAuth: () => null,
      getRoomId: () => "r1",
      getSessionId: () => "s1",
      getCurrentSessions: () => [],
      getHandPhase: () => null,
      getCurrentHand: () => null,
      getSessionCurrentHand: () => ({}),
      setTableActionFeedback: () => {},
      showRoomsError: () => {},
      commitLocalHandAction: () => {},
      clearLocalHandCommit: () => {},
      markPendingDrawShuffle: () => {},
      scheduleTableSessionSync: () => {},
      setHandParticipation: async () => {},
      submitHandDraw: async () => {},
      foldHandDraw: async () => {},
      playHandCard: async () => {},
      advanceHandReveal: async () => {},
      updateHandTrick: async () => {},
      onSettleHand: async () => {},
      formatClientGameError: (_e, f) => f,
    });
    handlers.onToggleInHand(true);
    // no throw — early return when unauthenticated
  });

  it("createTableIntentHandlers formats internal play errors", async () => {
    let feedback = null;
    let context = null;
    const handlers = createTableIntentHandlers({
      getAuth: () => ({ uid: "human" }),
      getRoomId: () => "r1",
      getSessionId: () => "s1",
      getCurrentSessions: () => [{ id: "s1", handCount: 0 }],
      getHandPhase: () => "play",
      getCurrentHand: () => ({ phase: "play", turnPlayerId: "human" }),
      getSessionCurrentHand: () => ({ phase: "play", turnPlayerId: "human" }),
      setTableActionFeedback: (fb, ctx) => {
        feedback = fb;
        context = ctx;
      },
      showRoomsError: () => {},
      commitLocalHandAction: () => {},
      clearLocalHandCommit: () => {},
      markPendingDrawShuffle: () => {},
      scheduleTableSessionSync: () => {},
      setHandParticipation: async () => {},
      submitHandDraw: async () => {},
      foldHandDraw: async () => {},
      playHandCard: async () => {
        const err = new Error("INTERNAL");
        err.code = "functions/internal";
        throw err;
      },
      advanceHandReveal: async () => {},
      updateHandTrick: async () => {},
      onSettleHand: async () => {},
      formatClientGameError: (err, fallback) => {
        if (String(err?.code) === "functions/internal") {
          return "The server could not finish that table action. Refresh the page and try again.";
        }
        return fallback;
      },
      getActionErrorContext: (kind) => ({
        handNumber: 1,
        phase: "play",
        turnPlayerId: "human",
        actionKind: kind,
      }),
    });
    await handlers.onPlayCard(0).catch(() => {});
    assert.equal(feedback?.status, "error");
    assert.match(feedback?.message ?? "", /server could not finish/);
    assert.equal(context?.actionKind, "play");
  });

  it("suppresses play internal error when table already advanced since action start", async () => {
    let feedback = null;
    let contextCalls = 0;
    const prePlayHand = {
      phase: "play",
      turnPlayerId: "human",
      participantIds: ["human", "bot_1"],
      tricksByPlayer: {},
      currentTrick: [{}],
    };
    const postPlayHand = {
      phase: "play",
      turnPlayerId: "bot_1",
      participantIds: ["human", "bot_1"],
      tricksByPlayer: {},
      currentTrick: [{}, {}],
    };
    const handlers = createTableIntentHandlers({
      getAuth: () => ({ uid: "human" }),
      getRoomId: () => "r1",
      getSessionId: () => "s1",
      getCurrentSessions: () => [{ id: "s1", handCount: 0, currentHand: postPlayHand }],
      getHandPhase: () => "play",
      getCurrentHand: () => postPlayHand,
      getSessionCurrentHand: () => postPlayHand,
      setTableActionFeedback: (fb, ctx) => {
        feedback = fb;
        if (ctx) contextCalls += 1;
      },
      showRoomsError: () => {},
      commitLocalHandAction: () => {},
      clearLocalHandCommit: () => {},
      markPendingDrawShuffle: () => {},
      scheduleTableSessionSync: () => {},
      setHandParticipation: async () => {},
      submitHandDraw: async () => {},
      foldHandDraw: async () => {},
      playHandCard: async () => {
        const err = new Error("INTERNAL");
        err.code = "functions/internal";
        throw err;
      },
      advanceHandReveal: async () => {},
      updateHandTrick: async () => {},
      onSettleHand: async () => {},
      formatClientGameError: () =>
        "The server could not finish that table action. Refresh the page and try again.",
      getActionErrorContext: (kind) => {
        contextCalls += 1;
        const hand = contextCalls === 1 ? prePlayHand : postPlayHand;
        return {
          handNumber: 1,
          phase: hand.phase,
          turnPlayerId: hand.turnPlayerId,
          actionKind: kind,
          totalTricksPlayed: 0,
          currentTrickLen: hand.currentTrick.length,
        };
      },
    });
    await handlers.onPlayCard(0).catch(() => {});
    assert.equal(feedback, null);
  });
});

describe("app.js UI wiring", () => {
  const src = readFileSync(fileURLToPath(new URL("../docs/app.js", import.meta.url)), "utf8");

  it("uses getTableIntentHandlers instead of inline actions object", () => {
    assert.ok(src.includes("actions: getTableIntentHandlers()"));
    const propsIdx = src.indexOf("function buildTableSessionProps");
    const body = src.slice(propsIdx, propsIdx + 12000);
    assert.equal(body.includes("onToggleInHand: (inHand)"), false);
  });

  it("imports table-view-model and table-feedback", () => {
    assert.ok(src.includes('from "./table-view-model.js"'));
    assert.ok(src.includes('from "./table-feedback.js"'));
    assert.ok(src.includes('from "./table-intents.js"'));
  });
});

describe("table seat layout CSS", () => {
  const css = readFileSync(fileURLToPath(new URL("../src/table/table.css", import.meta.url)), "utf8");

  it("does not use display:contents on seat slots (desktop scale transform paint bug)", () => {
    const slotBlock = css.match(/\.btable__seat-slot\s*\{[^}]+\}/)?.[0] ?? "";
    assert.ok(slotBlock.length > 0, "expected .btable__seat-slot rule");
    assert.equal(/display:\s*contents/.test(slotBlock), false);
  });

  it("does not use contain:paint on .bseat in touch media (0×0 seat clips avatars)", () => {
    const touchBlock =
      css.match(
        /@media\s*\(hover:\s*none\)\s*and\s*\(pointer:\s*coarse\)\s*\{[\s\S]*?\n\}/,
      )?.[0] ?? "";
    assert.ok(touchBlock.length > 0, "expected touch pointer media block");
    assert.equal(/\.btable__seats\s+\.bseat[\s\S]*contain:\s*[^;]*paint/.test(touchBlock), false);
  });
});
