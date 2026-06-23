/**
 * Table open / join-window startup guards — detects stale session state after deploy
 * and classifies safe resume vs repair vs block paths.
 */

import type { SessionHandView } from "./liveHand";
import { getSessionEnrollment, isClearedPreDealHand, authoritativeCurrentHand } from "./liveHand";
import { isHandComplete } from "../table/logic";

export type TableStartupKind =
  | "ready_enrollment"
  | "ready_mid_hand"
  | "session_final"
  | "insufficient_players"
  | "stale_live_deal"
  | "enrollment_failed"
  | "session_missing";

export type TableStartupRecovery = "refresh" | "return_to_room" | "reopen_session";

export interface TableStartupAnalysis {
  kind: TableStartupKind;
  canOpenTable: boolean;
  needsEnrollment: boolean;
  shouldRepair: boolean;
  reason: string;
  recovery: TableStartupRecovery;
}

export {
  authoritativeCurrentHand,
  isClearedPreDealHand,
  sessionHandDealStarted,
  handPhaseStarted,
  isLegacyEnrollmentActive,
  isPagatDecisionActive,
  resolveTableEnrollmentActive,
  resolveCurrentHandChoicePlayerId,
  canPlayerShowHandChoice,
} from "./liveHand";

export {
  BOT_DECISION_DELAY_MIN_MS,
  BOT_DECISION_DELAY_MAX_MS,
  botDecisionClockKey,
  computeBotDecisionCountdown,
  startBotDecisionClock,
} from "./botDecisionClock";

export function isStaleLiveDealSnapshot(sessionData: SessionHandView | null | undefined): boolean {
  const livePublic = sessionData?.liveEnrollment?.deal?.publicHand;
  if (!livePublic?.phase) return false;
  if (getSessionEnrollment(sessionData)?.active) return false;
  if ((sessionData as { pendingCoWinSettlement?: unknown })?.pendingCoWinSettlement) return false;
  if (!isClearedPreDealHand(sessionData?.currentHand)) return false;
  const tricks = livePublic.tricksByPlayer ?? {};
  const participantIds = livePublic.participantIds ?? [];
  return isHandComplete(tricks, participantIds);
}

/** Orphan liveEnrollment.deal blocking join window or resume after deploy. */
export function shouldClearOrphanLiveEnrollment(sessionData: SessionHandView | null | undefined): boolean {
  if (!sessionData?.liveEnrollment?.deal) return false;
  if (isStaleLiveDealSnapshot(sessionData)) return true;
  const livePhase = sessionData.liveEnrollment.deal.publicHand?.phase ?? null;
  const enrollmentActive = Boolean(
    sessionData.liveEnrollment?.active || sessionData.handEnrollment?.active,
  );
  if ((livePhase === "draw" || livePhase === "play") && !enrollmentActive) {
    return isClearedPreDealHand(sessionData.currentHand);
  }
  if (livePhase === "draw" || livePhase === "play") return false;
  return isClearedPreDealHand(sessionData?.currentHand);
}

export function analyzeTableStartup(
  sessionData: { status?: string | null } & SessionHandView | null | undefined,
  readyPlayerCount: number,
): TableStartupAnalysis {
  if (!sessionData) {
    return {
      kind: "session_missing",
      canOpenTable: false,
      needsEnrollment: false,
      shouldRepair: false,
      reason: "session_not_found",
      recovery: "return_to_room",
    };
  }
  if (sessionData.status === "final") {
    return {
      kind: "session_final",
      canOpenTable: false,
      needsEnrollment: false,
      shouldRepair: false,
      reason: "session_final",
      recovery: "return_to_room",
    };
  }
  if (readyPlayerCount < 2) {
    return {
      kind: "insufficient_players",
      canOpenTable: false,
      needsEnrollment: false,
      shouldRepair: false,
      reason: "fewer_than_two_players",
      recovery: "return_to_room",
    };
  }

  const hand = authoritativeCurrentHand(sessionData);
  const phase = hand.phase ?? null;

  if (
    phase === "reveal" ||
    phase === "decision" ||
    phase === "draw" ||
    phase === "play"
  ) {
    return {
      kind: "ready_mid_hand",
      canOpenTable: true,
      needsEnrollment: false,
      shouldRepair: shouldClearOrphanLiveEnrollment(sessionData),
      reason: "hand_in_progress",
      recovery: "refresh",
    };
  }

  if (shouldClearOrphanLiveEnrollment(sessionData)) {
    return {
      kind: "stale_live_deal",
      canOpenTable: true,
      needsEnrollment: true,
      shouldRepair: true,
      reason: "orphan_live_enrollment_deal",
      recovery: "refresh",
    };
  }

  return {
    kind: "ready_enrollment",
    canOpenTable: true,
    needsEnrollment: true,
    shouldRepair: false,
    reason: "handoff_needs_deal",
    recovery: "refresh",
  };
}

export function tableStartupNeedsEnrollment(analysis: TableStartupAnalysis): boolean {
  return analysis.needsEnrollment;
}

export function tableStartupUserMessage(
  analysis: TableStartupAnalysis,
  err?: { code?: string; message?: string } | null,
): string {
  const msg = String(err?.message ?? "").toLowerCase();
  const permission =
    err?.code === "permission-denied" ||
    err?.code === "PERMISSION_DENIED" ||
    err?.code === "functions/permission-denied" ||
    msg.includes("missing or insufficient permissions") ||
    msg.includes("insufficient permissions");

  if (permission) {
    return "This table could not be opened because of a permissions problem. Refresh the page and try Go to Table again.";
  }

  switch (analysis.kind) {
    case "session_final":
      return "This session is finished. Return to the room and start a new table.";
    case "insufficient_players":
      return "Need at least two players at the table before opening the live view.";
    case "session_missing":
      return "This session is no longer available. Return to the room and pick an active session.";
    case "stale_live_deal":
      return "This table had leftover data from an older version. Refresh the page, then tap Go to Table again.";
    case "enrollment_failed":
      return "Could not deal the first hand for this table. Wait a moment, then tap Go to Table again.";
    case "ready_mid_hand":
      return "This hand is still in progress but the table could not load. Refresh and tap Go to Table again.";
    case "ready_enrollment":
      return "Could not open this table. Wait a moment, then tap Go to Table again.";
    default:
      return "Could not open this table safely. Return to the room and try again.";
  }
}
