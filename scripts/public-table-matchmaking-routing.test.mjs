import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computePublicTableIndexDoc,
  isJoinableIndexDoc,
  rankPublicTableCandidates,
} from "../functions/publicTable.js";
import { BOT_ROLE, PENDING_JOIN_STATUS } from "../docs/public-table-schema.js";

describe("public-table matchmaking routing (unit)", () => {
  it("prefers live human tables over creating a new bot room", () => {
    const botFilledHost = computePublicTableIndexDoc({
      roomId: "room_a",
      sessionId: "sess_a",
      roomData: { targetSeatCount: 6, bourreSettings: { buyInAmount: 1000, anteAmount: 50 } },
      sessionData: {
        status: "in_progress",
        buyInAmount: 1000,
        handStake: 50,
        currentHand: { tricksByPlayer: {}, participantIds: [] },
      },
      scoreRows: [
        { playerId: "host" },
        { playerId: "bot_1", botRole: BOT_ROLE.FILL },
        { playerId: "bot_2", botRole: BOT_ROLE.FILL },
        { playerId: "bot_3", botRole: BOT_ROLE.FILL },
        { playerId: "bot_4", botRole: BOT_ROLE.FILL },
        { playerId: "bot_5", botRole: BOT_ROLE.FILL },
      ],
      pendingJoins: {},
    });
    assert.equal(botFilledHost.openSeats, 0);
    assert.equal(isJoinableIndexDoc(botFilledHost), true);

    const ranked = rankPublicTableCandidates([
      { realPlayerCount: 0, openSeats: 6, updatedAt: 2, status: "open" },
      botFilledHost,
    ]);
    assert.equal(ranked[0].roomId, "room_a");
  });

  it("does not route to closed or human-empty full tables", () => {
    assert.equal(
      isJoinableIndexDoc({ status: "closed", openSeats: 0, realPlayerCount: 1 }),
      false,
    );
    assert.equal(
      isJoinableIndexDoc({ status: "open", openSeats: 0, realPlayerCount: 0 }),
      false,
    );
  });

  it("queued spectator does not require open seated capacity", () => {
    const withSpectator = computePublicTableIndexDoc({
      roomId: "room_b",
      sessionId: "sess_b",
      roomData: { targetSeatCount: 6 },
      sessionData: {
        status: "in_progress",
        currentHand: { phase: "play", tricksByPlayer: {}, participantIds: ["host", "bot_1"] },
      },
      scoreRows: [
        { playerId: "host" },
        { playerId: "bot_1", botRole: BOT_ROLE.FILL },
        { playerId: "bot_2", botRole: BOT_ROLE.FILL },
        { playerId: "bot_3", botRole: BOT_ROLE.FILL },
        { playerId: "bot_4", botRole: BOT_ROLE.FILL },
        { playerId: "bot_5", botRole: BOT_ROLE.FILL },
      ],
      pendingJoins: {
        guest: { status: PENDING_JOIN_STATUS.SPECTATING },
      },
    });
    assert.equal(withSpectator.openSeats, 0);
    assert.equal(withSpectator.spectatorCount, 1);
    assert.equal(isJoinableIndexDoc(withSpectator), true);
  });
});
