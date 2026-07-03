/**
 * Server bot-advance request runtime — debounce, in-flight coalesce, single execute path.
 * Execution stays on Cloud Functions (`advanceSessionBots`); this module only schedules requests.
 */

import { assertBotAdvanceNotInFlight } from "./session-startup.js";
import { logBotOrchestrator } from "./bot-orchestrator.js";
import {
  BOT_ADVANCE_DEBOUNCE_MS,
  createBotPlayDelayState,
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
 * @param {number} [deps.trickIntervalMs]
 */
export function createServerBotAdvanceRuntime(deps) {
  let inFlight = false;
  let scheduledTimer = null;
  let pendingWake = false;
  let lastCompletedAt = 0;
  const playDelayState = createBotPlayDelayState();

  function clearSchedule() {
    if (scheduledTimer) {
      clearTimeout(scheduledTimer);
      scheduledTimer = null;
    }
  }

  function playDelayContext(session, scores) {
    const ctx = deps.snapshotContext(session, scores);
    return {
      handNumber: ctx.handNumber ?? 0,
      trickNumber: ctx.trickNumber ?? null,
      turnPlayerId: ctx.turnPlayerId ?? null,
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
      logBotOrchestrator("skip-request", {
        reason: "no_bot_driver_needed",
        requester: actorId,
        owner: "server",
        trigger: reason,
        ...deps.snapshotContext(session, scores),
      });
      return;
    }
    if (deps.shouldBlockForPresentation(session, scores)) {
      const ctx = deps.snapshotContext(session, scores);
      logBotOrchestrator("skip-request", {
        reason: "presentation_blocked",
        requester: actorId,
        owner: "server",
        trigger: reason,
        action: "blocked",
        ...ctx,
      });
      return;
    }

    const handPhase = deps.getHandPhase?.(session) ?? null;
    const nowMs = Date.now();
    const delayPlan = resolveBotAdvanceDelayMs({
      handPhase,
      playDelayState,
      ctx: playDelayContext(session, scores),
      nowMs,
      lastCompletedAtMs: lastCompletedAt,
      trickIntervalMs: deps.trickIntervalMs ?? 0,
    });
    const delay = delayPlan.delayMs;

    if (inFlight) {
      pendingWake = true;
      logPlayDelay("coalesce-request", session, scores, {
        reason: "advance_in_flight",
        requester: actorId,
        owner: "server",
        trigger: reason,
        delayMs: delay,
        chosenBotDelayMs: delayPlan.chosenDelayMs,
        elapsedSinceTurnMs: delayPlan.elapsedSinceTurnMs,
        action: "blocked",
      });
      return;
    }

    clearSchedule();
    scheduledTimer = setTimeout(() => {
      scheduledTimer = null;
      void execute(session, scores, actorId, { reason, delayPlan });
    }, delay);

    logPlayDelay("schedule-request", session, scores, {
      requester: actorId,
      owner: "server",
      trigger: reason,
      delayMs: delay,
      chosenBotDelayMs: delayPlan.chosenDelayMs,
      elapsedSinceTurnMs: delayPlan.elapsedSinceTurnMs,
      trickGapRemainingMs: delayPlan.trickGapRemainingMs,
      handPhase,
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
      lastCompletedAt = Date.now();
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
    clearSchedule,
    get inFlight() {
      return inFlight;
    },
    markPendingWake() {
      pendingWake = true;
    },
  };
}

export { BOT_ADVANCE_DEBOUNCE_MS };
