/**
 * Play Now / table-open async helpers (pure, no Firebase).
 */

export const SESSION_PLAY_RETRY_ATTEMPTS = 3;
export const SESSION_PLAY_RETRY_DELAY_MS = 200;
export const WAIT_UNTIL_STABLE_TICKS = 2;

/**
 * Poll until predicate returns true for `stableTicks` consecutive checks.
 */
export function waitUntilStable(
  predicate,
  {
    stableTicks = WAIT_UNTIL_STABLE_TICKS,
    timeoutMs = 20_000,
    intervalMs = 80,
    label = "operation",
  } = {},
) {
  return new Promise((resolve, reject) => {
    let consecutive = 0;
    const started = Date.now();
    const tick = () => {
      try {
        if (predicate()) {
          consecutive += 1;
          if (consecutive >= stableTicks) return resolve();
        } else {
          consecutive = 0;
        }
      } catch (err) {
        reject(err);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`${label} timed out`));
        return;
      }
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

/**
 * Whether session play can proceed (used by triggerSessionPlay retry loop).
 */
export function canTriggerSessionPlay({
  sessionPlayInFlight,
  tablePlayOpen,
  sessionObj,
  readyCount,
}) {
  if (sessionPlayInFlight || tablePlayOpen) return false;
  if (!sessionObj || sessionObj.status === "final") return false;
  return readyCount >= 2;
}
