/**
 * Server bot-advance request runtime — debounce, in-flight coalesce, single execute path.
 * Execution stays on Cloud Functions (`advanceSessionBots`); this module only schedules requests.
 */

import { assertBotAdvanceNotInFlight } from "./session-startup.js";
import { logBotOrchestrator } from "./bot-orchestrator.js";

const BOT_ADVANCE_DEBOUNCE_MS = 150;

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
 * @param {number} [deps.trickIntervalMs]
 */
export function createServerBotAdvanceRuntime(deps) {
  let inFlight = false;
  let scheduledTimer = null;
  let pendingWake = false;
  let lastCompletedAt = 0;

  function clearSchedule() {
    if (scheduledTimer) {
      clearTimeout(scheduledTimer);
      scheduledTimer = null;
    }
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
      logBotOrchestrator("skip-request", {
        reason: "presentation_blocked",
        requester: actorId,
        owner: "server",
        trigger: reason,
        ...deps.snapshotContext(session, scores),
      });
      return;
    }

    const handPhase = deps.getHandPhase?.(session) ?? null;
    const trickInterval = deps.trickIntervalMs ?? 0;
    const minGap = handPhase === "play" ? trickInterval : 0;
    const elapsed = Date.now() - lastCompletedAt;
    const delay = Math.max(BOT_ADVANCE_DEBOUNCE_MS, minGap > 0 ? minGap - elapsed : 0);

    if (inFlight) {
      pendingWake = true;
      logBotOrchestrator("coalesce-request", {
        reason: "advance_in_flight",
        requester: actorId,
        owner: "server",
        trigger: reason,
        delayMs: delay,
      });
      return;
    }

    clearSchedule();
    scheduledTimer = setTimeout(() => {
      scheduledTimer = null;
      void execute(session, scores, actorId, { reason });
    }, delay);

    logBotOrchestrator("schedule-request", {
      requester: actorId,
      owner: "server",
      trigger: reason,
      delayMs: delay,
      ...deps.snapshotContext(session, scores),
    });
  }

  async function execute(session, scores, actorId, { reason = "snapshot" } = {}) {
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
      return;
    }

    inFlight = true;
    const ctx = deps.snapshotContext(sessionObj, scores, { trigger: reason });
    logBotOrchestrator("request", {
      requester: actorId,
      owner: "server",
      roomId,
      sessionId,
      ...ctx,
    });

    try {
      const result = await deps.advanceSessionBots(roomId, sessionId, {
        requester: actorId,
        trigger: reason,
      });
      lastCompletedAt = Date.now();
      logBotOrchestrator("complete", {
        requester: actorId,
        owner: "server",
        roomId,
        sessionId,
        result,
        ...ctx,
      });
    } catch (err) {
      logBotOrchestrator("error", {
        requester: actorId,
        owner: "server",
        roomId,
        sessionId,
        message: err?.message ?? String(err),
        ...ctx,
      });
      console.warn("advanceSessionBots:", err);
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
