import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  ORPHAN_ROOM_GRACE_MS,
  clearRoomOrphanSignalOnJoin,
  deleteOrphanRoomArtifacts,
  handleRoomMemberCreated,
  handleRoomMemberDeleted,
  isLastMemberLeftAtExpired,
  isRoomEligibleForOrphanGc,
  markRoomOrphanedIfEmpty,
  runOrphanRoomGc,
  timestampToMillis,
} from "./orphanRoomCleanup.js";
import { PUBLIC_TABLE_INDEX_COLLECTION } from "./vendor/public-table-schema.js";

function createInMemoryDb(seed = []) {
  const docs = new Map();
  const key = (coll, id) => `${coll}/${id}`;

  const setDoc = (coll, id, data) => {
    docs.set(key(coll, id), { ...data });
  };

  const getDoc = (coll, id) => {
    const k = key(coll, id);
    if (!docs.has(k)) return { exists: false, data: () => undefined, id };
    return { exists: true, data: () => docs.get(k), id, ref: { path: `${coll}/${id}` } };
  };

  const deleteDoc = (coll, id) => {
    docs.delete(key(coll, id));
  };

  const queryDocs = (coll, field, op, value) => {
    const out = [];
    for (const [k, data] of docs.entries()) {
      const segments = k.split("/");
      if (segments[0] !== coll) continue;
      if (coll === "rooms" && segments.length !== 2) continue;
      const id = segments[1];
      if (op === "==" && data[field] === value) {
        out.push({ id, data: () => data, ref: { path: `${coll}/${id}` } });
      }
      if (op === "<=" && field === "lastMemberLeftAt") {
        const leftMs = timestampToMillis(data.lastMemberLeftAt);
        const cutoffMs = timestampToMillis(value);
        if (leftMs != null && cutoffMs != null && leftMs <= cutoffMs) {
          out.push({ id, data: () => data, ref: { path: `${coll}/${id}` } });
        }
      }
    }
    return out;
  };

  const db = {
    _docs: docs,
    _set: setDoc,
    _get: getDoc,
    collection(name) {
      return {
        doc(id) {
          const path = `${name}/${id}`;
          return {
            path,
            get: async () => getDoc(name, id),
            update: async (patch) => {
              const existing = getDoc(name, id);
              if (!existing.exists) throw new Error("not found");
              const next = { ...existing.data() };
              for (const [patchKey, patchValue] of Object.entries(patch)) {
                if (patchValue?.constructor?.name === "DeleteTransform") {
                  delete next[patchKey];
                } else if (patchValue?.constructor?.name === "ServerTimestampTransform") {
                  next[patchKey] = Timestamp.fromMillis(Date.now());
                } else {
                  next[patchKey] = patchValue;
                }
              }
              setDoc(name, id, next);
            },
            delete: async () => deleteDoc(name, id),
          };
        },
        where(field, op, value) {
          const chain = {
            limit(n) {
              return {
                get: async () => {
                  const matches = queryDocs(name, field, op, value).slice(0, n);
                  return { empty: matches.length === 0, docs: matches, size: matches.length };
                },
              };
            },
            get: async () => {
              const matches = queryDocs(name, field, op, value);
              return { empty: matches.length === 0, docs: matches, size: matches.length };
            },
          };
          return chain;
        },
      };
    },
    batch() {
      const ops = [];
      return {
        delete(ref) {
          ops.push(ref.path);
        },
        commit: async () => {
          for (const path of ops) {
            const [coll, id] = path.split("/");
            deleteDoc(coll, id);
          }
        },
      };
    },
    async recursiveDelete(ref) {
      const prefix = `${ref.path}/`;
      for (const k of [...docs.keys()]) {
        if (k === ref.path || k.startsWith(prefix)) {
          docs.delete(k);
        }
      }
    },
  };

  for (const [coll, id, data] of seed) {
    setDoc(coll, id, data);
  }

  return db;
}

describe("timestampToMillis + isLastMemberLeftAtExpired", () => {
  it("respects the 72h grace window", () => {
    const leftAt = Timestamp.fromMillis(1_000_000);
    assert.equal(isLastMemberLeftAtExpired(leftAt, 1_000_000 + ORPHAN_ROOM_GRACE_MS - 1), false);
    assert.equal(isLastMemberLeftAtExpired(leftAt, 1_000_000 + ORPHAN_ROOM_GRACE_MS), true);
  });
});

describe("markRoomOrphanedIfEmpty / handleRoomMemberDeleted", () => {
  let db;

  beforeEach(() => {
    db = createInMemoryDb([
      ["rooms", "room1", { inviteCode: "ABC-D23", status: "open" }],
      ["roomMembers", "room1_owner", { roomId: "room1", userId: "owner" }],
      ["roomMembers", "room1_guest", { roomId: "room1", userId: "guest" }],
    ]);
  });

  it("does not stamp when a non-last member leaves", async () => {
    db._docs.delete("roomMembers/room1_guest");

    const outcome = await handleRoomMemberDeleted(db, { roomId: "room1" });
    assert.equal(outcome.marked, false);
    assert.equal(outcome.reason, "has_members");
    assert.equal(db._get("rooms", "room1").data().lastMemberLeftAt, undefined);
  });

  it("stamps lastMemberLeftAt when the last member leaves", async () => {
    db._docs.delete("roomMembers/room1_guest");
    db._docs.delete("roomMembers/room1_owner");

    const outcome = await markRoomOrphanedIfEmpty(db, "room1");
    assert.equal(outcome.marked, true);
    assert.ok(db._get("rooms", "room1").data().lastMemberLeftAt);
  });
});

describe("clearRoomOrphanSignalOnJoin / handleRoomMemberCreated", () => {
  it("clears lastMemberLeftAt on rejoin", async () => {
    const leftAt = Timestamp.fromMillis(Date.now() - 10_000);
    const db = createInMemoryDb([
      ["rooms", "room1", { lastMemberLeftAt: leftAt }],
    ]);

    const outcome = await handleRoomMemberCreated(db, { roomId: "room1", userId: "owner" });
    assert.equal(outcome.cleared, true);
    assert.equal(db._get("rooms", "room1").data().lastMemberLeftAt, undefined);
  });
});

describe("isRoomEligibleForOrphanGc", () => {
  it("skips rooms still inside the grace window", async () => {
    const db = createInMemoryDb();
    const now = Date.now();
    const roomData = { lastMemberLeftAt: Timestamp.fromMillis(now - 60_000) };
    const outcome = await isRoomEligibleForOrphanGc(db, "room1", roomData, { nowMs: now });
    assert.equal(outcome.eligible, false);
    assert.equal(outcome.reason, "grace_period");
  });

  it("skips rooms that regained members after orphan signal", async () => {
    const db = createInMemoryDb([
      ["roomMembers", "room1_owner", { roomId: "room1", userId: "owner" }],
    ]);
    const now = Date.now();
    const roomData = {
      lastMemberLeftAt: Timestamp.fromMillis(now - ORPHAN_ROOM_GRACE_MS - 1),
    };
    const outcome = await isRoomEligibleForOrphanGc(db, "room1", roomData, { nowMs: now });
    assert.equal(outcome.eligible, false);
    assert.equal(outcome.reason, "has_members");
  });
});

describe("runOrphanRoomGc", () => {
  it("recursively deletes orphan room artifacts after grace", async () => {
    const now = Date.now();
    const leftAt = Timestamp.fromMillis(now - ORPHAN_ROOM_GRACE_MS - 60_000);
    const db = createInMemoryDb([
      ["rooms", "room1", { inviteCode: "abc-d23", lastMemberLeftAt: leftAt }],
      ["inviteLookups", "ABC-D23", { roomId: "room1" }],
      [
        PUBLIC_TABLE_INDEX_COLLECTION,
        "room1_sess1",
        { roomId: "room1", sessionId: "sess1", status: "open" },
      ],
    ]);
    db._docs.set("rooms/room1/sessions/sess1", { status: "in_progress" });

    const result = await runOrphanRoomGc(db, { nowMs: now });
    assert.equal(result.deleted, 1);
    assert.equal(result.skipped, 0);
    assert.equal(db._get("rooms", "room1").exists, false);
    assert.equal(db._docs.has("rooms/room1/sessions/sess1"), false);
    assert.equal(db._get("inviteLookups", "ABC-D23").exists, false);
    assert.equal(db._get(PUBLIC_TABLE_INDEX_COLLECTION, "room1_sess1").exists, false);
  });

  it("skips non-orphan rooms without lastMemberLeftAt", async () => {
    const db = createInMemoryDb([
      ["rooms", "active", { inviteCode: "ZZZ-999", status: "open" }],
      ["roomMembers", "active_owner", { roomId: "active", userId: "owner" }],
    ]);

    const result = await runOrphanRoomGc(db, { nowMs: Date.now() });
    assert.equal(result.deleted, 0);
    assert.equal(db._get("rooms", "active").exists, true);
  });
});

describe("deleteOrphanRoomArtifacts", () => {
  it("removes invite lookup and public index before recursive room delete", async () => {
    const db = createInMemoryDb([
      ["rooms", "room1", { inviteCode: "INV-001" }],
      ["inviteLookups", "INV-001", { roomId: "room1" }],
      [PUBLIC_TABLE_INDEX_COLLECTION, "room1_s1", { roomId: "room1" }],
    ]);

    const outcome = await deleteOrphanRoomArtifacts(db, "room1", { inviteCode: "INV-001" });
    assert.equal(outcome.deleted, true);
    assert.equal(outcome.indexDocs, 1);
    assert.equal(db._get("rooms", "room1").exists, false);
    assert.equal(db._get("inviteLookups", "INV-001").exists, false);
    assert.equal(db._get(PUBLIC_TABLE_INDEX_COLLECTION, "room1_s1").exists, false);
  });
});
