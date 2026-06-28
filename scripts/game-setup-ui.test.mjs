import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gameSetupStepLabel } from "../docs/game-setup-ui.js";

describe("game-setup-ui", () => {
  it("guides host through open → roster → play", () => {
    assert.equal(
      gameSetupStepLabel({ hasActiveSession: false, ready: false, isOwner: true }),
      "Step 1 — Tap Open table to begin",
    );
    assert.equal(
      gameSetupStepLabel({ hasActiveSession: true, ready: false, isOwner: true }),
      "Step 2 — Add at least one more player (you count as player 1)",
    );
    assert.equal(
      gameSetupStepLabel({ hasActiveSession: true, ready: true, isOwner: true }),
      "Step 3 — Tap Play to start the game",
    );
  });

  it("shows waiting copy for guests", () => {
    assert.equal(
      gameSetupStepLabel({ hasActiveSession: false, ready: false, isOwner: false }),
      "Waiting for the host to open a table",
    );
    assert.equal(
      gameSetupStepLabel({ hasActiveSession: true, ready: false, isOwner: false }),
      "Step 2 — Waiting for more players",
    );
  });
});
