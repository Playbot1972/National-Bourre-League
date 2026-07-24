import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { HAND_PHASE } from "./vendor/game-engine.js";
import {
  enforcePublicTableIdlePolicy,
  evaluateIdlePolicyForSeatedHumans,
  resolveIdleSitOutMidHandAction,
} from "./publicTableIdle.js";

const root = dirname(fileURLToPath(import.meta.url));
const NOW = 1_700_000_100_000;

function midHandDrawSession(turnPlayerId = "human_idle") {
  return {
    publicTable: true,
    status: "in_progress",
    handCount: 1,
    players: [
      { playerId: "human_idle", displayName: "Idle" },
      { playerId: "bot_b", displayName: "Bot B" },
    ],
    currentHand: {
      phase: HAND_PHASE.DRAW,
      turnPlayerId,
      participantIds: ["human_idle", "bot_b"],
      actionOrder: ["human_idle", "bot_b"],
      drawCompletedIds: [],
      foldedIds: [],
      tricksByPlayer: { human_idle: 0, bot_b: 0 },
      trumpSuit: "hearts",
      deckSeed: 42,
      deckNextIndex: 10,
    },
  };
}

describe("spectator join + idle peer mid-hand (recon)", () => {
  it("flags idle seated human for sit-out when last activity is older than 45s", () => {
    const session = midHandDrawSession();
    const scoreById = {
      human_idle: { playerId: "human_idle", lastActivityTimestamp: NOW - 60_000 },
      bot_b: { playerId: "bot_b", isRobot: true },
    };
    const { sitOut } = evaluateIdlePolicyForSeatedHumans(session, scoreById, NOW);
    assert.deepEqual(sitOut, ["human_idle"]);
  });

  it("mid-hand auto-action is ready once sitOut is set on turn holder", () => {
    const session = midHandDrawSession();
    const scoreById = {
      human_idle: { sitOut: true, lastActivityTimestamp: NOW - 60_000 },
      bot_b: {},
    };
    const action = resolveIdleSitOutMidHandAction(session, scoreById);
    assert.deepEqual(action, {
      action: "draw_fold",
      playerId: "human_idle",
      phase: "draw",
    });
  });

  it("handleTouchPublicTableActivity chains bot advance after table-wide enforce", () => {
    const src = readFileSync(join(root, "publicTableIdle.js"), "utf8");
    const start = src.indexOf("export async function handleTouchPublicTableActivity");
    assert.ok(start >= 0);
    const block = src.slice(start, start + 1400);
    assert.match(block, /enforcePublicTableIdlePolicy/);
    assert.match(block, /advanceBotsAfterAction/);
    assert.match(block, /idlePolicy && idlePolicy\.status !== "skipped"/);
  });
});

describe("spectator touch does not refresh idle peer activity", () => {
  it("recordPublicTablePlayerActivity only touches the actor score row", () => {
    const src = readFileSync(join(root, "publicTableIdle.js"), "utf8");
    const start = src.indexOf("export async function recordPublicTablePlayerActivity");
    assert.ok(start >= 0);
    const block = src.slice(start, start + 700);
    assert.match(block, /scoresCollection\(db, roomId, sessionId\)\.doc\(playerId\)/);
    assert.doesNotMatch(block, /for \(const pid of/);
  });
});
