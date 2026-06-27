import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatTableActionError,
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
        { handNumber: 3, phase: "play", turnPlayerId: "human", actionKind: "play" },
        { handNumber: 3, phase: "play", turnPlayerId: "human", handComplete: false },
      ),
      false,
    );
  });
});
