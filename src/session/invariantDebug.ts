/**
 * Hand/session invariant diagnostics — loud in dev/test, quiet in production unless opted in.
 *
 * Enable strict checks:
 * - Node: NBL_INVARIANTS=1
 * - Browser: localStorage nbl-invariants=1 or ?invariants=1
 */

const DEBUG_KEY = "nbl-invariants";

let invariantsForced = false;

/** Node/tests only — force strict invariant failures without env flags. */
export function forceInvariantsForTests(enabled = true): () => void {
  const prev = invariantsForced;
  invariantsForced = enabled;
  return () => {
    invariantsForced = prev;
  };
}

export function isInvariantsStrict(): boolean {
  if (invariantsForced) return true;
  if (typeof process !== "undefined" && process.env?.NBL_INVARIANTS === "1") return true;
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") return true;
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage?.getItem(DEBUG_KEY) === "1") return true;
    return new URLSearchParams(window.location.search).has("invariants");
  } catch {
    return false;
  }
}

export function logInvariantViolation(
  code: string,
  message: string,
  context?: Record<string, unknown>,
): void {
  console.warn("[nbl-invariant]", code, message, context ?? {});
}
