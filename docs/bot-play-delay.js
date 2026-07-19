/**
 * Bot play-phase think delay — random submit window per turn; drives visible ring + submit gate.
 * Submit may fire only after the avatar ring has been visibly active for chosenDelayMs (1500–3000).
 */

export const BOT_PLAY_DELAY_MIN_MS = 1500;
export const BOT_PLAY_DELAY_MAX_MS = 3000;
export const BOT_ADVANCE_DEBOUNCE_MS = 150;
export const BOT_VISIBLE_RING_POLL_MS = 50;

/** Only these reasons may clear a latched visible-ring start for a live turn. */
export const DURABLE_VISIBLE_RING_RESET_REASONS = new Set([
  "turn_exit",
  "turn_change",
  "ring_deactivated",
  "hand_reset",
  "hand_change",
  "trick_reset",
  "superseded",
  "canceled",
  "clear_schedule",
]);

export function isDurableVisibleRingResetReason(reason) {
  return DURABLE_VISIBLE_RING_RESET_REASONS.has(reason);
}

/** @typedef {{ turnKey: string, playerId: string, startedAtMs: number, totalMs: number, countingStartedAtMs?: number | null }} BotThinkWindowPayload */

/** @type {((window: BotThinkWindowPayload | null) => void) | null} */
let thinkWindowPublisher = null;

/**
 * Wire table UI to the active bot think window (see src/table/botThinkWindow.ts).
 * @param {(window: BotThinkWindowPayload | null) => void | null} publisher
 */
export function setBotThinkWindowPublisher(publisher) {
  thinkWindowPublisher = publisher ?? null;
}

/**
 * @param {BotThinkWindowPayload | null} window
 */
function publishThinkWindow(window) {
  thinkWindowPublisher?.(window);
}

function logVisibleRing(event, extra = {}) {
  if (typeof console !== "undefined" && typeof console.debug === "function") {
    console.debug(`[bot-visible-ring] ${event}`, extra);
  }
}

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
 * One random submit delay per eligible bot play turn (1500–3000 ms).
 * @param {() => number} [rng]
 */
export function pickBotPlayDelayMs(rng = Math.random) {
  const chosenDelayMs = randomIntInclusive(BOT_PLAY_DELAY_MIN_MS, BOT_PLAY_DELAY_MAX_MS, rng);
  return {
    chosenDelayMs,
    remainingHandCount: null,
  };
}

/**
 * @param {object} [options]
 * @param {() => number} [rng]
 */
export function createBotPlayDelayState(options = {}) {
  const rng = options.rng ?? Math.random;
  let trackedHandNumber = null;
  let pendingTurnKey = null;
  let pendingPlayerId = null;
  /** @type {number | null} */
  let visibleRingStartAtMs = null;
  let visibleRingTurnKey = null;
  /** @type {{ turnKey: string, playerId: string, nowMs: number } | null} */
  let pendingVisibleRingAck = null;
  const delayByTurnKey = new Map();

  function syncHand(handNumber) {
    if (trackedHandNumber === handNumber) return;
    const handChanged = trackedHandNumber != null;
    trackedHandNumber = handNumber;
    pendingTurnKey = null;
    pendingPlayerId = null;
    visibleRingStartAtMs = null;
    visibleRingTurnKey = null;
    delayByTurnKey.clear();
    if (handChanged) {
      pendingVisibleRingAck = null;
    }
    publishThinkWindow(null);
    logVisibleRing("visible-ring-reset", { reason: "hand_reset", handNumber });
  }

  function pickDelayForKey(turnKey) {
    let chosen = delayByTurnKey.get(turnKey);
    if (chosen == null) {
      chosen = pickBotPlayDelayMs(rng).chosenDelayMs;
      delayByTurnKey.set(turnKey, chosen);
    }
    return chosen;
  }

  function publishPendingWindow(turnKey, playerId, chosenDelayMs) {
    if (!playerId) return;
    publishThinkWindow({
      turnKey,
      playerId,
      startedAtMs: visibleRingStartAtMs ?? 0,
      countingStartedAtMs: visibleRingStartAtMs,
      totalMs: chosenDelayMs,
    });
  }

  /**
   * Arm a bot turn — picks delay and publishes ring shell; visible timer starts on UI ack.
   * @param {object} input
   */
  function prepareTurn({ handNumber, trickNumber, turnPlayerId, nowMs }) {
    syncHand(handNumber);
    const key = botPlayTurnKey({ handNumber, trickNumber, turnPlayerId });
    const chosenDelayMs = pickDelayForKey(key);
    if (pendingTurnKey !== key) {
      if (visibleRingStartAtMs != null && pendingTurnKey) {
        logVisibleRing("visible-ring-reset", {
          reason: "turn_exit",
          turnKey: pendingTurnKey,
          nextTurnKey: key,
        });
      }
      if (pendingVisibleRingAck && pendingVisibleRingAck.turnKey !== key) {
        logVisibleRing("visible-ring-ignored-stale", {
          turnKey: pendingVisibleRingAck.turnKey,
          pendingTurnKey: key,
          reason: "pending_turn_mismatch",
        });
        pendingVisibleRingAck = null;
      }
      pendingTurnKey = key;
      pendingPlayerId = turnPlayerId ?? null;
      visibleRingStartAtMs = null;
      visibleRingTurnKey = null;
      publishPendingWindow(key, turnPlayerId, chosenDelayMs);
      applyPendingVisibleRingAck();
    }
    return { turnKey: key, chosenDelayMs };
  }

  /**
   * Apply a UI visible-ring ack that arrived before prepareTurn armed the turn.
   * @param {(extra: object) => void} [log]
   */
  function applyPendingVisibleRingAck(log) {
    if (!pendingVisibleRingAck || pendingTurnKey !== pendingVisibleRingAck.turnKey) {
      return false;
    }
    const ack = pendingVisibleRingAck;
    pendingVisibleRingAck = null;
    return notifyVisibleRingShown({ ...ack, log });
  }

  /** @deprecated Use prepareTurn — kept for callers that still mark eligibility. */
  function markTurnEligible(input) {
    return prepareTurn(input).turnKey;
  }

  /**
   * UI reports the active bot avatar ring is visibly on screen.
   * @param {object} input
   * @param {string} input.turnKey
   * @param {string} input.playerId
   * @param {number} input.nowMs
   * @param {(extra: object) => void} [input.log]
   */
  function notifyVisibleRingShown({ turnKey, playerId, nowMs, log }) {
    logVisibleRing("visible-ring-seen", { turnKey, playerId, pendingTurnKey });
    if (!turnKey) {
      logVisibleRing("visible-ring-ignored-stale", {
        turnKey,
        playerId,
        pendingTurnKey,
        reason: "missing_turn_key",
      });
      return false;
    }
    if (pendingTurnKey == null) {
      pendingVisibleRingAck = { turnKey, playerId, nowMs };
      logVisibleRing("visible-ring-pending", {
        turnKey,
        playerId,
        pendingTurnKey,
        nowMs,
      });
      log?.({ turnKey, playerId, pendingTurnKey, reason: "pending_before_arm", accepted: false });
      return false;
    }
    if (pendingTurnKey !== turnKey) {
      logVisibleRing("visible-ring-ignored-stale", {
        turnKey,
        playerId,
        pendingTurnKey,
        reason: "stale_turn_key",
      });
      log?.({
        turnKey,
        playerId,
        pendingTurnKey,
        reason: "stale_turn_key",
        accepted: false,
      });
      return false;
    }
    pendingVisibleRingAck = null;
    if (pendingPlayerId && playerId !== pendingPlayerId) {
      logVisibleRing("visible-ring-ignored-stale", {
        turnKey,
        playerId,
        pendingPlayerId,
        reason: "player_mismatch",
      });
      log?.({
        turnKey,
        playerId,
        pendingPlayerId,
        reason: "player_mismatch",
        accepted: false,
      });
      return false;
    }
    if (visibleRingTurnKey === turnKey && visibleRingStartAtMs != null) {
      logVisibleRing("visible-ring-accepted", {
        turnKey,
        playerId,
        visibleRingStartAt: visibleRingStartAtMs,
        duplicate: true,
      });
      return true;
    }
    visibleRingTurnKey = turnKey;
    visibleRingStartAtMs = nowMs;
    const chosenDelayMs = pickDelayForKey(turnKey);
    publishThinkWindow({
      turnKey,
      playerId,
      startedAtMs: nowMs,
      countingStartedAtMs: nowMs,
      totalMs: chosenDelayMs,
    });
    const payload = {
      turnKey,
      playerId,
      visibleRingStartAt: nowMs,
      chosenDelayMs,
    };
    log?.({ ...payload, accepted: true });
    logVisibleRing("visible-ring-shown", payload);
    logVisibleRing("visible-ring-accepted", payload);
    return true;
  }

  /**
   * Clear the turn-scoped visible-ring latch only on durable turn exit.
   * Transient presentation churn (ring_cleanup, not_bot_turn, etc.) is ignored.
   * @param {object} input
   */
  function notifyVisibleRingHidden({ turnKey, reason, nowMs, log }) {
    const effectiveTurnKey = turnKey ?? pendingTurnKey;
    if (!isDurableVisibleRingResetReason(reason)) {
      const ignored = {
        turnKey: effectiveTurnKey,
        reason,
        pendingTurnKey,
        latched: visibleRingStartAtMs != null,
        nowMs,
        ignored: true,
      };
      log?.(ignored);
      logVisibleRing("visible-ring-reset-ignored", ignored);
      return false;
    }
    if (
      effectiveTurnKey &&
      visibleRingTurnKey !== effectiveTurnKey &&
      pendingTurnKey !== effectiveTurnKey
    ) {
      const stale = {
        turnKey: effectiveTurnKey,
        reason,
        pendingTurnKey,
        visibleRingTurnKey,
        ignored: true,
      };
      log?.(stale);
      logVisibleRing("visible-ring-ignored-stale", stale);
      return false;
    }
    const prevStart = visibleRingStartAtMs;
    if (prevStart == null && visibleRingTurnKey == null) {
      return false;
    }
    visibleRingStartAtMs = null;
    visibleRingTurnKey = null;
    if (pendingTurnKey && pendingPlayerId) {
      const chosenDelayMs = pickDelayForKey(pendingTurnKey);
      publishPendingWindow(pendingTurnKey, pendingPlayerId, chosenDelayMs);
    } else {
      publishThinkWindow(null);
    }
    const payload = {
      turnKey: effectiveTurnKey,
      reason,
      previousVisibleRingStartAt: prevStart,
      nowMs,
    };
    log?.(payload);
    logVisibleRing("visible-ring-reset", payload);
    return true;
  }

  /**
   * @param {object} input
   * @param {string} input.turnKey
   * @param {number} input.nowMs
   */
  function getVisibleRingStatus({ turnKey, nowMs }) {
    const chosenDelayMs = pickDelayForKey(turnKey);
    const ringActive =
      visibleRingTurnKey === turnKey && visibleRingStartAtMs != null && pendingTurnKey === turnKey;
    const visibleRingElapsedMs = ringActive
      ? Math.max(0, nowMs - visibleRingStartAtMs)
      : 0;
    const remainingVisibleMs = ringActive
      ? Math.max(0, chosenDelayMs - visibleRingElapsedMs)
      : chosenDelayMs;
    return {
      turnKey,
      chosenDelayMs,
      visibleRingStartAtMs: ringActive ? visibleRingStartAtMs : null,
      visibleRingElapsedMs,
      remainingVisibleMs,
      visibleMinimumMet: ringActive && visibleRingElapsedMs >= chosenDelayMs,
    };
  }

  /**
   * @param {object} input
   * @param {number} input.handNumber
   * @param {number|null|undefined} input.trickNumber
   * @param {string|null|undefined} input.turnPlayerId
   * @param {number} input.nowMs
   */
  function resolvePlayDelayMs(input) {
    const { turnKey, chosenDelayMs } = prepareTurn({
      handNumber: input.handNumber,
      trickNumber: input.trickNumber,
      turnPlayerId: input.turnPlayerId,
      nowMs: input.nowMs,
    });
    const status = getVisibleRingStatus({ turnKey, nowMs: input.nowMs });
    return {
      turnKey,
      chosenDelayMs,
      elapsedSinceTurnMs: status.visibleRingElapsedMs,
      trickGapRemainingMs: 0,
      delayMs: status.remainingVisibleMs,
      remainingHandCount: null,
      isLastCard: false,
      visibleRingStartAtMs: status.visibleRingStartAtMs,
      visibleMinimumMet: status.visibleMinimumMet,
    };
  }

  return {
    syncHand,
    prepareTurn,
    markTurnEligible,
    notifyVisibleRingShown,
    notifyVisibleRingHidden,
    applyPendingVisibleRingAck,
    getVisibleRingStatus,
    resolvePlayDelayMs,
    delayByTurnKey,
  };
}

/**
 * Play-phase think scheduler — polls until visible ring minimum + shouldFire.
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

  function schedulePoll(fn, delayMs) {
    scheduledTimer = setTimeout(fn, delayMs);
    scheduledTimer?.unref?.();
  }

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
    publishThinkWindow(null);
    onCanceled?.(extra);
    return true;
  }

  /**
   * @param {object} input
   * @param {{ handNumber: number, trickNumber: number|null, turnPlayerId: string|null, remainingHandCount?: number|null }} input.ctx
   * @param {number} input.nowMs
   * @param {() => boolean} input.shouldFire
   * @param {() => { blocked?: boolean, revealCatchUp?: boolean, presentationBusy?: boolean, suppressing?: boolean }} [input.getPresentationState]
   * @param {(payload: { turnKey: string, generation: number, plan: object }) => void} input.onFire
   * @param {Record<string, Function>} [input.log]
   */
  function armPlayThink({ ctx, nowMs, shouldFire, getPresentationState, onFire, log }) {
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
      visibleRingStartAtMs: plan.visibleRingStartAtMs,
    });

    const tick = () => {
      scheduledTimer = null;
      if (generation !== scheduleGeneration) return;
      if (pendingTurnKey !== turnKey) return;

      const now = Date.now();
      const pres = getPresentationState?.() ?? {};
      const status = playDelayState.getVisibleRingStatus({ turnKey, nowMs: now });

      if (pres.blocked || pres.suppressing || pres.presentationBusy || pres.revealCatchUp) {
        log?.submitBlocked?.({
          turnKey,
          generation,
          reason: pres.revealCatchUp
            ? "reveal_catch_up"
            : pres.suppressing
              ? "turn_suppressed"
              : pres.presentationBusy
                ? "presentation_busy"
                : "presentation",
          chosenDelayMs: status.chosenDelayMs,
          visibleRingElapsedMs: status.visibleRingElapsedMs,
          visibleRingStartAtMs: status.visibleRingStartAtMs,
          revealCatchUp: Boolean(pres.revealCatchUp),
          presentationBusy: Boolean(pres.presentationBusy),
          suppressing: Boolean(pres.suppressing),
        });
        scheduledTimer = setTimeout(tick, BOT_VISIBLE_RING_POLL_MS);
        scheduledTimer?.unref?.();
        return;
      }

      if (!status.visibleRingStartAtMs) {
        log?.submitBlocked?.({
          turnKey,
          generation,
          reason: "visible_ring_not_shown",
          chosenDelayMs: status.chosenDelayMs,
          visibleRingElapsedMs: 0,
        });
        schedulePoll(tick, BOT_VISIBLE_RING_POLL_MS);
        return;
      }

      if (!status.visibleMinimumMet) {
        log?.submitBlocked?.({
          turnKey,
          generation,
          reason: "visible_minimum_not_met",
          chosenDelayMs: status.chosenDelayMs,
          visibleRingElapsedMs: status.visibleRingElapsedMs,
          remainingVisibleMs: status.remainingVisibleMs,
        });
        schedulePoll(
          tick,
          Math.min(BOT_VISIBLE_RING_POLL_MS, Math.max(16, status.remainingVisibleMs)),
        );
        return;
      }

      if (!shouldFire()) {
        log?.rejected?.({
          turnKey,
          generation,
          chosenDelayMs: status.chosenDelayMs,
          visibleRingElapsedMs: status.visibleRingElapsedMs,
          remainingHandCount: ctx.remainingHandCount ?? null,
          isLastCard: plan.isLastCard,
        });
        return;
      }

      pendingTurnKey = null;
      pendingChosenDelayMs = null;
      log?.submitAllowed?.({
        turnKey,
        generation,
        chosenDelayMs: status.chosenDelayMs,
        visibleRingElapsedMs: status.visibleRingElapsedMs,
        delayMs: status.chosenDelayMs,
        remainingHandCount: ctx.remainingHandCount ?? null,
        isLastCard: plan.isLastCard,
      });
      log?.accepted?.({
        turnKey,
        generation,
        chosenDelayMs: status.chosenDelayMs,
        delayMs: status.chosenDelayMs,
        visibleRingElapsedMs: status.visibleRingElapsedMs,
        remainingHandCount: ctx.remainingHandCount ?? null,
        isLastCard: plan.isLastCard,
      });
      onFire({ turnKey, generation, plan: { ...plan, ...status } });
    };

    schedulePoll(tick, BOT_VISIBLE_RING_POLL_MS);
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
