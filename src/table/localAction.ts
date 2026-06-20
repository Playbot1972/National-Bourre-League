import type { TablePlayer, TableSessionData } from "./types";

export interface LocalActionInput {
  currentUserId: string | null | undefined;
  enrollmentActive: boolean;
  selfPlayer: TablePlayer | null | undefined;
  session: Pick<
    TableSessionData,
    "phase" | "turnPlayerId" | "drawCompletedIds" | "handEnrollment"
  >;
  suppressTurn: boolean;
  handComplete: boolean;
}

/**
 * True when the local human must act for the current Pagat step
 * (pass/play enrollment, draw/stand pat, or trick play).
 */
export function isLocalActionRequiredNow(input: LocalActionInput): boolean {
  const uid = input.currentUserId;
  if (!uid || input.handComplete) return false;

  const self = input.selfPlayer;
  if (!self || self.isOut) return false;

  if (input.enrollmentActive) {
    return Boolean(self.canToggleInHand || self.canPassEnrollment);
  }

  if (input.session.phase === "draw") {
    const drawDone = input.session.drawCompletedIds?.includes(uid) ?? false;
    return (
      input.session.turnPlayerId === uid && !input.suppressTurn && !drawDone
    );
  }

  if (input.session.phase === "play") {
    return input.session.turnPlayerId === uid && !input.suppressTurn;
  }

  return false;
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
    input.session.drawCompletedIds?.join(",") ?? "",
    input.suppressTurn ? "1" : "0",
    isLocalActionRequiredNow(input) ? "act" : "wait",
  ].join("|");
}
