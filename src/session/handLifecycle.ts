/**
 * Session hand lifecycle — maps Firestore session snapshots to explicit phases.
 * Authoritative transitions remain in docs/firestore.js; this module is for
 * guards, logging, and tests.
 */

export type HandLifecyclePhase =
  | "waitingForPlayers"
  | "opening"
  | "deal"
  | "draw"
  | "play"
  | "settle"
  | "handoffToNextDeal";

export interface HandLifecycleContext {
  sessionStatus?: string | null;
  enrollmentActive?: boolean;
  handPhase?: string | null;
  participantCount?: number;
  handComplete?: boolean;
  pendingCoWin?: boolean;
  trickCount?: number;
  maxTricks?: number;
}

export interface HandLifecycleTransition {
  from: HandLifecyclePhase;
  to: HandLifecyclePhase;
  reason: string;
  blockedBy?: string;
}

const MAX_TRICKS = 5;

export function deriveHandLifecyclePhase(ctx: HandLifecycleContext): HandLifecyclePhase {
  if (ctx.sessionStatus === "final") return "waitingForPlayers";
  if (ctx.pendingCoWin) return "settle";
  if (ctx.handPhase === "draw") return "draw";
  if (ctx.handPhase === "play") {
    if (ctx.handComplete || (ctx.trickCount ?? 0) >= (ctx.maxTricks ?? MAX_TRICKS)) {
      return "settle";
    }
    return "play";
  }
  if (ctx.enrollmentActive) return "opening";
  if ((ctx.participantCount ?? 0) === 0) return "handoffToNextDeal";
  return "waitingForPlayers";
}

export function shouldOpenEnrollmentAfterSettle(ctx: HandLifecycleContext): boolean {
  /** Hand is ready for enrollment once a member taps Go to Table. */
  return (
    ctx.sessionStatus !== "final" &&
    !ctx.enrollmentActive &&
    !ctx.handPhase &&
    (ctx.participantCount ?? 0) === 0 &&
    !ctx.pendingCoWin
  );
}

export function nextLifecycleAfterSettle(ctx: HandLifecycleContext): HandLifecycleTransition {
  const from = deriveHandLifecyclePhase(ctx);
  if (shouldOpenEnrollmentAfterSettle(ctx)) {
    return {
      from,
      to: "handoffToNextDeal",
      reason: "settlement cleared hand; enrollment waits for Go to Table",
    };
  }
  if (ctx.enrollmentActive) {
    return { from, to: "opening", reason: "enrollment active after Go to Table" };
  }
  return {
    from,
    to: "handoffToNextDeal",
    reason: "awaiting enrollment bootstrap",
    blockedBy: describeLifecycleBlocker(ctx),
  };
}

export function describeLifecycleBlocker(ctx: HandLifecycleContext): string {
  if (ctx.sessionStatus === "final") return "session_final";
  if (ctx.pendingCoWin) return "pending_co_win_vote";
  if (ctx.handPhase === "play" || ctx.handPhase === "draw") return "hand_in_progress";
  if ((ctx.participantCount ?? 0) > 0) return "stale_participants_in_hand";
  if (!ctx.enrollmentActive) return "awaiting_go_to_table";
  return "none";
}

export function formatLifecycleLog(transition: HandLifecycleTransition): string {
  const block = transition.blockedBy ? ` blockedBy=${transition.blockedBy}` : "";
  return `[hand-lifecycle] ${transition.from} → ${transition.to}: ${transition.reason}${block}`;
}

/** Post-settle watchdog timeout — animation must not block longer than this. */
export const HAND_LIFECYCLE_WATCHDOG_MS = 12_000;

export function handLifecycleWatchdogFired(elapsedMs: number): boolean {
  return elapsedMs >= HAND_LIFECYCLE_WATCHDOG_MS;
}
