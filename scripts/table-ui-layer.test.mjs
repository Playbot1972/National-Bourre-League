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
  it("applyTableFeedbackDiff fires trick win feedback only", () => {
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
      heroCardKeys: "",
    };
    const next = { ...prev, myTricks: 2 };
    applyTableFeedbackDiff(prev, next, { api, myUid: "a", pendingDrawShuffle: false });
    assert.deepEqual(calls, ["trick"]);
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
