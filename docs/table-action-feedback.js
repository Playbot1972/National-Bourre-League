/**
 * Table action feedback — friendly errors and stale-banner detection.
 */

/** @typedef {"play" | "draw" | "fold" | "enrollment" | "reveal" | "private_hand" | "settlement" | "other"} TableActionKind */

/**
 * @typedef {object} TableActionErrorContext
 * @property {number | null} [handNumber]
 * @property {string | null} [phase]
 * @property {string | null} [turnPlayerId]
 * @property {TableActionKind | null} [actionKind]
 * @property {number} [atMs]
 */

/**
 * @typedef {object} TableSessionFeedbackState
 * @property {number | null} [handNumber]
 * @property {string | null} [phase]
 * @property {string | null} [turnPlayerId]
 * @property {boolean} [handComplete]
 */

/**
 * Map raw Firebase / server errors to player-facing copy.
 * @param {unknown} err
 * @param {string} fallback
 * @param {(err: unknown, fallback?: string) => string} formatClientGameError
 */
export function formatTableActionError(err, fallback, formatClientGameError) {
  return formatClientGameError(err, fallback);
}

/**
 * Last-resort scrub for messages already stored as raw INTERNAL.
 * @param {string | null | undefined} message
 */
export function scrubRawInternalMessage(message) {
  const text = String(message ?? "").trim();
  if (!text) return text;
  const lower = text.toLowerCase();
  if (lower === "internal" || lower.includes("internal error")) {
    return "The server could not finish that table action. Refresh the page and try again.";
  }
  return text;
}

/**
 * True when a bottom-hand error banner should clear because table state moved on.
 * @param {TableActionErrorContext | null | undefined} errorContext
 * @param {TableSessionFeedbackState} session
 */
export function isStaleTableActionError(errorContext, session) {
  if (!errorContext) return false;

  if (
    errorContext.handNumber != null &&
    session.handNumber != null &&
    errorContext.handNumber !== session.handNumber
  ) {
    return true;
  }

  if (session.handComplete) {
    return true;
  }

  if (
    errorContext.phase != null &&
    session.phase != null &&
    errorContext.phase !== session.phase
  ) {
    return true;
  }

  if (
    session.phase === "play" &&
    errorContext.phase === "play" &&
    errorContext.turnPlayerId != null &&
    session.turnPlayerId != null &&
    errorContext.turnPlayerId !== session.turnPlayerId &&
    (errorContext.actionKind === "play" || errorContext.actionKind === "other")
  ) {
    return true;
  }

  if (errorContext.phase === "reveal" && session.phase != null && session.phase !== "reveal") {
    return true;
  }

  if (
    (errorContext.phase === "decision" || errorContext.actionKind === "enrollment") &&
    session.phase != null &&
    session.phase !== "decision" &&
    session.phase !== errorContext.phase
  ) {
    return true;
  }

  return false;
}
