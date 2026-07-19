/**
 * Server bot-advance request runtime — debounce, in-flight coalesce, single execute path.
 * Execution stays on Cloud Functions (`advanceSessionBots`); this module only schedules requests.
 */

import { assertBotAdvanceNotInFlight } from "./session-startup.js";
import { logBotOrchestrator } from "./bot-orchestrator.js";
import {
  BOT_ADVANCE_DEBOUNCE_MS,
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
  let pendingWake = false;
  const thinkSchedule = createBotThinkScheduleState();

  function clearDebounce() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
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
        logPlayDelay("bot-turn-start", session, scores, {
          requester: actorId,
          owner: "server",
          trigger: reason,
          action: "waiting_presentation",
          turnPlayerId: playDelayContext(session, scores).turnPlayerId,
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
        getPresentationState: () => deps.getPresentationState?.(session, scores) ?? { blocked: false },
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
          void execute(latest, deps.getScores(), actorId, {
            reason,
            delayPlan: plan,
            maxSteps: 1,
          });
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
          rejected: (extra) => {
            logPlayDelay("bot-think-fire-rejected", session, scores, {
              requester: actorId,
              owner: "server",
              trigger: reason,
              ...extra,
            });
            pendingWake = true;
          },
          submitBlocked: (extra) =>
            logPlayDelay("bot-submit-blocked", session, scores, {
              requester: actorId,
              owner: "server",
              trigger: reason,
              ...extra,
            }),
          submitAllowed: (extra) =>
            logPlayDelay("bot-submit-allowed", session, scores, {
              requester: actorId,
              owner: "server",
              trigger: reason,
              ...extra,
            }),
          visibleRingReset: (extra) =>
            logPlayDelay("visible-ring-reset", session, scores, {
              requester: actorId,
              owner: "server",
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
    clearDebounce();
    const delayPlan = resolveBotAdvanceDelayMs({
      handPhase,
      playDelayState: thinkSchedule.playDelayState,
      ctx: playDelayContext(session, scores),
      nowMs: Date.now(),
    });
    const delay = delayPlan.delayMs;

    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void execute(session, scores, actorId, { reason, delayPlan });
    }, delay);

    logPlayDelay("schedule-request", session, scores, {
      requester: actorId,
      owner: "server",
      trigger: reason,
      delayMs: delay,
      chosenBotDelayMs: delayPlan.chosenDelayMs,
      handPhase,
      action: "scheduled",
    });
  }

  async function execute(session, scores, actorId, { reason = "snapshot", delayPlan = null, maxSteps } = {}) {
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
        maxSteps,
      });
      logPlayDelay("complete", sessionObj, scores, {
        requester: actorId,
        owner: "server",
        roomId,
        sessionId,
        result,
        action: "executed",
        ...ctx,
      });
    } catch (err) {
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
      thinkSchedule.cancelPending({ reason: "clear_schedule" });
    },
    notifyVisibleRingShown(payload) {
      thinkSchedule.playDelayState.notifyVisibleRingShown({
        ...payload,
        log: (extra) =>
          logBotOrchestrator("visible-ring-shown", { owner: "server", ...extra }),
      });
    },
    notifyVisibleRingHidden(payload) {
      thinkSchedule.playDelayState.notifyVisibleRingHidden({
        ...payload,
        log: (extra) =>
          logBotOrchestrator("visible-ring-reset", { owner: "server", ...extra }),
      });
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
