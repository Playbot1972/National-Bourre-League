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
    return {
      turnKey: key,
      chosenDelayMs,
      elapsedSinceTurnMs,
      trickGapRemainingMs: 0,
      delayMs: remainingTurnMs,
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
 * Play-phase think scheduler — single pending timer per turn key, generation cancel.
 *
 * @param {object} [options]
 * @param {() => number} [options.rng]
 */
export function createBotThinkScheduleState(options = {}) {
  const playDelayState = createBotPlayDelayState(options);
  let scheduledTimer = null;
  let scheduleGeneration = 0;
  let pendingTurnKey = null;
  let pendingChosenDelayMs = null;

  function clearTimer() {
    if (scheduledTimer) {
      clearTimeout(scheduledTimer);
      scheduledTimer = null;
    }
  }

  /**
   * @param {object} input
   * @param {string} [input.reason]
   * @param {(extra: object) => void} [input.onCanceled]
   */
  function cancelPending({ reason = "canceled", onCanceled } = {}) {
    if (!scheduledTimer && !pendingTurnKey) return false;
    scheduleGeneration += 1;
    const extra = {
      reason,
      turnKey: pendingTurnKey,
      generation: scheduleGeneration,
      chosenDelayMs: pendingChosenDelayMs,
    };
    clearTimer();
    pendingTurnKey = null;
    pendingChosenDelayMs = null;
    onCanceled?.(extra);
    return true;
  }

  /**
   * @param {object} input
   * @param {{ handNumber: number, trickNumber: number|null, turnPlayerId: string|null }} input.ctx
   * @param {number} input.nowMs
   * @param {() => boolean} input.shouldFire
   * @param {(payload: { turnKey: string, generation: number, plan: object }) => void} input.onFire
   * @param {{ armed?: Function, coalesced?: Function, rejected?: Function, accepted?: Function }} [input.log]
   */
  function armPlayThink({ ctx, nowMs, shouldFire, onFire, log }) {
    const turnKey = botPlayTurnKey(ctx);
    if (scheduledTimer && pendingTurnKey === turnKey) {
      log?.coalesced?.({
        turnKey,
        generation: scheduleGeneration,
        chosenDelayMs: pendingChosenDelayMs,
      });
      return { action: "coalesced", turnKey, generation: scheduleGeneration };
    }

    if (scheduledTimer || pendingTurnKey) {
      cancelPending({
        reason: "superseded",
        onCanceled: (extra) => log?.canceled?.({ ...extra, trigger: "superseded" }),
      });
    }

    const plan = playDelayState.resolvePlayDelayMs({
      handNumber: ctx.handNumber,
      trickNumber: ctx.trickNumber,
      turnPlayerId: ctx.turnPlayerId,
      nowMs,
    });
    const generation = scheduleGeneration;
    pendingTurnKey = turnKey;
    pendingChosenDelayMs = plan.chosenDelayMs;

    log?.armed?.({
      turnKey,
      generation,
      chosenDelayMs: plan.chosenDelayMs,
      delayMs: plan.delayMs,
      elapsedSinceTurnMs: plan.elapsedSinceTurnMs,
    });

    scheduledTimer = setTimeout(() => {
      scheduledTimer = null;
      if (generation !== scheduleGeneration) return;
      if (pendingTurnKey !== turnKey) return;
      pendingTurnKey = null;
      pendingChosenDelayMs = null;

      if (!shouldFire()) {
        log?.rejected?.({
          turnKey,
          generation,
          chosenDelayMs: plan.chosenDelayMs,
        });
        return;
      }

      log?.accepted?.({
        turnKey,
        generation,
        chosenDelayMs: plan.chosenDelayMs,
        delayMs: plan.delayMs,
      });
      onFire({ turnKey, generation, plan });
    }, plan.delayMs);

    return { action: "armed", turnKey, generation, ...plan };
  }

  return {
    playDelayState,
    armPlayThink,
    cancelPending,
    get pendingTurnKey() {
      return pendingTurnKey;
    },
    get generation() {
      return scheduleGeneration;
    },
  };
}

/**
 * @param {object} input
 * @param {"play"|string|null|undefined} input.handPhase
 * @param {ReturnType<typeof createBotPlayDelayState>} input.playDelayState
 * @param {object} input.ctx — handNumber, trickNumber, turnPlayerId
 * @param {number} input.nowMs
 */
export function resolveBotAdvanceDelayMs(input) {
  if (input.handPhase === "play") {
    return {
      ...input.playDelayState.resolvePlayDelayMs({
        handNumber: input.ctx.handNumber,
        trickNumber: input.ctx.trickNumber,
        turnPlayerId: input.ctx.turnPlayerId,
        nowMs: input.nowMs,
      }),
      handPhase: "play",
    };
  }

  return {
    handPhase: input.handPhase ?? null,
    turnKey: null,
    chosenDelayMs: BOT_ADVANCE_DEBOUNCE_MS,
    elapsedSinceTurnMs: 0,
    trickGapRemainingMs: 0,
    delayMs: BOT_ADVANCE_DEBOUNCE_MS,
  };
}
