/**
 * Bot play-phase think delay — visible ring latch + submit gate.
 * Submit may fire only after the avatar ring has been visibly active for chosenDelayMs.
 */

export const BOT_PLAY_DELAY_MIN_MS = 250;
export const BOT_PLAY_DELAY_MAX_MS = 700;
export const BOT_PLAY_LAST_CARD_MIN_MS = 100;
export const BOT_PLAY_LAST_CARD_MAX_MS = 300;
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

function parseBotPlayTurnKey(turnKey) {
  const [hand, trick, player] = String(turnKey ?? "").split(":");
  if (!player) return null;
  return {
    handNumber: Number(hand) || 0,
    trickNumber: Number(trick) || 0,
    turnPlayerId: player,
  };
}

/** Same live bot turn when trick number flickers (0 vs N) on the same hand/player. */
export function isSameDurableBotPlayTurn(prevKey, nextKey) {
  if (!prevKey || !nextKey) return false;
  if (prevKey === nextKey) return true;
  const prev = parseBotPlayTurnKey(prevKey);
  const next = parseBotPlayTurnKey(nextKey);
  if (!prev || !next) return false;
  if (prev.handNumber !== next.handNumber || prev.turnPlayerId !== next.turnPlayerId) return false;
  if (prev.trickNumber === next.trickNumber) return true;
  if (prev.trickNumber === 0 || next.trickNumber === 0) return true;
  return false;
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
 * @param {() => number} [rng]
 */
export function createBotPlayDelayState(options = {}) {
  const rng = options.rng ?? Math.random;
  let trackedHandNumber = null;
  let pendingTurnKey = null;
  let pendingPlayerId = null;
  let pendingRemainingHandCount = null;
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
    pendingRemainingHandCount = null;
    visibleRingStartAtMs = null;
    visibleRingTurnKey = null;
    delayByTurnKey.clear();
    if (handChanged) {
      pendingVisibleRingAck = null;
    }
    publishThinkWindow(null);
    logVisibleRing("visible-ring-reset", { reason: "hand_reset", handNumber });
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
   * @param {object} input
   */
  function prepareTurn({ handNumber, trickNumber, turnPlayerId, remainingHandCount, nowMs }) {
    syncHand(handNumber);
    const key = botPlayTurnKey({ handNumber, trickNumber, turnPlayerId });
    const chosenDelayMs = pickDelayForKey(key, remainingHandCount).chosenDelayMs;

    if (pendingTurnKey !== key) {
      const durableExit = !isSameDurableBotPlayTurn(pendingTurnKey, key);
      if (durableExit) {
        if (visibleRingStartAtMs != null && pendingTurnKey) {
          logVisibleRing("visible-ring-reset", {
            reason: "turn_exit",
            turnKey: pendingTurnKey,
            nextTurnKey: key,
          });
        }
        if (
          pendingVisibleRingAck &&
          !isSameDurableBotPlayTurn(pendingVisibleRingAck.turnKey, key)
        ) {
          logVisibleRing("visible-ring-ignored-stale", {
            turnKey: pendingVisibleRingAck.turnKey,
            pendingTurnKey: key,
            reason: "pending_turn_mismatch",
          });
          pendingVisibleRingAck = null;
        }
        pendingTurnKey = key;
        pendingPlayerId = turnPlayerId ?? null;
        pendingRemainingHandCount = remainingHandCount ?? null;
        visibleRingStartAtMs = null;
        visibleRingTurnKey = null;
        applyPendingVisibleRingAck();
      } else {
        const previousTurnKey = pendingTurnKey;
        pendingTurnKey = key;
        pendingPlayerId = turnPlayerId ?? null;
        pendingRemainingHandCount = remainingHandCount ?? null;
        if (visibleRingStartAtMs != null) {
          visibleRingTurnKey = key;
          logVisibleRing("visible-ring-latch-preserved", {
            turnKey: key,
            previousTurnKey,
            visibleRingStartAt: visibleRingStartAtMs,
          });
        }
        applyPendingVisibleRingAck();
        publishPendingWindow(key, turnPlayerId, chosenDelayMs);
        return { turnKey: key, chosenDelayMs };
      }
    } else {
      pendingRemainingHandCount = remainingHandCount ?? null;
      applyPendingVisibleRingAck();
    }

    publishPendingWindow(key, turnPlayerId, chosenDelayMs);
    return { turnKey: key, chosenDelayMs };
  }

  /**
   * @param {(extra: object) => void} [log]
   */
  function applyPendingVisibleRingAck(log) {
    if (
      !pendingVisibleRingAck ||
      pendingTurnKey == null ||
      !isSameDurableBotPlayTurn(pendingTurnKey, pendingVisibleRingAck.turnKey)
    ) {
      return false;
    }
    const ack = pendingVisibleRingAck;
    pendingVisibleRingAck = null;
    logVisibleRing("visible-ring-pending-applied", {
      turnKey: ack.turnKey,
      pendingTurnKey,
    });
    return notifyVisibleRingShown({ ...ack, log });
  }

  /** @deprecated Use prepareTurn — kept for callers that still mark eligibility. */
  function markTurnEligible(input) {
    return prepareTurn(input).turnKey;
  }

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
    if (!isSameDurableBotPlayTurn(pendingTurnKey, turnKey)) {
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
    if (visibleRingTurnKey && isSameDurableBotPlayTurn(visibleRingTurnKey, turnKey) && visibleRingStartAtMs != null) {
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
    const chosenDelayMs = pickDelayForKey(turnKey, pendingRemainingHandCount).chosenDelayMs;
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
      visibleRingTurnKey &&
      !isSameDurableBotPlayTurn(visibleRingTurnKey, effectiveTurnKey) &&
      pendingTurnKey &&
      !isSameDurableBotPlayTurn(pendingTurnKey, effectiveTurnKey)
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
      const chosenDelayMs = pickDelayForKey(pendingTurnKey, pendingRemainingHandCount).chosenDelayMs;
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

  function getVisibleRingStatus({ turnKey, nowMs, remainingHandCount }) {
    const chosenDelayMs = pickDelayForKey(turnKey, remainingHandCount).chosenDelayMs;
    const ringActive =
      visibleRingTurnKey &&
      isSameDurableBotPlayTurn(visibleRingTurnKey, turnKey) &&
      visibleRingStartAtMs != null &&
      pendingTurnKey &&
      isSameDurableBotPlayTurn(pendingTurnKey, turnKey);
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

  function resolvePlayDelayMs(input) {
    const { turnKey, chosenDelayMs } = prepareTurn({
      handNumber: input.handNumber,
      trickNumber: input.trickNumber,
      turnPlayerId: input.turnPlayerId,
      remainingHandCount: input.remainingHandCount,
      nowMs: input.nowMs,
    });
    const status = getVisibleRingStatus({
      turnKey,
      nowMs: input.nowMs,
      remainingHandCount: input.remainingHandCount,
    });
    const picked = pickDelayForKey(turnKey, input.remainingHandCount);
    return {
      turnKey,
      chosenDelayMs,
      elapsedSinceTurnMs: status.visibleRingElapsedMs,
      trickGapRemainingMs: 0,
      delayMs: status.remainingVisibleMs,
      remainingHandCount: picked.remainingHandCount,
      isLastCard: picked.isLastCard,
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

  function cardsVisiblyReadyForBotSubmit(pres) {
    const target = pres.revealTarget ?? 0;
    const revealed = pres.revealedCount ?? 0;
    const displayed = pres.displayedPlayCount ?? 0;
    if (displayed > 0) return true;
    if (revealed > 0) return true;
    if (target > 0 && revealed >= target) return true;
    return false;
  }

  function presentationBlocksSubmit(pres, status) {
    const cardsVisible = cardsVisiblyReadyForBotSubmit(pres);
    const ringLatched = status.visibleRingStartAtMs != null;
    if (pres.suppressing && !cardsVisible && !ringLatched) {
      return { block: true, reason: "turn_suppressed" };
    }
    if (pres.dealPresentationActive || pres.trickCollectionActive || pres.handPresenting) {
      return { block: true, reason: "presentation_busy" };
    }
    if (pres.revealCatchUp && !cardsVisible) {
      return { block: true, reason: "reveal_catch_up" };
    }
    if (pres.pipelineActive && !cardsVisible) {
      return { block: true, reason: "pipeline_active" };
    }
    if (pres.blocked && !cardsVisible && !ringLatched) {
      return { block: true, reason: "presentation" };
    }
    return { block: false, reason: null };
  }

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
      visibleRingStartAtMs: plan.visibleRingStartAtMs,
    });

    const tick = () => {
      scheduledTimer = null;
      if (generation !== scheduleGeneration) return;
      if (pendingTurnKey !== turnKey) return;

      const now = Date.now();
      const pres = getPresentationState?.() ?? {};
      const status = playDelayState.getVisibleRingStatus({
        turnKey,
        nowMs: now,
        remainingHandCount: ctx.remainingHandCount,
      });
      const block = presentationBlocksSubmit(pres, status);

      if (block.block) {
        log?.submitBlocked?.({
          turnKey,
          generation,
          reason: block.reason,
          chosenDelayMs: status.chosenDelayMs,
          visibleRingElapsedMs: status.visibleRingElapsedMs,
          visibleRingStartAtMs: status.visibleRingStartAtMs,
          revealCatchUp: Boolean(pres.revealCatchUp),
          revealedCount: pres.revealedCount ?? null,
          revealTarget: pres.revealTarget ?? null,
          pipelineActive: Boolean(pres.pipelineActive),
        });
        schedulePoll(tick, BOT_VISIBLE_RING_POLL_MS);
        return;
      }

      if (status.visibleRingStartAtMs == null) {
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
