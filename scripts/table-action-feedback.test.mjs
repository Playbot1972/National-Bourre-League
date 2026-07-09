import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatTableActionError,
  isBenignTableActionError,
  isInternalTableActionError,
  isStaleTableActionError,
  scrubRawInternalMessage,
} from "../docs/table-action-feedback.js";

function mockFormatter(err, fallback) {
  const code = String(err?.code ?? "");
  const msg = String(err?.message ?? "").trim();
  if (code === "functions/internal" || msg.toLowerCase() === "internal") {
    return "The server could not finish that table action. Refresh the page and try again.";
  }
  return msg || fallback;
}

describe("table-action-feedback", () => {
  it("detects benign race errors that should not surface to players", () => {
    assert.equal(isBenignTableActionError(new Error("Decision step did not apply")), true);
    assert.equal(isBenignTableActionError(new Error("Not in reveal phase")), true);
    assert.equal(isBenignTableActionError(new Error("Draw already completed")), true);
    assert.equal(isBenignTableActionError(new Error("Not your turn to draw")), true);
    assert.equal(
      isBenignTableActionError({
        code: "functions/failed-precondition",
        message: "Decision step did not apply",
      }),
      true,
    );
    assert.equal(isBenignTableActionError(new Error("Not your turn")), false);
    assert.equal(isBenignTableActionError(new Error("Permission denied")), false);
  });

  it("scrubs raw INTERNAL messages", () => {
    assert.equal(
      scrubRawInternalMessage("INTERNAL"),
      "The server could not finish that table action. Refresh the page and try again.",
    );
    assert.equal(scrubRawInternalMessage("Not your turn"), "Not your turn");
  });

  it("formatTableActionError delegates to formatClientGameError", () => {
    const msg = formatTableActionError(
      { code: "functions/internal", message: "INTERNAL" },
      "Could not play card",
      mockFormatter,
    );
    assert.match(msg, /server could not finish/);
  });

  it("clears play error when turn advances", () => {
    assert.equal(
      isStaleTableActionError(
        { handNumber: 3, phase: "play", turnPlayerId: "human", actionKind: "play" },
        { handNumber: 3, phase: "play", turnPlayerId: "bot_1", handComplete: false },
      ),
      true,
    );
  });

  it("clears error when hand completes (fifth-trick settlement leak)", () => {
    assert.equal(
      isStaleTableActionError(
        { handNumber: 3, phase: "play", turnPlayerId: "human", actionKind: "play" },
        { handNumber: 3, phase: "play", turnPlayerId: "human", handComplete: true },
      ),
      true,
    );
  });

  it("clears error on phase change", () => {
    assert.equal(
      isStaleTableActionError(
        { handNumber: 3, phase: "draw", actionKind: "draw" },
        { handNumber: 3, phase: "play", handComplete: false },
      ),
      true,
    );
  });

  it("keeps current-turn play error visible", () => {
    assert.equal(
      isStaleTableActionError(
        {
          handNumber: 3,
          phase: "play",
          turnPlayerId: "human",
          actionKind: "play",
          totalTricksPlayed: 0,
          currentTrickLen: 1,
        },
        {
          handNumber: 3,
          phase: "play",
          turnPlayerId: "human",
          handComplete: false,
          totalTricksPlayed: 0,
          currentTrickLen: 1,
        },
      ),
      false,
    );
  });

  it("does not treat post-play error context as fresh when session unchanged", () => {
    const postPlay = {
      handNumber: 3,
      phase: "play",
      turnPlayerId: "bot_1",
      actionKind: "play",
      totalTricksPlayed: 0,
      currentTrickLen: 2,
    };
    assert.equal(
      isStaleTableActionError(postPlay, {
        handNumber: 3,
        phase: "play",
        turnPlayerId: "bot_1",
        handComplete: false,
        totalTricksPlayed: 0,
        currentTrickLen: 2,
      }),
      false,
    );
  });

  it("clears play error when trick progress advances (turn cycled back to same seat)", () => {
    assert.equal(
      isStaleTableActionError(
        {
          handNumber: 3,
          phase: "play",
          turnPlayerId: "human",
          actionKind: "play",
          totalTricksPlayed: 1,
          currentTrickLen: 2,
        },
        {
          handNumber: 3,
          phase: "play",
          turnPlayerId: "human",
          handComplete: false,
          totalTricksPlayed: 2,
          currentTrickLen: 0,
        },
      ),
      true,
    );
  });

  it("clears play error when current trick gains a card", () => {
    assert.equal(
      isStaleTableActionError(
        {
          handNumber: 3,
          phase: "play",
          turnPlayerId: "human",
          actionKind: "play",
          totalTricksPlayed: 0,
          currentTrickLen: 1,
        },
        {
          handNumber: 3,
          phase: "play",
          turnPlayerId: "bot_1",
          handComplete: false,
          totalTricksPlayed: 0,
          currentTrickLen: 2,
        },
      ),
      true,
    );
  });

  it("detects internal callable errors", () => {
    assert.equal(
      isInternalTableActionError({ code: "functions/internal", message: "INTERNAL" }),
      true,
    );
    assert.equal(isInternalTableActionError(new Error("Not your turn")), false);
  });
});
