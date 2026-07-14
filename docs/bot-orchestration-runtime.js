/**
 * Server bot-advance request runtime — debounce, in-flight coalesce, single execute path.
 * Execution stays on Cloud Functions (`advanceSessionBots`); this module only schedules requests.
 */

import { assertBotAdvanceNotInFlight } from "./session-startup.js";
import { logBotOrchestrator } from "./bot-orchestrator.js";
import {
  BOT_ADVANCE_DEBOUNCE_MS,
  botAdvanceTurnKey,
  botPlayTurnKey,
  createBotThinkScheduleState,
  resolveBotAdvanceDelayMs,
} from "./bot-play-delay.js";

/**
 * @param {object} deps
 * @param {() => boolean} deps.shouldRequestAdvance
 * @param {(session, scores) => boolean} deps.sessionNeedsBotDriver
 * @param {(session, scores) => boolean} deps.shouldBlockForPresentation
 * @param {(session, scores, extra?) => object} deps.snapshotContext
 * @param {() => string | null} deps.getRoomId
 * @param {() => string | null} deps.getSessionId
 * @param {(roomId: string, sessionId: string, opts: object) => Promise<unknown>} deps.advanceSessionBots
 * @param {(sessionId: string) => object | undefined} deps.findSession
 * @param {() => object[]} deps.getScores
 * @param {(session: object, scores: object[], actorId: string, opts: object) => void} deps.onWake
 * @param {(session: object, scores: object[], actorId: string, err: unknown) => void} [deps.onAdvanceError]
 * @param {(session: object) => string | null} [deps.getHandPhase]
 */
export function createServerBotAdvanceRuntime(deps) {
  let inFlight = false;
  let debounceTimer = null;
  let pendingAdvanceTurnKey = null;
  let lastNoopCompletedKey = null;
  let pendingWake = false;
  const thinkSchedule = createBotThinkScheduleState();

  function isNoopAdvanceResult(result) {
    return (
      result?.status === "ok" &&
      Array.isArray(result?.steps) &&
      result.steps.length === 0
    );
  }

  function clearDebounce() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    pendingAdvanceTurnKey = null;
  }

  function playDelayContext(session, scores) {
    const ctx = deps.snapshotContext(session, scores);
    return {
      handNumber: ctx.handNumber ?? 0,
      trickNumber: ctx.trickNumber ?? null,
      turnPlayerId: ctx.turnPlayerId ?? null,
      remainingHandCount: ctx.remainingHandCount ?? null,
    };
  }

  function advanceTurnContext(session, scores) {
    const ctx = deps.snapshotContext(session, scores);
    const actionOrder = ctx.actionOrder ?? [];
    return {
      sessionId: deps.getSessionId() ?? "",
      handNumber: ctx.handNumber ?? 0,
      handPhase: deps.getHandPhase?.(session) ?? ctx.handPhase ?? null,
      trickNumber: ctx.trickNumber ?? null,
      turnPlayerId: ctx.turnPlayerId ?? null,
      turnIndex: ctx.turnIndex ?? -1,
      actionOrderFirst: actionOrder[0] ?? "",
      remainingHandCount: ctx.remainingHandCount ?? null,
    };
  }

  function logPlayDelay(event, session, scores, extra = {}) {
    const ctx = deps.snapshotContext(session, scores);
    logBotOrchestrator(event, {
      handNumber: ctx.handNumber ?? null,
      trickNumber: ctx.trickNumber ?? null,
      turnPlayerId: ctx.turnPlayerId ?? null,
      ...extra,
    });
  }

  function cancelPlayThink(session, scores, reason) {
    thinkSchedule.cancelPending({
      reason,
      onCanceled: (extra) =>
        logPlayDelay("bot-think-canceled", session, scores, {
          ...extra,
          owner: "server",
        }),
    });
  }

  function canExecuteForTurn(session, scores, expectedTurnKey) {
    if (!deps.shouldRequestAdvance()) return false;
    if (!deps.sessionNeedsBotDriver(session, scores)) return false;
    if (deps.shouldBlockForPresentation(session, scores)) return false;
    return botPlayTurnKey(playDelayContext(session, scores)) === expectedTurnKey;
  }

  function schedule(session, scores, actorId, { reason = "snapshot" } = {}) {
    if (!deps.shouldRequestAdvance()) {
      logBotOrchestrator("skip-request", {
        reason: "server_authority_off_or_table_closed",
        requester: actorId,
        owner: "server",
        trigger: reason,
      });
      return;
    }
    if (!deps.sessionNeedsBotDriver(session, scores)) {
      cancelPlayThink(session, scores, "no_bot_driver");
      logBotOrchestrator("skip-request", {
        reason: "no_bot_driver_needed",
        requester: actorId,
        owner: "server",
        trigger: reason,
        ...deps.snapshotContext(session, scores),
      });
      return;
    }
    const handPhase = deps.getHandPhase?.(session) ?? null;

    if (deps.shouldBlockForPresentation(session, scores)) {
      if (handPhase === "play") {
        const ctx = playDelayContext(session, scores);
        thinkSchedule.playDelayState.markTurnEligible({
          ...ctx,
          nowMs: Date.now(),
        });
        logPlayDelay("bot-turn-start", session, scores, {
          requester: actorId,
          owner: "server",
          trigger: reason,
          action: "waiting_presentation",
          turnPlayerId: ctx.turnPlayerId,
        });
      } else {
        cancelPlayThink(session, scores, "presentation_blocked");
      }
      logBotOrchestrator("skip-request", {
        reason: "presentation_blocked",
        requester: actorId,
        owner: "server",
        trigger: reason,
        action: "blocked",
        handPhase,
        ...deps.snapshotContext(session, scores),
      });
      return;
    }

    if (inFlight) {
      pendingWake = true;
      logPlayDelay("coalesce-request", session, scores, {
        reason: "advance_in_flight",
        requester: actorId,
        owner: "server",
        trigger: reason,
        action: "blocked",
      });
      return;
    }

    if (handPhase === "play") {
      const ctx = playDelayContext(session, scores);
      thinkSchedule.playDelayState.markTurnEligible({
        ...ctx,
        nowMs: Date.now(),
      });
      const expectedTurnKey = botPlayTurnKey(ctx);
      logPlayDelay("bot-turn-start", session, scores, {
        requester: actorId,
        owner: "server",
        trigger: reason,
        turnPlayerId: ctx.turnPlayerId,
        handPhase,
      });
      const result = thinkSchedule.armPlayThink({
        ctx,
        nowMs: Date.now(),
        shouldFire: () => {
          const sessionId = deps.getSessionId();
          const latest = sessionId ? deps.findSession(sessionId) : session;
          if (!latest) return false;
          return canExecuteForTurn(latest, deps.getScores(), expectedTurnKey);
        },
        onFire: ({ plan }) => {
          const sessionId = deps.getSessionId();
          const latest = sessionId ? deps.findSession(sessionId) : session;
          if (!latest) return;
          void execute(latest, deps.getScores(), actorId, { reason, delayPlan: plan });
        },
        log: {
          delayChosen: (extra) =>
            logPlayDelay("bot-delay-chosen", session, scores, {
              requester: actorId,
              owner: "server",
              trigger: reason,
              ...extra,
            }),
          armed: (extra) =>
            logPlayDelay("bot-think-armed", session, scores, {
              requester: actorId,
              owner: "server",
              trigger: reason,
              action: "scheduled",
              ...extra,
            }),
          coalesced: (extra) =>
            logPlayDelay("schedule-request", session, scores, {
              requester: actorId,
              owner: "server",
              trigger: reason,
              action: "coalesced",
              handPhase,
              ...extra,
            }),
          canceled: (extra) =>
            logPlayDelay("bot-think-canceled", session, scores, {
              requester: actorId,
              owner: "server",
              ...extra,
            }),
          accepted: (extra) =>
            logPlayDelay("bot-think-fire-accepted", session, scores, {
              requester: actorId,
              owner: "server",
              trigger: reason,
              ...extra,
            }),
          rejected: (extra) =>
            logPlayDelay("bot-think-fire-rejected", session, scores, {
              requester: actorId,
              owner: "server",
              trigger: reason,
              ...extra,
            }),
        },
      });

      if (result.action === "armed") {
        logPlayDelay("schedule-request", session, scores, {
          requester: actorId,
          owner: "server",
          trigger: reason,
          delayMs: result.delayMs,
          chosenBotDelayMs: result.chosenDelayMs,
          elapsedSinceTurnMs: result.elapsedSinceTurnMs,
          remainingHandCount: result.remainingHandCount,
          isLastCard: result.isLastCard,
          handPhase,
          generation: result.generation,
          action: "scheduled",
        });
      }
      return;
    }

    cancelPlayThink(session, scores, "non_play_phase");
    const advanceCtx = advanceTurnContext(session, scores);
    const advanceTurnKey = botAdvanceTurnKey(advanceCtx);

    if (debounceTimer && pendingAdvanceTurnKey === advanceTurnKey) {
      logPlayDelay("coalesce-request", session, scores, {
        reason: "schedule_deduped",
        requester: actorId,
        owner: "server",
        trigger: reason,
        action: "coalesced",
        advanceTurnKey,
        handPhase,
      });
      return;
    }

    if (lastNoopCompletedKey === advanceTurnKey) {
      logPlayDelay("skip-request", session, scores, {
        reason: "noop_already_processed",
        requester: actorId,
        owner: "server",
        trigger: reason,
        action: "skipped",
        advanceTurnKey,
        handPhase,
      });
      return;
    }

    clearDebounce();
    const delayPlan = resolveBotAdvanceDelayMs({
      handPhase,
      playDelayState: thinkSchedule.playDelayState,
      ctx: playDelayContext(session, scores),
      nowMs: Date.now(),
    });
    const delay = delayPlan.delayMs;

    pendingAdvanceTurnKey = advanceTurnKey;
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      pendingAdvanceTurnKey = null;
      void execute(session, scores, actorId, { reason, delayPlan });
    }, delay);

    logPlayDelay("schedule-request", session, scores, {
      requester: actorId,
      owner: "server",
      trigger: reason,
      delayMs: delay,
      chosenBotDelayMs: delayPlan.chosenDelayMs,
      handPhase,
      advanceTurnKey,
      action: "scheduled",
    });
  }

  async function execute(session, scores, actorId, { reason = "snapshot", delayPlan = null } = {}) {
    if (inFlight) {
      assertBotAdvanceNotInFlight(true, { source: "executeServerBotAdvance", reason });
      return;
    }
    const roomId = deps.getRoomId();
    const sessionId = deps.getSessionId();
    if (!roomId || !sessionId) return;

    const sessionObj = deps.findSession(sessionId) ?? session;
    if (!sessionObj || sessionObj.status === "final") return;
    if (!deps.shouldRequestAdvance()) return;
    if (!deps.sessionNeedsBotDriver(sessionObj, scores)) return;
    if (deps.shouldBlockForPresentation(sessionObj, scores)) {
      pendingWake = true;
      logPlayDelay("skip-request", sessionObj, scores, {
        reason: "presentation_blocked",
        requester: actorId,
        owner: "server",
        trigger: reason,
        action: "blocked",
        chosenBotDelayMs: delayPlan?.chosenDelayMs ?? null,
        elapsedSinceTurnMs: delayPlan?.elapsedSinceTurnMs ?? null,
      });
      return;
    }

    const handPhase = deps.getHandPhase?.(sessionObj) ?? null;
    const advanceTurnKey =
      handPhase !== "play" ? botAdvanceTurnKey(advanceTurnContext(sessionObj, scores)) : null;
    if (advanceTurnKey && lastNoopCompletedKey === advanceTurnKey) {
      logPlayDelay("skip-request", sessionObj, scores, {
        reason: "noop_already_processed",
        requester: actorId,
        owner: "server",
        trigger: reason,
        action: "skipped",
        advanceTurnKey,
        handPhase,
      });
      return;
    }

    inFlight = true;
    const ctx = deps.snapshotContext(sessionObj, scores, { trigger: reason });
    logPlayDelay("request", sessionObj, scores, {
      requester: actorId,
      owner: "server",
      roomId,
      sessionId,
      action: "executed",
      chosenBotDelayMs: delayPlan?.chosenDelayMs ?? null,
      elapsedSinceTurnMs: delayPlan?.elapsedSinceTurnMs ?? null,
      ...ctx,
    });

    try {
      const result = await deps.advanceSessionBots(roomId, sessionId, {
        requester: actorId,
        trigger: reason,
      });
      if (advanceTurnKey && isNoopAdvanceResult(result)) {
        lastNoopCompletedKey = advanceTurnKey;
      } else if (advanceTurnKey) {
        lastNoopCompletedKey = null;
      }
      logPlayDelay("complete", sessionObj, scores, {
        requester: actorId,
        owner: "server",
        roomId,
        sessionId,
        result,
        action: "executed",
        advanceTurnKey,
        ...ctx,
      });
    } catch (err) {
      if (advanceTurnKey) {
        lastNoopCompletedKey = null;
      }
      logPlayDelay("error", sessionObj, scores, {
        requester: actorId,
        owner: "server",
        roomId,
        sessionId,
        message: err?.message ?? String(err),
        action: "error",
        ...ctx,
      });
      console.warn("advanceSessionBots:", err);
      try {
        deps.onAdvanceError?.(sessionObj, scores, actorId, err);
      } catch (fallbackErr) {
        console.warn("bot-advance fallback:", fallbackErr);
      }
    } finally {
      inFlight = false;
      if (pendingWake) {
        pendingWake = false;
        const latest = deps.findSession(sessionId);
        if (latest) {
          deps.onWake(latest, deps.getScores(), actorId, { reason: "wake" });
        }
      }
    }
  }

  return {
    schedule,
    execute,
    clearSchedule: () => {
      clearDebounce();
      lastNoopCompletedKey = null;
      thinkSchedule.cancelPending({ reason: "clear_schedule" });
    },
    get inFlight() {
      return inFlight;
    },
    markPendingWake() {
      pendingWake = true;
    },
  };
}

export { BOT_ADVANCE_DEBOUNCE_MS };
