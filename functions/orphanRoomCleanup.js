/**
 * Orphan-room retention: signal when the last member leaves, then GC after grace.
 *
 * Tier A only — rooms with zero members and lastMemberLeftAt older than the grace window.
 * Active / resumable rooms are excluded because they still have roomMembers rows.
 */
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { PUBLIC_TABLE_INDEX_COLLECTION } from "./vendor/public-table-schema.js";

/** Grace period before an orphaned room may be deleted (72 hours). */
export const ORPHAN_ROOM_GRACE_MS = 72 * 60 * 60 * 1000;

/** Max rooms processed per scheduled run (conservative batch). */
export const ORPHAN_GC_BATCH_LIMIT = 25;

export function timestampToMillis(value) {
  if (value == null) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value.seconds === "number") {
    return value.seconds * 1000 + Math.floor((value.nanoseconds ?? 0) / 1e6);
  }
  return null;
}

export function isLastMemberLeftAtExpired(lastMemberLeftAt, nowMs, graceMs = ORPHAN_ROOM_GRACE_MS) {
  const leftMs = timestampToMillis(lastMemberLeftAt);
  if (leftMs == null) return false;
  return leftMs + graceMs <= nowMs;
}

function normalizeInviteCode(code) {
  if (typeof code !== "string") return "";
  return code.trim().toUpperCase();
}

/** True when at least one roomMembers row exists for the room. */
export async function roomHasMembers(db, roomId) {
  if (!roomId) return false;
  const snap = await db.collection("roomMembers").where("roomId", "==", roomId).limit(1).get();
  return !snap.empty;
}

/**
 * Phase 1: when the last member leaves, stamp the room for future GC.
 * @returns {Promise<{ marked: boolean, reason?: string }>}
 */
export async function markRoomOrphanedIfEmpty(db, roomId) {
  if (!roomId) return { marked: false, reason: "missing_room_id" };
  if (await roomHasMembers(db, roomId)) {
    return { marked: false, reason: "has_members" };
  }

  const roomRef = db.collection("rooms").doc(roomId);
  const roomSnap = await roomRef.get();
  if (!roomSnap.exists) {
    return { marked: false, reason: "room_missing" };
  }

  await roomRef.update({ lastMemberLeftAt: FieldValue.serverTimestamp() });
  return { marked: true };
}

/**
 * Clear orphan signal when someone joins — room is no longer orphaned.
 * @returns {Promise<{ cleared: boolean, reason?: string }>}
 */
export async function clearRoomOrphanSignalOnJoin(db, roomId) {
  if (!roomId) return { cleared: false, reason: "missing_room_id" };

  const roomRef = db.collection("rooms").doc(roomId);
  const roomSnap = await roomRef.get();
  if (!roomSnap.exists) return { cleared: false, reason: "room_missing" };
  if (!roomSnap.data()?.lastMemberLeftAt) {
    return { cleared: false, reason: "no_signal" };
  }

  await roomRef.update({ lastMemberLeftAt: FieldValue.delete() });
  return { cleared: true };
}

/**
 * Tier A eligibility — both grace elapsed and zero members required.
 */
export async function isRoomEligibleForOrphanGc(
  db,
  roomId,
  roomData,
  { nowMs = Date.now(), graceMs = ORPHAN_ROOM_GRACE_MS } = {},
) {
  if (!roomId || !roomData) return { eligible: false, reason: "missing_data" };
  if (!isLastMemberLeftAtExpired(roomData.lastMemberLeftAt, nowMs, graceMs)) {
    return { eligible: false, reason: "grace_period" };
  }
  if (await roomHasMembers(db, roomId)) {
    return { eligible: false, reason: "has_members" };
  }
  return { eligible: true };
}

/**
 * Delete an orphan room and related artifacts (invite lookup, public index).
 * Caller must verify eligibility first.
 */
export async function deleteOrphanRoomArtifacts(db, roomId, roomData) {
  if (!roomId) throw new Error("deleteOrphanRoomArtifacts: missing roomId");

  const inviteCode = normalizeInviteCode(roomData?.inviteCode);

  const indexSnap = await db
    .collection(PUBLIC_TABLE_INDEX_COLLECTION)
    .where("roomId", "==", roomId)
    .get();

  if (!indexSnap.empty) {
    const batch = db.batch();
    for (const doc of indexSnap.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();
  }

  if (inviteCode) {
    try {
      await db.collection("inviteLookups").doc(inviteCode).delete();
    } catch {
      // Best-effort — room recursive delete proceeds regardless.
    }
  }

  const roomRef = db.collection("rooms").doc(roomId);
  await db.recursiveDelete(roomRef);

  return {
    deleted: true,
    roomId,
    inviteCode: inviteCode || null,
    indexDocs: indexSnap.size,
  };
}

/**
 * Phase 2 scheduled GC — orphan rooms only (Tier A).
 */
export async function runOrphanRoomGc(
  db,
  { nowMs = Date.now(), graceMs = ORPHAN_ROOM_GRACE_MS, batchLimit = ORPHAN_GC_BATCH_LIMIT } = {},
) {
  const cutoff = Timestamp.fromMillis(nowMs - graceMs);
  const snap = await db
    .collection("rooms")
    .where("lastMemberLeftAt", "<=", cutoff)
    .limit(batchLimit)
    .get();

  const result = { scanned: snap.size, deleted: 0, skipped: 0, errors: [] };

  for (const roomDoc of snap.docs) {
    const roomId = roomDoc.id;
    const roomData = roomDoc.data();
    try {
      const eligibility = await isRoomEligibleForOrphanGc(db, roomId, roomData, {
        nowMs,
        graceMs,
      });
      if (!eligibility.eligible) {
        result.skipped += 1;
        continue;
      }
      await deleteOrphanRoomArtifacts(db, roomId, roomData);
      result.deleted += 1;
    } catch (err) {
      result.errors.push({ roomId, message: err?.message ?? String(err) });
    }
  }

  return result;
}

/** Firestore onDelete handler body. */
export async function handleRoomMemberDeleted(db, deletedMemberData) {
  return markRoomOrphanedIfEmpty(db, deletedMemberData?.roomId);
}

/** Firestore onCreate handler body — clears stale orphan signal on rejoin. */
export async function handleRoomMemberCreated(db, memberData) {
  return clearRoomOrphanSignalOnJoin(db, memberData?.roomId);
}
