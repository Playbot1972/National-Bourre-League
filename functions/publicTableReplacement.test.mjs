import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  isHandoffWindow,
  shouldRunPublicTableReplacement,
  selectQueuedHumansFifo,
  selectEligibleFillBots,
  planReplacementPairs,
} from "./publicTableReplacement.js";
import {
  BOT_ROLE,
  PENDING_JOIN_STATUS,
  ROOM_VISIBILITY,
} from "./vendor/public-table-schema.js";
import { MIXED_PUBLIC_TABLES_CLIENT_ENABLED } from "./vendor/public-table-rollout.js";

describe("isHandoffWindow", () => {
  it("allows cleared between-hand state", () => {
    assert.equal(
      isHandoffWindow({
        status: "in_progress",
        currentHand: { tricksByPlayer: {}, participantIds: [] },
      }),
      true,
    );
  });

  it("rejects live draw/play phases", () => {
    assert.equal(
      isHandoffWindow({ status: "in_progress", currentHand: { phase: "draw" } }),
      false,
    );
    assert.equal(
      isHandoffWindow({ status: "in_progress", currentHand: { participantIds: ["p1"] } }),
      false,
    );
  });
});

describe("selectQueuedHumansFifo", () => {
  it("orders by queuedAt and skips applied joinIds", () => {
    const queued = selectQueuedHumansFifo(
      {
        u2: { joinId: "j2", status: PENDING_JOIN_STATUS.SPECTATING, queuedAt: 200 },
        u1: { joinId: "j1", status: PENDING_JOIN_STATUS.SPECTATING, queuedAt: 100 },
        u3: { joinId: "j3", status: PENDING_JOIN_STATUS.SEATED },
      },
      { appliedJoinIds: ["j1"] },
    );
    assert.deepEqual(queued.map((q) => q.uid), ["u2"]);
    assert.equal(queued[0].joinId, "j2");
  });
});

describe("selectEligibleFillBots", () => {
  const players = [
    { playerId: "human1", displayName: "Host" },
    { playerId: "bot_a", displayName: "Bot A" },
    { playerId: "bot_b", displayName: "Bot B" },
    { playerId: "bot_legacy", displayName: "Legacy" },
  ];

  it("returns only fill bots in seat order with bankroll", () => {
    const scoreById = {
      human1: { bankroll: 1000 },
      bot_a: { bankroll: 1000, botRole: BOT_ROLE.FILL },
      bot_b: { bankroll: 0, botRole: BOT_ROLE.FILL, out: true },
      bot_legacy: { bankroll: 1000, isRobot: true },
    };
    const bots = selectEligibleFillBots(players, scoreById);
    assert.deepEqual(bots.map((b) => b.playerId), ["bot_a"]);
    assert.equal(bots[0].seatIndex, 1);
  });
});

describe("planReplacementPairs", () => {
  it("pairs FIFO humans with deterministic fill bots", () => {
    const humans = [
      { uid: "u1", joinId: "j1" },
      { uid: "u2", joinId: "j2" },
    ];
    const bots = [
      { playerId: "bot_a", seatIndex: 1 },
      { playerId: "bot_c", seatIndex: 3 },
    ];
    const pairs = planReplacementPairs(humans, bots);
    assert.equal(pairs.length, 2);
    assert.equal(pairs[0].human.uid, "u1");
    assert.equal(pairs[0].bot.playerId, "bot_a");
    assert.equal(pairs[1].human.uid, "u2");
    assert.equal(pairs[1].bot.playerId, "bot_c");
  });
});

describe("shouldRunPublicTableReplacement", () => {
  const prev = process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;

  afterEach(() => {
    if (prev === undefined) delete process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;
    else process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = prev;
  });

  it("is false when server flag is off and client rollout is off", () => {
    if (MIXED_PUBLIC_TABLES_CLIENT_ENABLED) {
      return;
    }
    delete process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED;
    assert.equal(
      shouldRunPublicTableReplacement(
        { visibility: ROOM_VISIBILITY.PUBLIC, features: { mixedPublicTables: true } },
        { publicTable: true },
      ),
      false,
    );
  });

  it("is true for public table when flag on", () => {
    process.env.MIXED_PUBLIC_TABLES_SERVER_ENABLED = "true";
    assert.equal(
      shouldRunPublicTableReplacement(
        { visibility: ROOM_VISIBILITY.PUBLIC, features: { mixedPublicTables: true } },
        { publicTable: true },
      ),
      true,
    );
  });
});
