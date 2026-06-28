import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gameSetupStepLabel } from "../docs/game-setup-ui.js";
import {
  mergeBourreSettingsWithPending,
  readGameSetupBourreFromDom,
} from "../docs/room-detail-view.js";

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

  it("merges pending Bourré checkbox overrides onto server settings", () => {
    const merged = mergeBourreSettingsWithPending(
      {
        buyInAmount: 100,
        anteAmount: 5,
        limEnabled: false,
        rebuyEnabled: false,
        splitPotEnabled: false,
      },
      { limEnabled: true, rebuyEnabled: true, splitPotEnabled: true },
    );
    assert.equal(merged.limEnabled, true);
    assert.equal(merged.rebuyEnabled, true);
    assert.equal(merged.splitPotEnabled, true);
  });

  it("reads game setup Bourré flags from the DOM", () => {
    const root = {
      querySelector(id) {
        if (id === "#room-lim-enabled") return { checked: true };
        if (id === "#room-rebuy-enabled") return { checked: false };
        if (id === "#room-split-pot-enabled") return { checked: true };
        return null;
      },
    };
    assert.deepEqual(readGameSetupBourreFromDom(root), {
      limEnabled: true,
      rebuyEnabled: false,
      splitPotEnabled: true,
    });
  });
});
