import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ROOM_VISIBILITY } from "./vendor/public-table-schema.js";
import {
  buildActivityTouchPatch,
  enforcePublicTableIdlePolicy,
  evaluateIdlePolicyForSeatedHumans,
  recordPublicTablePlayerActivity,
} from "./publicTableIdle.js";

const root = dirname(fileURLToPath(import.meta.url));
const NOW = 1_700_000_000_000;

const ROOM_ID = "room_idle";
const SESSION_ID = "sess_idle";

function publicRoomData() {
  return {
    visibility: ROOM_VISIBILITY.PUBLIC,
    features: { mixedPublicTables: true },
    bourreSettings: { buyInAmount: 100 },
  };
}

function handoffSession(players) {
  return {
    publicTable: true,
    status: "in_progress",
    handCount: 0,
    handStake: 1,
    buyInAmount: 100,
    players,
    currentHand: { tricksByPlayer: {}, participantIds: [] },
  };
}

/** Minimal Firestore mock for idle-policy enforcement tests. */
function createIdleMockDb({ sessionData, roomData, scoresById }) {
  const session = structuredClone(sessionData);
  const room = structuredClone(roomData);
  const scores = new Map(Object.entries(structuredClone(scoresById)));

  const sessionRef = {
    async get() {
      return { exists: true, data: () => structuredClone(session) };
    },
    async update(patch) {
      Object.assign(session, patch);
    },
  };

  const scoresCol = {
    async get() {
      return {
        docs: [...scores.entries()].map(([id, data]) => ({
          id,
          data: () => structuredClone(data),
        })),
      };
    },
    doc(id) {
      return {
        async get() {
          if (!scores.has(id)) return { exists: false };
          return { exists: true, data: () => structuredClone(scores.get(id)) };
        },
        async set(patch, { merge } = {}) {
          const current = scores.get(id) ?? {};
          if (!merge) {
            scores.set(id, structuredClone(patch));
            return;
          }
          const next = { ...current };
          for (const [key, value] of Object.entries(patch)) {
            if (value != null && typeof value === "object" && value.constructor?.name === "DeleteTransform") {
              delete next[key];
            } else {
              next[key] = value;
            }
          }
          scores.set(id, next);
        },
        async delete() {
          scores.delete(id);
        },
      };
    },
  };

  const db = {
    collection(name) {
      if (name === "rooms") {
        return {
          doc(roomId) {
            return {
              async get() {
                return { exists: true, data: () => structuredClone(room) };
              },
              collection(sub) {
                if (sub !== "sessions") throw new Error("unexpected subcollection");
                return {
                  doc(sessionId) {
                    return {
                      ...sessionRef,
                      collection(inner) {
                        if (inner === "scores") return scoresCol;
                        if (inner === "privateHands") {
                          return { doc: () => ({ async delete() {} }) };
                        }
                        throw new Error(`unexpected inner ${inner}`);
                      },
                    };
                  },
                };
              },
            };
          },
        };
      }
      if (name === "matchQueue") {
        return {
          doc() {
            return {
              async get() {
                return { exists: false };
              },
              async set() {},
            };
          },
        };
      }
      throw new Error(`unexpected collection ${name}`);
    },
    async runTransaction(fn) {
      const tx = {
        async get(ref) {
          return ref.get();
        },
        async set(ref, data, opts) {
          return ref.set(data, opts);
        },
        async update(ref, data) {
          return ref.update(data);
        },
        async delete(ref) {
          return ref.delete();
        },
      };
      return fn(tx);
    },
    getScore(id) {
      return scores.get(id);
    },
  };

  return db;
}

describe("touch-triggered table-wide idle enforcement", () => {
  it("all-idle table: active touch + enforce applies sit-out to idle peer", async () => {
    const players = [
      { playerId: "human_active", displayName: "Active" },
      { playerId: "human_idle", displayName: "Idle" },
    ];
    const db = createIdleMockDb({
      roomData: publicRoomData(),
      sessionData: handoffSession(players),
      scoresById: {
        human_active: {
          playerId: "human_active",
          bankroll: 100,
          lastActivityTimestamp: NOW - 60_000,
        },
        human_idle: {
          playerId: "human_idle",
          bankroll: 100,
          lastActivityTimestamp: NOW - 60_000,
        },
      },
    });

    const before = evaluateIdlePolicyForSeatedHumans(
      handoffSession(players),
      {
        human_active: { lastActivityTimestamp: NOW - 60_000 },
        human_idle: { lastActivityTimestamp: NOW - 60_000 },
      },
      NOW,
    );
    assert.deepEqual(before.sitOut.sort(), ["human_active", "human_idle"]);

    await recordPublicTablePlayerActivity(db, {
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      playerId: "human_active",
    });

    const result = await enforcePublicTableIdlePolicy(db, {
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      roomData: publicRoomData(),
      sessionData: handoffSession(players),
      nowMs: NOW,
    });

    assert.equal(result.status, "applied");
    assert.deepEqual(result.sitOut, ["human_idle"]);
    assert.equal(db.getScore("human_idle")?.sitOut, true);
    assert.notEqual(db.getScore("human_active")?.sitOut, true);
  });

  it("recordPublicTablePlayerActivity clears sitOut on valid touch", async () => {
    const db = createIdleMockDb({
      roomData: publicRoomData(),
      sessionData: handoffSession([{ playerId: "human_a", displayName: "A" }]),
      scoresById: {
        human_a: {
          playerId: "human_a",
          bankroll: 100,
          sitOut: true,
          idleSitOutAt: NOW - 10_000,
          lastActivityTimestamp: NOW - 60_000,
        },
      },
    });

    const touch = await recordPublicTablePlayerActivity(db, {
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      playerId: "human_a",
    });

    assert.equal(touch.ok, true);
    assert.equal(touch.sitOut, false);
    const row = db.getScore("human_a");
    assert.equal(row.sitOut, undefined);
    assert.ok(row.lastActivityTimestamp);
  });
});

describe("gameHandlers human-move activity bumps", () => {
  it("bumps public-table activity on enroll, draw, and play handlers", () => {
    const src = readFileSync(join(root, "gameHandlers.js"), "utf8");
    for (const fn of ["handleSetHandParticipation", "handleSubmitDraw", "handlePlayCard"]) {
      const start = src.indexOf(`export async function ${fn}`);
      assert.ok(start >= 0, `${fn} exists`);
      const block = src.slice(start, start + 900);
      assert.match(
        block,
        /bumpPublicTableActivityBestEffort/,
        `${fn} should bump public-table activity`,
      );
    }
  });
});

describe("buildActivityTouchPatch contract", () => {
  it("does not clear sitOut when player was not sitting out", () => {
    const patch = buildActivityTouchPatch({ bankroll: 100 });
    assert.ok(patch.lastActivityTimestamp);
    assert.equal(patch.sitOut, undefined);
  });
});
