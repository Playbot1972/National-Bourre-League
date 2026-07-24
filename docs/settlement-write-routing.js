/**
 * Settlement / bankroll write routing — fail closed on server rejection.
 * Pure helpers (no Firestore imports) for callSettlementOrClient.
 */

import { isInternalTableActionError } from "./table-action-feedback.js";

/** Callable rejected the settlement (validation, auth, state). Never client-fallback. */
export function isSettlementServerRejection(err) {
  const code = String(err?.code ?? "");
  return (
    code === "functions/failed-precondition" ||
    code === "functions/invalid-argument" ||
    code === "functions/permission-denied" ||
    code === "functions/unauthenticated" ||
    code === "functions/already-exists" ||
    code === "functions/resource-exhausted" ||
    code === "functions/out-of-range"
  );
}

/**
 * Genuine Cloud Function transport/unavailability — safe to try client batch fallback.
 * Narrower than game/enrollment unavailability: excludes broad "internal" message matching.
 */
export function isSettlementCloudFunctionUnavailable(err) {
  const code = String(err?.code ?? "");
  if (
    code === "functions/not-found" ||
    code === "functions/unavailable" ||
    code === "functions/deadline-exceeded"
  ) {
    return true;
  }
  const msg = String(err?.message ?? err).toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("network error") ||
    msg.includes("network request failed") ||
    (msg.includes("not found") && msg.includes("404"))
  );
}

/**
 * Whether a failed server settlement call may fall back to the client batch path.
 * Server validation/auth rejections and internal errors must not silently re-write.
 */
export function shouldSettlementFallbackToClient(serverErr) {
  if (isSettlementServerRejection(serverErr)) return false;
  if (isInternalTableActionError(serverErr)) return false;
  return isSettlementCloudFunctionUnavailable(serverErr);
}
