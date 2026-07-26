/**
 * Public-table idle policy UI helpers (client display only).
 * Enforcement is server-authoritative via lastActivityTimestamp.
 */

import { isPublicTableSession } from "./public-table-rollout.js";

/** @returns {'active'|'sitting_out'|'removed'} */
export function publicTableIdleSeatStatus(scoreRow) {
  if (scoreRow?.idleRemovedAt) return "removed";
  if (scoreRow?.sitOut === true) return "sitting_out";
  return "active";
}

export function publicTableIdleSeatLabel(scoreRow) {
  const status = publicTableIdleSeatStatus(scoreRow);
  if (status === "sitting_out") return "Sitting Out";
  if (status === "removed") return "Removed – Seat Open";
  return null;
}

/** Banner for local hero when removed from public table seating. */
export function publicTableHeroIdleBanner(sessionData, myUid, scoreRow, { removedNotice = false } = {}) {
  if (!isPublicTableSession(sessionData) || !myUid) return null;
  if (!scoreRow) {
    if (removedNotice) {
      return "Removed for inactivity — use Play Now to rejoin.";
    }
    const pending = sessionData?.pendingJoins?.[myUid];
    if (pending?.cancelReason === "idle_removal") {
      return "Removed for inactivity — use Play Now to rejoin.";
    }
    return null;
  }
  const status = publicTableIdleSeatStatus(scoreRow);
  if (status === "sitting_out") {
    return "Sitting out for inactivity — tap or play to return.";
  }
  if (status === "removed") {
    return "Removed for inactivity — use Play Now to rejoin.";
  }
  return null;
}
