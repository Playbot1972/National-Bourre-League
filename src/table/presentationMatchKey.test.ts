import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildMatchKey,
  buildMatchKeyFromSession,
  deriveServerActionSeq,
  isLiveHandPhaseForBotPresentation,
} from "./presentationMatchKey";
import type { TableSessionData } from "./types";

describe("presentationMatchKey", () => {
  it("buildMatchKey returns idle without session id", () => {
    assert.equal(buildMatchKey(null), "idle");
    assert.equal(buildMatchKey({ sessionId: null }), "idle");
  });

  it("buildMatchKey encodes hand, trick, turn, and action seq", () => {
    assert.equal(
      buildMatchKey({
        sessionId: "sess_1",
        handNumber: 3,
        serverActionSeq: 42,
        trickNumber: 2,
        turnIndex: 1,
      }),
      "sess_1-h3-t2-turn1-aseq42",
    );
  });

  it("deriveServerActionSeq changes with draw and trick progress", () => {
    const draw = deriveServerActionSeq({
      phase: "draw",
      drawCompletedIds: ["a"],
      currentTrick: null,
      playedCards: [],
    });
    const play = deriveServerActionSeq({
      phase: "play",
      drawCompletedIds: ["a", "b"],
      currentTrick: { trickNumber: 1, plays: [{ playerId: "a" }] },
      playedCards: [{ playerId: "a" }],
    });
    assert.ok(play > draw);
  });

  it("buildMatchKeyFromSession uses turn index from action order", () => {
    const session = {
      sessionId: "sess_2",
      handNumber: 1,
      phase: "draw",
      turnPlayerId: "bot_1",
      actionOrder: ["human", "bot_1"],
      participantIds: ["human", "bot_1"],
      drawCompletedIds: [],
      currentTrick: null,
      playedCards: [],
    } as TableSessionData;
    assert.match(buildMatchKeyFromSession(session), /sess_2-h1-t0-turn1-aseq/);
  });

  it("isLiveHandPhaseForBotPresentation covers reveal through play", () => {
    assert.equal(isLiveHandPhaseForBotPresentation("reveal"), true);
    assert.equal(isLiveHandPhaseForBotPresentation("decision"), true);
    assert.equal(isLiveHandPhaseForBotPresentation("draw"), true);
    assert.equal(isLiveHandPhaseForBotPresentation("play"), true);
    assert.equal(isLiveHandPhaseForBotPresentation(null), false);
    assert.equal(isLiveHandPhaseForBotPresentation("idle"), false);
  });
});
