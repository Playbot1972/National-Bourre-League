import type { TablePlayer, TableSessionData } from "./types";
import {
  buildHandFlowSnapshot,
  canSubmitHandAction,
  HAND_FLOW_PHASE,
} from "../session/handPhaseMachine";
import { isPlayerLockedInLiveHand } from "../session/liveHand";

export interface LocalActionInput {
  currentUserId: string | null | undefined;
  enrollmentActive: boolean;
  selfPlayer: TablePlayer | null | undefined;
  session: Pick<
    TableSessionData,
    "phase" | "turnPlayerId" | "drawCompletedIds" | "handEnrollment" | "participantIds"
  >;
  suppressTurn: boolean;
  handComplete: boolean;
  watchOnly?: boolean;
}

/**
 * True when the local human must act for the current Pagat step
 * (pass/play enrollment, draw/stand pat, or trick play).
 */
export function isLocalActionRequiredNow(input: LocalActionInput): boolean {
  const uid = input.currentUserId;
  if (!uid || input.handComplete || input.watchOnly) return false;

  const self = input.selfPlayer;
  const lockedInLiveHand = isPlayerLockedInLiveHand({
      phase: input.session.phase,
      participantIds: input.session.participantIds,
      playerId: uid,
    });
  if (!self || (!lockedInLiveHand && self.isOut)) return false;
  if (self.actionDeclared) return false;

  const snapshot = buildHandFlowSnapshot({
    session: {
      currentHand: {
        phase: input.session.phase ?? undefined,
        turnPlayerId: input.session.turnPlayerId ?? undefined,
        drawCompletedIds: input.session.drawCompletedIds,
        participantIds: input.session.participantIds ?? [],
        tricksByPlayer: {},
      },
      handEnrollment: input.session.handEnrollment ?? null,
    },
    suppressTurn: input.suppressTurn,
  });

  if (
    snapshot.phase === HAND_FLOW_PHASE.ENROLLMENT ||
    input.enrollmentActive
  ) {
    return Boolean(self.canToggleInHand || self.canPassEnrollment);
  }

  if (snapshot.phase === HAND_FLOW_PHASE.DEAL) {
    return false;
  }

  const drawAction = canSubmitHandAction({
    snapshot,
    action: "submit_draw",
    playerId: uid,
    actorId: uid,
    suppressTurn: input.suppressTurn,
    drawCompletedIds: input.session.drawCompletedIds,
  });
  if (snapshot.phase === HAND_FLOW_PHASE.DRAW && drawAction.ok) {
    return true;
  }

  const playAction = canSubmitHandAction({
    snapshot,
    action: "play_card",
    playerId: uid,
    actorId: uid,
    suppressTurn: input.suppressTurn,
  });
  if (snapshot.phase === HAND_FLOW_PHASE.PLAY && playAction.ok) {
    return true;
  }

  return false;
}

/** Hero draw/play controls — same gate as server `canSubmitHandAction`. */
export function isHeroDrawOrPlayTurn(input: LocalActionInput): boolean {
  const uid = input.currentUserId;
  if (!uid || input.handComplete || input.suppressTurn || input.watchOnly) return false;

  const snapshot = buildHandFlowSnapshot({
    session: {
      currentHand: {
        phase: input.session.phase ?? undefined,
        turnPlayerId: input.session.turnPlayerId ?? undefined,
        drawCompletedIds: input.session.drawCompletedIds,
        participantIds: input.session.participantIds ?? [],
        tricksByPlayer: {},
      },
      handEnrollment: input.session.handEnrollment ?? null,
    },
    suppressTurn: input.suppressTurn,
  });

  if (snapshot.phase === HAND_FLOW_PHASE.DRAW) {
    return canSubmitHandAction({
      snapshot,
      action: "submit_draw",
      playerId: uid,
      actorId: uid,
      suppressTurn: input.suppressTurn,
      drawCompletedIds: input.session.drawCompletedIds,
    }).ok;
  }

  if (snapshot.phase === HAND_FLOW_PHASE.PLAY) {
    return canSubmitHandAction({
      snapshot,
      action: "play_card",
      playerId: uid,
      actorId: uid,
      suppressTurn: input.suppressTurn,
    }).ok;
  }

  return Boolean(input.session.turnPlayerId === uid);
}

/** Stable key for reminder scheduler resets across phase/turn changes. */
export function localActionActivityKey(input: LocalActionInput): string {
  const enrollment = input.session.handEnrollment;
  const enrollmentKey = enrollment?.active
    ? `${enrollment.currentIndex ?? 0}:${enrollment.turnDeadlineMs ?? 0}`
    : "off";
  return [
    input.session.phase ?? "",
    input.session.turnPlayerId ?? "",
    enrollmentKey,
    input.selfPlayer?.actionDeclared ? "declared" : "open",
    input.session.drawCompletedIds?.join(",") ?? "",
    input.suppressTurn ? "1" : "0",
    isLocalActionRequiredNow(input) ? "act" : "wait",
  ].join("|");
}
