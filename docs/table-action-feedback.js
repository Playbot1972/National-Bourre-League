/**
 * Table action feedback — friendly errors and stale-banner detection.
 */

/** @typedef {"play" | "draw" | "fold" | "enrollment" | "reveal" | "private_hand" | "settlement" | "other"} TableActionKind */

/**
 * Race / idempotency failures that mean the table already moved on — not player-facing errors.
 * @param {unknown} err
 */
export function isBenignTableActionError(err) {
  const ledgerDetailCode = extractLedgerBlockedDetailCode(err);
  if (
    ledgerDetailCode === "TABLE_CHIP_INVARIANT_MISMATCH" ||
    ledgerDetailCode === "POST_COMMIT_INVARIANT_DRIFT"
  ) {
    return false;
  }
  const msg = String(err?.message ?? err ?? "").trim();
  if (!msg) return false;
  const lower = msg.toLowerCase();
  const code = String(err?.code ?? "").toLowerCase();
  if (
    lower.includes("not in reveal") ||
    lower.includes("decision step did not apply") ||
    lower.includes("enrollment step did not apply") ||
    lower.includes("draw already completed") ||
    lower.includes("not your turn to draw") ||
    lower.includes("not in draw phase") ||
    lower.includes("not in trick-play") ||
    lower.includes("illegal phase transition") ||
    lower.includes("bot private hand missing") ||
    lower.includes("enrollment step did not apply")
  ) {
    return true;
  }
  if (
    code === "functions/failed-precondition" &&
    (lower.includes("not in reveal") || lower.includes("decision step did not apply"))
  ) {
    return true;
  }
  return false;
}

/** Session-scoped latch — stop settlement retry loops after ledger invariant failure. */
const settlementLedgerBlocked = new Map();

/**
 * Mark a session as blocked from further settlement attempts.
 * @param {string} sessionId
 * @param {string} code
 */
export function markSettlementLedgerBlocked(sessionId, code) {
  if (!sessionId || !code) return;
  settlementLedgerBlocked.set(sessionId, code);
}

/** @param {string} sessionId */
export function isSettlementLedgerBlocked(sessionId) {
  return settlementLedgerBlocked.has(sessionId);
}

/** @param {string} sessionId */
export function getSettlementLedgerBlockedCode(sessionId) {
  return settlementLedgerBlocked.get(sessionId) ?? null;
}

/** @param {string} sessionId */
export function clearSettlementLedgerBlocked(sessionId) {
  settlementLedgerBlocked.delete(sessionId);
}

/**
 * Structured ledger invariant failures from gameRecordHand (not benign, not INTERNAL).
 * @param {unknown} err
 */
/** Extract structured settlement invariant code from callable / server errors. */
export function extractLedgerBlockedDetailCode(err) {
  const detail = err?.details ?? err?.customData ?? null;
  if (detail && typeof detail === "object" && detail.code) {
    return detail.code;
  }
  return null;
}

export function isLedgerBlockedTableError(err) {
  const code = String(err?.code ?? "").toLowerCase();
  if (code !== "functions/failed-precondition") return false;
  const detailCode = extractLedgerBlockedDetailCode(err);
  return (
    detailCode === "TABLE_CHIP_INVARIANT_MISMATCH" ||
    detailCode === "POST_COMMIT_INVARIANT_DRIFT"
  );
}

/** @param {string | undefined} detailCode */
export function ledgerBlockedUserMessage(detailCode) {
  if (detailCode === "TABLE_CHIP_INVARIANT_MISMATCH") {
    return "Settlement was not applied because this table's chip records do not reconcile.";
  }
  if (detailCode === "POST_COMMIT_INVARIANT_DRIFT") {
    return "The hand was recorded, but this table requires an accounting review. Do not retry settlement.";
  }
  return "Settlement is blocked until this table's ledger is reviewed.";
}

/**
 * @typedef {object} TableActionErrorContext
 * @property {number | null} [handNumber]
 * @property {string | null} [phase]
 * @property {string | null} [turnPlayerId]
 * @property {TableActionKind | null} [actionKind]
 * @property {number} [atMs]
 * @property {number | null} [totalTricksPlayed]
 * @property {number | null} [currentTrickLen]
 * @property {number | null} [drawCompletedCount]
 */

/**
 * @typedef {object} TableSessionFeedbackState
 * @property {number | null} [handNumber]
 * @property {string | null} [phase]
 * @property {string | null} [turnPlayerId]
 * @property {boolean} [handComplete]
 * @property {number | null} [totalTricksPlayed]
 * @property {number | null} [currentTrickLen]
 * @property {number | null} [drawCompletedCount]
 */

/**
 * True for Firebase callable INTERNAL failures (often post-success bot/settlement noise).
 * @param {unknown} err
 */
export function isInternalTableActionError(err) {
  const code = String(err?.code ?? "").toLowerCase();
  const msg = String(err?.message ?? err ?? "").trim().toLowerCase();
  return (
    code === "functions/internal" ||
    code === "functions/unknown" ||
    msg === "internal" ||
    msg.includes("internal error")
  );
}

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

  if (
    errorContext.totalTricksPlayed != null &&
    session.totalTricksPlayed != null &&
    session.totalTricksPlayed > errorContext.totalTricksPlayed
  ) {
    return true;
  }

  if (
    errorContext.currentTrickLen != null &&
    session.currentTrickLen != null &&
    session.currentTrickLen !== errorContext.currentTrickLen &&
    (errorContext.actionKind === "play" || errorContext.phase === "play")
  ) {
    return true;
  }

  if (
    errorContext.actionKind === "draw" &&
    errorContext.turnPlayerId != null &&
    session.turnPlayerId != null &&
    errorContext.turnPlayerId !== session.turnPlayerId
  ) {
    return true;
  }

  if (
    errorContext.actionKind === "draw" &&
    errorContext.drawCompletedCount != null &&
    session.drawCompletedCount != null &&
    session.drawCompletedCount > errorContext.drawCompletedCount
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
