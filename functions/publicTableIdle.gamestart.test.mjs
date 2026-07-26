import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { HAND_PHASE } from "./vendor/game-engine.js";
import { ROOM_VISIBILITY } from "./vendor/public-table-schema.js";
import {
  PUBLIC_TABLE_IDLE_SIT_OUT_MS,
} from "./vendor/public-table-schema.js";
import {
  buildHandEnrollment,
} from "./gameHandlers.js";
import {
  classifyIdleStage,
  enforcePublicTableIdlePolicy,
  evaluateIdlePolicyForSeatedHumans,
  isIdleSitOutBlockingEnrollment,
  resolveLastActivityMs,
  skipIdleEnrollmentTurn,
} from "./publicTableIdle.js";
import { eligibleIdsForAnteCollection } from "./vendor/bourre-rules.js";

const NOW = 1_700_000_200_000;
const ROOM_ID = "room_gs";
const SESSION_ID = "sess_gs";

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
    dealerId: "human_active",
    players,
    currentHand: { tricksByPlayer: {}, participantIds: [] },
  };
}

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
      };
      return fn(tx);
    },
    getSession() {
      return session;
    },
    getScore(id) {
      return scores.get(id);
    },
  };

  return db;
}

describe("idle sit-out game-start blocking (recon)", () => {
  it("missing activity metadata is not treated as perpetually active", () => {
    assert.equal(
      resolveLastActivityMs({ playerId: "human_a", bankroll: 100 }, NOW),
      NOW - PUBLIC_TABLE_IDLE_SIT_OUT_MS - 1,
    );
    assert.equal(classifyIdleStage({ playerId: "human_a", bankroll: 100 }, NOW), "sit_out");
    assert.equal(classifyIdleStage({ playerId: "human_b" }, NOW), "active");
  });

  it("inactive seated human crosses 45s and is flagged for sitOut", () => {
    const session = handoffSession([
      { playerId: "human_idle", displayName: "Idle" },
      { playerId: "human_active", displayName: "Active" },
      { playerId: "bot_b", displayName: "Bot" },
    ]);
    const scoreById = {
      human_idle: { playerId: "human_idle", bankroll: 100, lastActivityTimestamp: NOW - 60_000 },
      human_active: { playerId: "human_active", bankroll: 100, lastActivityTimestamp: NOW - 5_000 },
      bot_b: { playerId: "bot_b", bankroll: 100, isRobot: true },
    };
    const { sitOut } = evaluateIdlePolicyForSeatedHumans(session, scoreById, NOW);
    assert.deepEqual(sitOut, ["human_idle"]);
  });

  it("enforce applies sitOut to idle peer so deal can exclude them", async () => {
    const players = [
      { playerId: "human_idle", displayName: "Idle" },
      { playerId: "human_active", displayName: "Active" },
      { playerId: "bot_b", displayName: "Bot" },
    ];
    const db = createIdleMockDb({
      roomData: publicRoomData(),
      sessionData: handoffSession(players),
      scoresById: {
        human_idle: { playerId: "human_idle", bankroll: 100, lastActivityTimestamp: NOW - 60_000 },
        human_active: { playerId: "human_active", bankroll: 100, lastActivityTimestamp: NOW - 5_000 },
        bot_b: { playerId: "bot_b", bankroll: 100, isRobot: true },
      },
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

    const sortedIds = ["human_idle", "human_active", "bot_b"];
    const scoreById = {
      human_idle: db.getScore("human_idle"),
      human_active: db.getScore("human_active"),
      bot_b: db.getScore("bot_b"),
    };
    const eligible = eligibleIdsForAnteCollection(sortedIds, scoreById, 100);
    assert.ok(!eligible.includes("human_idle"));
    assert.ok(eligible.includes("human_active"));
    assert.ok(eligible.includes("bot_b"));
    assert.ok(eligible.length >= 2);
  });

  it("active interacting player is not incorrectly sat out", async () => {
    const players = [{ playerId: "human_active", displayName: "Active" }];
    const db = createIdleMockDb({
      roomData: publicRoomData(),
      sessionData: handoffSession(players),
      scoresById: {
        human_active: { playerId: "human_active", bankroll: 100, lastActivityTimestamp: NOW - 5_000 },
      },
    });

    const result = await enforcePublicTableIdlePolicy(db, {
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      roomData: publicRoomData(),
      sessionData: handoffSession(players),
      nowMs: NOW,
    });

    assert.equal(result.status, "noop");
    assert.notEqual(db.getScore("human_active")?.sitOut, true);
  });

  it("sitOut human is excluded from buildHandEnrollment ordered roster", () => {
    const scoreById = {
      human_idle: { sitOut: true, bankroll: 100 },
      human_active: { bankroll: 100 },
      bot_b: { bankroll: 100, isRobot: true },
    };
    const enrollment = buildHandEnrollment(
      ["human_idle", "human_active", "bot_b"],
      "human_active",
      scoreById,
      100,
      NOW,
    );
    assert.ok(!enrollment.orderedPlayerIds.includes("human_idle"));
    assert.ok(enrollment.orderedPlayerIds.includes("human_active"));
    assert.ok(enrollment.orderedPlayerIds.includes("bot_b"));
  });

  it("skipIdleEnrollmentTurn advances enrollment blocked by sitOut without waiting for timer", async () => {
    const enrollment = {
      active: true,
      orderedPlayerIds: ["human_idle", "human_active", "bot_b"],
      currentIndex: 0,
      enrolledIds: [],
      declinedIds: [],
      turnDeadlineMs: NOW + 12_000,
    };
    const sessionData = {
      ...handoffSession([
        { playerId: "human_idle", displayName: "Idle" },
        { playerId: "human_active", displayName: "Active" },
        { playerId: "bot_b", displayName: "Bot" },
      ]),
      liveEnrollment: enrollment,
    };
    const scoreById = {
      human_idle: { sitOut: true, bankroll: 100, lastActivityTimestamp: NOW - 60_000 },
      human_active: { bankroll: 100, lastActivityTimestamp: NOW - 5_000 },
      bot_b: { bankroll: 100, isRobot: true },
    };
    assert.equal(isIdleSitOutBlockingEnrollment(enrollment, scoreById, NOW), true);

    const db = createIdleMockDb({
      roomData: publicRoomData(),
      sessionData,
      scoresById: scoreById,
    });

    const advanced = await skipIdleEnrollmentTurn(db, {
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      nowMs: NOW,
    });
    assert.equal(advanced, true);
    const live = db.getSession().liveEnrollment;
    assert.equal(live.currentIndex, 1);
    assert.ok(live.declinedIds.includes("human_idle"));
    assert.equal(isIdleSitOutBlockingEnrollment(live, scoreById, NOW), false);
  });

  it("already-sitOut current enrollment turn still advances via applyIdleSitOuts", async () => {
    const enrollment = {
      active: true,
      orderedPlayerIds: ["human_idle", "bot_b"],
      currentIndex: 0,
      enrolledIds: [],
      declinedIds: [],
      turnDeadlineMs: NOW + 12_000,
    };
    const sessionData = {
      ...handoffSession([
        { playerId: "human_idle", displayName: "Idle" },
        { playerId: "bot_b", displayName: "Bot" },
      ]),
      liveEnrollment: enrollment,
    };
    const db = createIdleMockDb({
      roomData: publicRoomData(),
      sessionData,
      scoresById: {
        human_idle: {
          sitOut: true,
          bankroll: 100,
          lastActivityTimestamp: NOW - 60_000,
          idleSitOutAt: NOW - 15_000,
        },
        bot_b: { bankroll: 100, isRobot: true },
      },
    });

    await enforcePublicTableIdlePolicy(db, {
      roomId: ROOM_ID,
      sessionId: SESSION_ID,
      roomData: publicRoomData(),
      sessionData,
      nowMs: NOW,
    });

    const live = db.getSession().liveEnrollment;
    assert.equal(live.currentIndex, 1);
    assert.ok(live.declinedIds.includes("human_idle"));
  });
});

describe("advanceBotsAfterAction idle enrollment wiring", () => {
  it("uses skipIdleEnrollmentTurn instead of handleTimeoutEnrollment for idle blocks", () => {
    const root = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(root, "gameHandlers.js"), "utf8");
    const start = src.indexOf("export async function advanceBotsAfterAction");
    const block = src.slice(start, start + 2200);
    assert.match(block, /skipIdleEnrollmentTurn/);
    assert.doesNotMatch(block, /isIdleSitOutBlockingEnrollment[\s\S]{0,120}handleTimeoutEnrollment/);
  });
});
