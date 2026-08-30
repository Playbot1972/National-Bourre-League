/**
 * Opt-in production-safe play diagnostics (metadata only).
 * Enable: localStorage.setItem("nbl-table-play-debug", "1")
 */

const DEBUG_FLAG_KEY = "nbl-table-play-debug";

const ALLOWED_LOG_KEYS = new Set([
  "event",
  "roomId",
  "sessionId",
  "handNumber",
  "trickNumber",
  "currentUserId",
  "turnPlayerId",
  "isMyTurn",
  "suppressTurn",
  "playInteractive",
  "legalPlayIndicesCount",
  "displayIndex",
  "effectiveIndex",
  "busy",
  "playLock",
  "playingIndex",
  "callable",
  "callableStatus",
  "errorCode",
  "fallbackAttempted",
  "reason",
]);

export function isTablePlayDebugEnabled() {
  try {
    return (
      typeof localStorage !== "undefined" &&
      localStorage.getItem(DEBUG_FLAG_KEY) === "1"
    );
  } catch {
    return false;
  }
}

/**
 * @param {Record<string, unknown>} payload
 */
export function sanitizeTablePlayDebugPayload(payload) {
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [key, value] of Object.entries(payload ?? {})) {
    if (!ALLOWED_LOG_KEYS.has(key)) continue;
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

/**
 * @param {Record<string, unknown>} payload
 */
export function logTablePlayDebug(payload) {
  if (!isTablePlayDebugEnabled()) return;
  try {
    const sanitized = sanitizeTablePlayDebugPayload(payload);
    console.info("[table-play]", sanitized);
  } catch {
    /* ignore */
  }
}
