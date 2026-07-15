/**
 * Bot play-phase think delay — brief pause so plays do not feel instant; much faster than humans.
 * Scaled by BOT_THINK_PACING_MULTIPLIER (3× readable pacing vs baseline).
 */

export const BOT_THINK_PACING_MULTIPLIER = 3;

const BASE_BOT_PLAY_DELAY_MIN_MS = 250;
const BASE_BOT_PLAY_DELAY_MAX_MS = 700;
const BASE_BOT_PLAY_LAST_CARD_MIN_MS = 100;
const BASE_BOT_PLAY_LAST_CARD_MAX_MS = 300;

export const BOT_PLAY_DELAY_MIN_MS = BASE_BOT_PLAY_DELAY_MIN_MS * BOT_THINK_PACING_MULTIPLIER;
export const BOT_PLAY_DELAY_MAX_MS = BASE_BOT_PLAY_DELAY_MAX_MS * BOT_THINK_PACING_MULTIPLIER;
export const BOT_PLAY_LAST_CARD_MIN_MS = BASE_BOT_PLAY_LAST_CARD_MIN_MS * BOT_THINK_PACING_MULTIPLIER;
export const BOT_PLAY_LAST_CARD_MAX_MS = BASE_BOT_PLAY_LAST_CARD_MAX_MS * BOT_THINK_PACING_MULTIPLIER;
export const BOT_ADVANCE_DEBOUNCE_MS = 150;

export function botPlayTurnKey({ handNumber, trickNumber, turnPlayerId }) {
  return `${handNumber ?? 0}:${trickNumber ?? 0}:${turnPlayerId ?? ""}`;
}

/**
 * @param {number} min
 * @param {number} max
 * @param {() => number} [rng]
 */
export function randomIntInclusive(min, max, rng = Math.random) {
  const span = max - min + 1;
  return min + Math.floor(rng() * span);
}

/**
 * @param {number|null|undefined} remainingHandCount
 * @param {() => number} [rng]
 */
export function pickBotPlayDelayMs(remainingHandCount, rng = Math.random) {
  const isLastCard = remainingHandCount === 1;
  const chosenDelayMs = isLastCard
    ? randomIntInclusive(BOT_PLAY_LAST_CARD_MIN_MS, BOT_PLAY_LAST_CARD_MAX_MS, rng)
    : randomIntInclusive(BOT_PLAY_DELAY_MIN_MS, BOT_PLAY_DELAY_MAX_MS, rng);
  return {
    chosenDelayMs,
    isLastCard,
    remainingHandCount: remainingHandCount ?? null,
  };
}

function delayCacheKey(turnKey, remainingHandCount) {
  return `${turnKey}:r${remainingHandCount ?? "?"}`;
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

  function pickDelayForKey(turnKey, remainingHandCount) {
    const cacheKey = delayCacheKey(turnKey, remainingHandCount);
    let chosen = delayByTurnKey.get(cacheKey);
    let meta = null;
    if (chosen == null) {
      meta = pickBotPlayDelayMs(remainingHandCount, rng);
      chosen = meta.chosenDelayMs;
      delayByTurnKey.set(cacheKey, chosen);
    }
    if (!meta) {
      meta = {
        chosenDelayMs: chosen,
        isLastCard: remainingHandCount === 1,
        remainingHandCount: remainingHandCount ?? null,
      };
    }
    return meta;
  }

  /**
   * @param {object} input
   * @param {number} input.handNumber
   * @param {number|null|undefined} input.trickNumber
   * @param {string|null|undefined} input.turnPlayerId
   * @param {number|null|undefined} [input.remainingHandCount]
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
    const picked = pickDelayForKey(key, input.remainingHandCount);
    const chosenDelayMs = picked.chosenDelayMs;
    const elapsedSinceTurnMs = input.nowMs - turnEligibleAtMs;
    const remainingTurnMs = Math.max(0, chosenDelayMs - elapsedSinceTurnMs);
    return {
      turnKey: key,
      chosenDelayMs,
      elapsedSinceTurnMs,
      trickGapRemainingMs: 0,
      delayMs: remainingTurnMs,
      remainingHandCount: picked.remainingHandCount,
      isLastCard: picked.isLastCard,
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
   * @param {{ handNumber: number, trickNumber: number|null, turnPlayerId: string|null, remainingHandCount?: number|null }} input.ctx
   * @param {number} input.nowMs
   * @param {() => boolean} input.shouldFire
   * @param {(payload: { turnKey: string, generation: number, plan: object }) => void} input.onFire
   * @param {{ armed?: Function, coalesced?: Function, rejected?: Function, accepted?: Function, delayChosen?: Function }} [input.log]
   */
  function armPlayThink({ ctx, nowMs, shouldFire, onFire, log }) {
    const turnKey = botPlayTurnKey(ctx);
    if (scheduledTimer && pendingTurnKey === turnKey) {
      log?.coalesced?.({
        turnKey,
        generation: scheduleGeneration,
        chosenDelayMs: pendingChosenDelayMs,
        remainingHandCount: ctx.remainingHandCount ?? null,
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
      remainingHandCount: ctx.remainingHandCount,
      nowMs,
    });
    const generation = scheduleGeneration;
    pendingTurnKey = turnKey;
    pendingChosenDelayMs = plan.chosenDelayMs;

    log?.delayChosen?.({
      turnKey,
      generation,
      chosenDelayMs: plan.chosenDelayMs,
      delayMs: plan.delayMs,
      remainingHandCount: plan.remainingHandCount,
      isLastCard: plan.isLastCard,
    });

    log?.armed?.({
      turnKey,
      generation,
      chosenDelayMs: plan.chosenDelayMs,
      delayMs: plan.delayMs,
      elapsedSinceTurnMs: plan.elapsedSinceTurnMs,
      remainingHandCount: plan.remainingHandCount,
      isLastCard: plan.isLastCard,
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
          remainingHandCount: plan.remainingHandCount,
          isLastCard: plan.isLastCard,
        });
        return;
      }

      log?.accepted?.({
        turnKey,
        generation,
        chosenDelayMs: plan.chosenDelayMs,
        delayMs: plan.delayMs,
        remainingHandCount: plan.remainingHandCount,
        isLastCard: plan.isLastCard,
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
 * @param {object} input.ctx — handNumber, trickNumber, turnPlayerId, remainingHandCount
 * @param {number} input.nowMs
 */
export function resolveBotAdvanceDelayMs(input) {
  if (input.handPhase === "play") {
    return {
      ...input.playDelayState.resolvePlayDelayMs({
        handNumber: input.ctx.handNumber,
        trickNumber: input.ctx.trickNumber,
        turnPlayerId: input.ctx.turnPlayerId,
        remainingHandCount: input.ctx.remainingHandCount,
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
    remainingHandCount: null,
    isLastCard: false,
  };
}
