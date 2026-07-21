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
  MATCH_QUEUE_COLLECTION,
  MATCH_QUEUE_STATUS,
  PENDING_JOIN_STATUS,
  PUBLIC_TABLE_DEFAULT_TARGET_SEATS,
  PUBLIC_TABLE_INDEX_COLLECTION,
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

describe("DocumentSnapshot.exists (firebase-admin v13)", () => {
  const prev = process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;

  afterEach(() => {
    if (prev === undefined) delete process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;
    else process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = prev;
  });

  it("publicTable.js uses boolean exists property, not exists()", async () => {
    const { readFileSync } = await import("node:fs");
    const { fileURLToPath } = await import("node:url");
    const path = fileURLToPath(new URL("./publicTable.js", import.meta.url));
    const src = readFileSync(path, "utf8");
    assert.doesNotMatch(src, /\.exists\s*\(/, "found .exists() function call");
    assert.match(src, /snap\.exists\b/, "expected boolean exists property usage");
  });

  it("handleFindOrCreatePublicTable reads matchQueue without exists() TypeError", async () => {
    process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = "true";
    const { handleFindOrCreatePublicTable } = await import("./publicTable.js");
    let queueRead = false;
    let existsTypeError = false;
    const emptySnap = { exists: false, data: () => undefined, ref: { path: "x" } };
    const db = {
      collection: (name) => ({
        doc: () => ({
          get: async () => {
            if (name === "matchQueue") {
              queueRead = true;
              return emptySnap;
            }
            return emptySnap;
          },
        }),
        where: () => ({
          limit: () => ({
            get: async () => ({ docs: [], empty: true }),
          }),
        }),
      }),
      runTransaction: async () => {
        throw new Error("mock-stop-after-queue-read");
      },
    };
    try {
      await handleFindOrCreatePublicTable(db, {
        actorId: "user1",
        joinId: "jid-queue-read",
        displayName: "Tester",
      });
    } catch (err) {
      if (String(err?.message ?? err).includes("exists is not a function")) {
        existsTypeError = true;
      }
    }
    assert.equal(queueRead, true);
    assert.equal(existsTypeError, false);
  });
});

describe("handleLeavePublicTable", () => {
  const prev = process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;

  afterEach(() => {
    if (prev === undefined) delete process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;
    else process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = prev;
  });

  it("returns cleared:false when queue is absent", async () => {
    process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = "true";
    const { handleLeavePublicTable } = await import("./publicTable.js");
    const db = {
      collection: () => ({
        doc: () => ({
          get: async () => ({ exists: false, data: () => undefined }),
        }),
      }),
    };
    const result = await handleLeavePublicTable(db, { actorId: "nobody" });
    assert.equal(result.ok, true);
    assert.equal(result.cleared, false);
  });

  it("reads session before deleting queue in transaction", async () => {
    process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = "true";
    const { handleLeavePublicTable } = await import("./publicTable.js");
    const ops = [];
    let writeStarted = false;
    const guestId = "leave_guest";
    const roomId = "room_leave";
    const sessionId = "sess_leave";
    const queuePath = `matchQueue/${guestId}`;
    const sessionPath = `rooms/${roomId}/sessions/${sessionId}`;

    const makeRef = (path) => ({ path });

    const db = {
      collection: (name) => {
        if (name === MATCH_QUEUE_COLLECTION) {
          return {
            doc: (id) => ({
              path: `${name}/${id}`,
              get: async () => ({
                exists: true,
                ref: makeRef(`${name}/${id}`),
                data: () => ({
                  status: MATCH_QUEUE_STATUS.SPECTATING,
                  roomId,
                  sessionId,
                  activeJoinId: "guest-join",
                }),
              }),
            }),
          };
        }
        if (name === "rooms") {
          return {
            doc: (rid) => ({
              collection: (sub) => ({
                doc: (sid) => ({
                  path: `rooms/${rid}/${sub}/${sid}`,
                  collection: () => ({
                    doc: () => ({ get: async () => ({ exists: false }) }),
                    get: async () => ({ docs: [] }),
                  }),
                  get: async () => ({
                    exists: true,
                    data: () => ({
                      status: "in_progress",
                      publicTable: true,
                      pendingJoins: {
                        [guestId]: { joinId: "guest-join", status: PENDING_JOIN_STATUS.SPECTATING },
                      },
                      currentHand: { tricksByPlayer: {}, participantIds: [] },
                    }),
                  }),
                }),
              }),
            }),
          };
        }
        if (name === PUBLIC_TABLE_INDEX_COLLECTION) {
          return {
            doc: () => ({
              set: async () => {},
              get: async () => ({ exists: false }),
            }),
          };
        }
        return {
          doc: () => ({
            get: async () => ({ exists: false, data: () => undefined }),
          }),
        };
      },
      runTransaction: async (fn) => {
        const tx = {
          get: async (ref) => {
            if (writeStarted) {
              throw new Error(
                "Firestore transactions require all reads to be executed before all writes.",
              );
            }
            ops.push(`read:${ref.path}`);
            if (ref.path === queuePath) {
              return {
                exists: true,
                data: () => ({
                  status: MATCH_QUEUE_STATUS.SPECTATING,
                  roomId,
                  sessionId,
                }),
              };
            }
            if (ref.path === sessionPath) {
              return {
                exists: true,
                data: () => ({
                  pendingJoins: {
                    [guestId]: { joinId: "guest-join", status: PENDING_JOIN_STATUS.SPECTATING },
                  },
                }),
              };
            }
            return { exists: false, data: () => undefined };
          },
          delete: (ref) => {
            writeStarted = true;
            ops.push(`delete:${ref.path}`);
          },
          update: (ref) => {
            writeStarted = true;
            ops.push(`update:${ref.path}`);
          },
        };
        await fn(tx);
      },
    };

    const result = await handleLeavePublicTable(db, { actorId: guestId });
    assert.equal(result.ok, true);
    assert.equal(result.cleared, true);
    assert.deepEqual(ops, [
      `read:${queuePath}`,
      `read:${sessionPath}`,
      `delete:${queuePath}`,
      `update:${sessionPath}`,
    ]);
  });

  it("skips session update when pendingJoins entry is absent", async () => {
    process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = "true";
    const { handleLeavePublicTable } = await import("./publicTable.js");
    const ops = [];
    const guestId = "leave_guest2";
    const roomId = "room_leave2";
    const sessionId = "sess_leave2";
    const queuePath = `matchQueue/${guestId}`;
    const sessionPath = `rooms/${roomId}/sessions/${sessionId}`;

    const db = {
      collection: (name) => ({
        doc: (id) => ({
          path: `${name}/${id}`,
          get: async () => ({
            exists: name === MATCH_QUEUE_COLLECTION,
            ref: { path: `${name}/${id}` },
            data: () =>
              name === MATCH_QUEUE_COLLECTION
                ? {
                    status: MATCH_QUEUE_STATUS.SPECTATING,
                    roomId,
                    sessionId,
                  }
                : undefined,
          }),
          collection: (sub) => ({
            doc: (sid) => ({
              path: `rooms/${id}/${sub}/${sid}`,
              collection: () => ({
                get: async () => ({ docs: [] }),
              }),
            }),
          }),
        }),
      }),
      runTransaction: async (fn) => {
        const tx = {
          get: async (ref) => {
            ops.push(`read:${ref.path}`);
            if (ref.path === queuePath) {
              return {
                exists: true,
                data: () => ({
                  status: MATCH_QUEUE_STATUS.SPECTATING,
                  roomId,
                  sessionId,
                }),
              };
            }
            if (ref.path === sessionPath) {
              return { exists: true, data: () => ({ pendingJoins: {} }) };
            }
            return { exists: false, data: () => undefined };
          },
          delete: (ref) => ops.push(`delete:${ref.path}`),
          update: (ref) => ops.push(`update:${ref.path}`),
        };
        await fn(tx);
      },
    };

    const result = await handleLeavePublicTable(db, { actorId: guestId });
    assert.equal(result.cleared, true);
    assert.deepEqual(ops, [`read:${queuePath}`, `read:${sessionPath}`, `delete:${queuePath}`]);
  });
});
