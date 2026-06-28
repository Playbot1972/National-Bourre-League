/**
 * Hand lifecycle presentation helpers — logging, labels, and flat-context guards.
 * Orchestration (timers, Firestore writes) stays in app.js.
 */

import { getSessionCurrentHand, getSessionEnrollment } from "./firestore.js";
import { isClearedPreDealHand } from "./session-startup.js";

export function logHandLifecycleTransition(transition) {
  if (typeof console !== "undefined" && console.info) {
    console.info(
      `[hand-lifecycle] ${transition.from} → ${transition.to}: ${transition.reason}${
        transition.blockedBy ? ` blockedBy=${transition.blockedBy}` : ""
      }`,
    );
  }
}

/** Pagat reveal/decision clock — bots and timers run even without legacy enrollment. */
export function isPagatHandClock(sessionObj) {
  const phase = getSessionCurrentHand(sessionObj)?.phase ?? null;
  return phase === "reveal" || phase === "decision";
}

/** Flat snapshot for next-hand recovery (not the phase-machine HandFlowContext). */
export function buildHandLifecycleContext(sessionObj, { tablePlayOpen }) {
  const ch = getSessionCurrentHand(sessionObj);
  const enrollment = getSessionEnrollment(sessionObj);
  return {
    sessionStatus: sessionObj?.status ?? null,
    enrollmentActive: enrollment?.active === true,
    handPhase: ch?.phase ?? null,
    participantCount: ch?.participantIds?.length ?? 0,
    clearedHand: isClearedPreDealHand(ch),
    pendingCoWin: Boolean(sessionObj?.pendingCoWinSettlement),
    tablePlayOpen,
  };
}

/**
 * Cleared hand between settlements — ready to open the next join window.
 * (Distinct from `shouldOpenEnrollmentAfterSettle` in session-startup.js which uses flow phases.)
 */
export function isHandoffReadyForEnrollment(ctx) {
  return (
    ctx.sessionStatus !== "final" &&
    !ctx.enrollmentActive &&
    ctx.clearedHand === true &&
    !ctx.pendingCoWin
  );
}

export function isSessionAutoDealtNextHand(sessionObj) {
  if (getSessionEnrollment(sessionObj)?.active) return false;
  const phase = getSessionCurrentHand(sessionObj)?.phase;
  return phase === "reveal" || phase === "decision" || phase === "draw" || phase === "play";
}

export function nextHandOpenFeedbackMessage(sessionObj, dealerLabel) {
  const handNum = (sessionObj?.handCount ?? 0) + 1;
  const phase = getSessionCurrentHand(sessionObj)?.phase ?? null;
  if (isSessionAutoDealtNextHand(sessionObj)) {
    if (phase === "reveal" || phase === "decision") {
      return `Hand #${handNum} — see your cards, then play or pass`;
    }
    return `Hand #${handNum} — dealing next hand…`;
  }
  return `Hand #${handNum} — I'm in (clockwise from ${dealerLabel})`;
}
