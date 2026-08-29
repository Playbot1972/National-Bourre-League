/**
 * Opt-in play diagnostics for the table bundle (mirrors docs/table-play-debug.js).
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

export function isTablePlayDebugEnabled(): boolean {
  try {
    return (
      typeof localStorage !== "undefined" &&
      localStorage.getItem(DEBUG_FLAG_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function sanitizeTablePlayDebugPayload(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload ?? {})) {
    if (!ALLOWED_LOG_KEYS.has(key)) continue;
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

export function logTablePlayDebug(payload: Record<string, unknown>): void {
  if (!isTablePlayDebugEnabled()) return;
  try {
    const sanitized = sanitizeTablePlayDebugPayload(payload);
    console.info("[table-play]", sanitized);
  } catch {
    /* ignore */
  }
}
