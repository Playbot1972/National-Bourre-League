/**
 * Mixed bot tables — seated hand participants must not flip to watch-only while scores lag.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveTableWatchOnly } from "../docs/public-table-spectator.js";

describe("resolveTableWatchOnly", () => {
  it("forces watch-only off when user is in current hand participants", () => {
    const session = {
      publicTable: true,
      pendingJoins: {
        user_a: { status: "spectating", joinId: "j1" },
      },
      currentHand: {
        phase: "draw",
        participantIds: ["user_a", "bot_1", "bot_2"],
      },
    };
    assert.equal(
      resolveTableWatchOnly(session, "user_a", {
        scorePlayerIds: ["bot_1", "bot_2"],
        handParticipantIds: ["user_a", "bot_1", "bot_2"],
      }),
      false,
    );
  });

  it("stays watch-only for mid-hand spectator without score row or hand seat", () => {
    const session = {
      publicTable: true,
      pendingJoins: {
        guest_1: { status: "spectating", joinId: "j1" },
      },
      currentHand: {
        phase: "play",
        participantIds: ["bot_a", "bot_b"],
      },
    };
    assert.equal(
      resolveTableWatchOnly(session, "guest_1", {
        scorePlayerIds: ["bot_a", "bot_b"],
        handParticipantIds: ["bot_a", "bot_b"],
      }),
      true,
    );
  });
});
