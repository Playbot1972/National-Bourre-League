/**
 * Bot play-phase think delay — random 1–3s per turn instance, minimum 1s from eligibility.
 */

export const BOT_PLAY_DELAY_MIN_MS = 1000;
export const BOT_PLAY_DELAY_MAX_MS = 3000;
export const BOT_ADVANCE_DEBOUNCE_MS = 150;

export function botPlayTurnKey({ handNumber, trickNumber, turnPlayerId }) {
  return `${handNumber ?? 0}:${trickNumber ?? 0}:${turnPlayerId ?? ""}`;
}

/**
 * @param {object} [options]
 * @param {() => number} [options.rng]
 */
export function createBotPlayDelayState(options = {}) {
  const rng = options.rng ?? Math.random;
  let trackedHandNumber = null;
  let turnEligibleKey = null;
  let turnEligibleAtMs = 0;
  const delayByTurnKey = new Map();

  function syncHand(handNumber) {
    if (trackedHandNumber === handNumber) return;
    trackedHandNumber = handNumber;
    turnEligibleKey = null;
    turnEligibleAtMs = 0;
    delayByTurnKey.clear();
  }

  function markTurnEligible({ handNumber, trickNumber, turnPlayerId, nowMs }) {
    syncHand(handNumber);
    const key = botPlayTurnKey({ handNumber, trickNumber, turnPlayerId });
    if (turnEligibleKey !== key) {
      turnEligibleKey = key;
      turnEligibleAtMs = nowMs;
    }
    return key;
  }

  function pickDelayForKey(key) {
    let chosen = delayByTurnKey.get(key);
    if (chosen == null) {
      const span = BOT_PLAY_DELAY_MAX_MS - BOT_PLAY_DELAY_MIN_MS + 1;
      chosen = BOT_PLAY_DELAY_MIN_MS + Math.floor(rng() * span);
      delayByTurnKey.set(key, chosen);
    }
    return chosen;
  }

  /**
   * @param {object} input
   * @param {number} input.handNumber
   * @param {number|null|undefined} input.trickNumber
   * @param {string|null|undefined} input.turnPlayerId
   * @param {number} input.nowMs
   * @param {number} input.lastCompletedAtMs
   * @param {number} input.trickIntervalMs
   */
  function resolvePlayDelayMs(input) {
    syncHand(input.handNumber);
    const key = markTurnEligible({
      handNumber: input.handNumber,
      trickNumber: input.trickNumber,
      turnPlayerId: input.turnPlayerId,
      nowMs: input.nowMs,
    });
    const chosenDelayMs = pickDelayForKey(key);
    const elapsedSinceTurnMs = input.nowMs - turnEligibleAtMs;
    const remainingTurnMs = Math.max(0, chosenDelayMs - elapsedSinceTurnMs);
    const elapsedSinceCompleteMs = input.nowMs - input.lastCompletedAtMs;
    const trickGapRemainingMs =
      input.trickIntervalMs > 0
        ? Math.max(0, input.trickIntervalMs - elapsedSinceCompleteMs)
        : 0;
    const delayMs = Math.max(remainingTurnMs, trickGapRemainingMs);
    return {
      turnKey: key,
      chosenDelayMs,
      elapsedSinceTurnMs,
      trickGapRemainingMs,
      delayMs,
    };
  }

  return {
    syncHand,
    markTurnEligible,
    resolvePlayDelayMs,
    delayByTurnKey,
  };
}

/**
 * @param {object} input
 * @param {"play"|string|null|undefined} input.handPhase
 * @param {ReturnType<typeof createBotPlayDelayState>} input.playDelayState
 * @param {object} input.ctx — handNumber, trickNumber, turnPlayerId
 * @param {number} input.nowMs
 * @param {number} input.lastCompletedAtMs
 * @param {number} input.trickIntervalMs
 */
export function resolveBotAdvanceDelayMs(input) {
  if (input.handPhase === "play") {
    return {
      ...input.playDelayState.resolvePlayDelayMs({
        handNumber: input.ctx.handNumber,
        trickNumber: input.ctx.trickNumber,
        turnPlayerId: input.ctx.turnPlayerId,
        nowMs: input.nowMs,
        lastCompletedAtMs: input.lastCompletedAtMs,
        trickIntervalMs: input.trickIntervalMs,
      }),
      handPhase: "play",
    };
  }

  const elapsedSinceCompleteMs = input.nowMs - input.lastCompletedAtMs;
  const delayMs = Math.max(BOT_ADVANCE_DEBOUNCE_MS, 0);
  void elapsedSinceCompleteMs;
  return {
    handPhase: input.handPhase ?? null,
    turnKey: null,
    chosenDelayMs: BOT_ADVANCE_DEBOUNCE_MS,
    elapsedSinceTurnMs: 0,
    trickGapRemainingMs: 0,
    delayMs,
  };
}
