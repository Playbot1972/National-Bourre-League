/**
 * Session hand document reference helpers (rooms/{roomId}/sessions/{sessionId}).
 * Pure id/path validation is testable without Firebase.
 */

export function validateSessionHandIds(roomId, sessionId) {
  const rid = typeof roomId === "string" ? roomId.trim() : "";
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!rid || !sid) return null;
  if (rid.includes("/") || sid.includes("/")) return null;
  return {
    roomId: rid,
    sessionId: sid,
    path: `rooms/${rid}/sessions/${sid}`,
  };
}

/**
 * @param {(roomId: string, sessionId: string) => import('firebase/firestore').DocumentReference} sessionDocFn
 */
export function resolveSessionHandRef(roomId, sessionId, sessionDocFn) {
  const ids = validateSessionHandIds(roomId, sessionId);
  if (!ids) return null;
  const handRef = sessionDocFn(ids.roomId, ids.sessionId);
  if (!handRef || typeof handRef.path !== "string" || !handRef.path) {
    return null;
  }
  if (handRef.path !== ids.path) {
    return null;
  }
  return { ...ids, handRef };
}
