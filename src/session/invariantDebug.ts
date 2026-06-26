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

function nodeEnv(name: string): string | undefined {
  const g = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return g.process?.env?.[name];
}

export function isInvariantsStrict(): boolean {
  if (invariantsForced) return true;
  if (nodeEnv("NBL_INVARIANTS") === "1") return true;
  if (nodeEnv("NODE_ENV") === "test") return true;
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
