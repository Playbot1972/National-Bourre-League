import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_ROOM_SESSIONS,
  PRESET_SESSION_NAMES,
  assignSessionNamesForMigration,
  canCreateAnotherSession,
  claimSessionNameConcurrent,
  countAvailableSessionSlots,
  createdSessionsForTabs,
  isValidSessionNamePool,
  nextAvailableSessionName,
  pickClaimedNamesForCreate,
  randomizePresetOrder,
  seededPresetOrder,
} from "./presetNames";

describe("preset session names", () => {
  it("assigns exactly four randomized preset names to a new room pool", () => {
    const pool = randomizePresetOrder(() => 0.42);
    assert.equal(pool.length, 4);
    assert.equal(isValidSessionNamePool(pool), true);
  });

  it("never allows more than four sessions worth of unique names", () => {
    const pool = [...PRESET_SESSION_NAMES];
    const claimed = [...pool];
    assert.equal(nextAvailableSessionName(pool, claimed), null);
    assert.equal(canCreateAnotherSession(4, pool, claimed), false);
    assert.equal(countAvailableSessionSlots(pool, claimed), 0);
  });

  it("allows create before the room preset pool has loaded", () => {
    assert.equal(canCreateAnotherSession(0, [], []), true);
    assert.equal(canCreateAnotherSession(3, [], []), true);
    assert.equal(canCreateAnotherSession(4, [], []), false);
  });

  it("allows create when claimed names are stale but session count is lower", () => {
    const pool = [...PRESET_SESSION_NAMES];
    const staleClaimed = [...pool];
    assert.equal(canCreateAnotherSession(2, pool, staleClaimed), true);
    assert.equal(canCreateAnotherSession(4, pool, staleClaimed), false);
  });

  it("prefers live session names over stale room.claimedSessionNames", () => {
    const pool = [...PRESET_SESSION_NAMES];
    const staleDoc = [...pool];
    assert.deepEqual(pickClaimedNamesForCreate([], staleDoc), []);
    assert.equal(nextAvailableSessionName(pool, pickClaimedNamesForCreate([], staleDoc)), "Dirty South");
    assert.deepEqual(
      pickClaimedNamesForCreate(["Dirty South"], ["Wild West", "East Coast"]),
      ["Dirty South"],
    );
  });

  it("persists pool order — seeded shuffle is stable for the same room id", () => {
    const a = seededPresetOrder("room-abc");
    const b = seededPresetOrder("room-abc");
    assert.deepEqual(a, b);
    assert.notDeepEqual(a, seededPresetOrder("room-xyz"));
  });

  it("backfills legacy sessions once without overwriting existing names", () => {
    const pool = seededPresetOrder("legacy-room");
    const sessions = [
      { id: "s2", createdAt: 200, sessionName: pool[1] },
      { id: "s1", createdAt: 100 },
      { id: "s3", createdAt: 300 },
    ];
    const first = assignSessionNamesForMigration(pool, sessions);
    assert.equal(first.get("s1"), pool[0]);
    assert.equal(first.get("s3"), pool[2]);
    assert.equal(first.has("s2"), false);

    const after = sessions.map((s) => ({
      ...s,
      sessionName: s.sessionName || first.get(s.id),
    }));
    const second = assignSessionNamesForMigration(pool, after);
    assert.equal(second.size, 0);
  });

  it("frees a name when a session is deleted (reuse within room)", () => {
    const pool = [...PRESET_SESSION_NAMES];
    const claimed = ["Dirty South", "Wild West"];
    assert.equal(nextAvailableSessionName(pool, claimed), "East Coast");
    const afterDelete = ["Dirty South"];
    assert.equal(nextAvailableSessionName(pool, afterDelete), "Wild West");
  });

  it("allows only one concurrent claim on the last available slot", () => {
    const pool = [...PRESET_SESSION_NAMES];
    const claimed = ["Dirty South", "Wild West", "East Coast"];
    const first = claimSessionNameConcurrent(pool, claimed);
    const second = claimSessionNameConcurrent(pool, [
      ...claimed,
      first.ok ? first.name : "",
    ]);
    assert.equal(first.ok, true);
    if (first.ok) assert.equal(first.name, "Midwest");
    assert.equal(second.ok, false);
  });

  it("lists only created sessions for tabs — not unclaimed preset slots", () => {
    const pool = seededPresetOrder("room-tabs");
    const sessions = [{ id: "s1", sessionName: pool[1], createdAt: 100 }];
    const tabs = createdSessionsForTabs(pool, sessions);
    assert.equal(tabs.length, 1);
    assert.equal(tabs[0]?.sessionName, pool[1]);
    assert.equal(createdSessionsForTabs(pool, []).length, 0);
  });

  it("rejects invalid custom pools", () => {
    assert.equal(isValidSessionNamePool(["Dirty South", "Custom", "East Coast", "Midwest"]), false);
    assert.equal(isValidSessionNamePool(["Dirty South", "Dirty South", "East Coast", "Midwest"]), false);
  });
});

describe("clear-all removal contract", () => {
  it("documents that bulk clear is not part of the preset session model", () => {
    assert.equal(typeof MAX_ROOM_SESSIONS, "number");
    assert.equal(PRESET_SESSION_NAMES.length, MAX_ROOM_SESSIONS);
  });
});
