import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  assertJoinIdFormat,
  clampTargetSeatCount,
  computePublicTableIndexDoc,
  deriveIndexStatus,
  isActiveQueueStatus,
  isJoinableIndexDoc,
  isSessionInHand,
  normalizeStakes,
  rankPublicTableCandidates,
  stakesKey,
} from "./publicTable.js";
import {
  BOT_ROLE,
  MATCH_QUEUE_STATUS,
  PENDING_JOIN_STATUS,
  PUBLIC_TABLE_DEFAULT_TARGET_SEATS,
} from "./vendor/public-table-schema.js";
import {
  MIXED_PUBLIC_TABLES_CLIENT_ENABLED,
  resolvePlayNowEntryPath,
} from "./vendor/public-table-rollout.js";
import { PLAY_NOW_ANTE, PLAY_NOW_BUY_IN } from "./vendor/play-now.js";

describe("assertJoinIdFormat", () => {
  it("rejects empty joinId", () => {
    assert.throws(() => assertJoinIdFormat(""), /joinId is required/);
    assert.throws(() => assertJoinIdFormat("   "), /joinId is required/);
  });

  it("accepts trimmed joinId", () => {
    assert.equal(assertJoinIdFormat("  abc-123  "), "abc-123");
  });
});

describe("clampTargetSeatCount", () => {
  it("defaults to PUBLIC_TABLE_DEFAULT_TARGET_SEATS", () => {
    assert.equal(clampTargetSeatCount(), PUBLIC_TABLE_DEFAULT_TARGET_SEATS);
    assert.equal(clampTargetSeatCount("nope"), PUBLIC_TABLE_DEFAULT_TARGET_SEATS);
  });

  it("clamps to 2–8", () => {
    assert.equal(clampTargetSeatCount(1), 2);
    assert.equal(clampTargetSeatCount(99), 8);
    assert.equal(clampTargetSeatCount(6), 6);
  });
});

describe("normalizeStakes", () => {
  it("uses Play Now defaults", () => {
    const stakes = normalizeStakes();
    assert.equal(stakes.buyInAmount, PLAY_NOW_BUY_IN);
    assert.equal(stakes.anteAmount, PLAY_NOW_ANTE);
  });

  it("builds stable stakesKey", () => {
    assert.equal(stakesKey(1000, 50), "1000_50");
  });
});

describe("isSessionInHand + deriveIndexStatus", () => {
  it("detects in-hand phases", () => {
    assert.equal(isSessionInHand({ status: "in_progress", currentHand: { phase: "draw" } }), true);
    assert.equal(isSessionInHand({ status: "in_progress", currentHand: { phase: "play" } }), true);
    assert.equal(
      isSessionInHand({ status: "in_progress", currentHand: { participantIds: ["a"] } }),
      true,
    );
  });

  it("marks final sessions closed", () => {
    assert.equal(deriveIndexStatus({ status: "final" }), "closed");
  });

  it("marks between-hands sessions open", () => {
    assert.equal(
      deriveIndexStatus({ status: "in_progress", currentHand: { tricksByPlayer: {}, participantIds: [] } }),
      "open",
    );
  });
});

describe("computePublicTableIndexDoc", () => {
  it("counts real humans, fill bots, spectators, and open seats", () => {
    const doc = computePublicTableIndexDoc({
      roomId: "room1",
      sessionId: "sess1",
      roomData: { targetSeatCount: 6, bourreSettings: { buyInAmount: 1000, anteAmount: 50 } },
      sessionData: {
        status: "in_progress",
        buyInAmount: 1000,
        handStake: 50,
        currentHand: { tricksByPlayer: {}, participantIds: [] },
      },
      scoreRows: [
        { playerId: "human1" },
        { playerId: "bot_a", botRole: BOT_ROLE.FILL },
        { playerId: "bot_b", botRole: BOT_ROLE.FILL },
        { playerId: "bot_legacy", isRobot: true },
      ],
      pendingJoins: {
        q1: { status: PENDING_JOIN_STATUS.SPECTATING },
        q2: { status: PENDING_JOIN_STATUS.SPECTATING },
      },
    });
    assert.equal(doc.realPlayerCount, 1);
    assert.equal(doc.botFillCount, 2);
    assert.equal(doc.spectatorCount, 2);
    assert.equal(doc.openSeats, 3);
    assert.equal(doc.status, "open");
    assert.equal(doc.stakesKey, "1000_50");
  });
});

describe("rankPublicTableCandidates", () => {
  it("prefers more humans, then fewer open seats", () => {
    const ranked = rankPublicTableCandidates([
      { realPlayerCount: 1, openSeats: 3, updatedAt: 1 },
      { realPlayerCount: 3, openSeats: 2, updatedAt: 1 },
      { realPlayerCount: 3, openSeats: 1, updatedAt: 1 },
    ]);
    assert.equal(ranked[0].openSeats, 1);
    assert.equal(ranked[1].openSeats, 2);
    assert.equal(ranked[2].realPlayerCount, 1);
  });
});

describe("isJoinableIndexDoc", () => {
  it("rejects closed or full tables", () => {
    assert.equal(isJoinableIndexDoc({ status: "closed", openSeats: 1 }), false);
    assert.equal(isJoinableIndexDoc({ status: "open", openSeats: 0 }), false);
    assert.equal(isJoinableIndexDoc({ status: "in_hand", openSeats: 2 }), true);
  });
});

describe("queue status helpers", () => {
  it("recognizes active queue statuses", () => {
    assert.equal(isActiveQueueStatus(MATCH_QUEUE_STATUS.SPECTATING), true);
    assert.equal(isActiveQueueStatus(MATCH_QUEUE_STATUS.CANCELLED), false);
  });
});

describe("rollout flag-off non-regression", () => {
  it("keeps client master switch disabled by default", () => {
    assert.equal(MIXED_PUBLIC_TABLES_CLIENT_ENABLED, false);
  });

  it("resolvePlayNowEntryPath returns private-create when flag is off", () => {
    assert.equal(resolvePlayNowEntryPath(), "private-create");
  });
});

describe("handleFindOrCreatePublicTable auth + flag guards", () => {
  const prev = process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;

  afterEach(() => {
    if (prev === undefined) delete process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;
    else process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = prev;
  });

  it("rejects when server flag is off", async () => {
    delete process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;
    const { handleFindOrCreatePublicTable } = await import("./publicTable.js");
    await assert.rejects(
      () =>
        handleFindOrCreatePublicTable(null, {
          actorId: "user1",
          joinId: "jid-1",
        }),
      (err) => err.code === "failed-precondition",
    );
  });

  it("rejects missing actorId", async () => {
    process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = "true";
    const { handleFindOrCreatePublicTable } = await import("./publicTable.js");
    await assert.rejects(
      () => handleFindOrCreatePublicTable(null, { joinId: "jid-1" }),
      (err) => err.code === "unauthenticated",
    );
  });

  it("rejects invalid joinId when flag on", async () => {
    process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = "true";
    const { handleFindOrCreatePublicTable } = await import("./publicTable.js");
    await assert.rejects(
      () => handleFindOrCreatePublicTable(null, { actorId: "user1", joinId: "" }),
      (err) => err.code === "invalid-argument",
    );
  });
});
