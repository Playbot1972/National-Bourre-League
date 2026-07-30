import type { TableSessionData } from "./types";

export interface PresentationMatchSnapshot {
  sessionId?: string | null;
  handNumber?: number | null;
  serverActionSeq?: number | null;
  trickNumber?: number | null;
  turnIndex?: number | null;
}

/** Monotonic-ish action counter from public session fields (no server seq field yet). */
export function deriveServerActionSeq(session: Pick<
  TableSessionData,
  "drawCompletedIds" | "currentTrick" | "playedCards" | "phase"
>): number {
  const drawDone = session.drawCompletedIds?.length ?? 0;
  const trickNum = session.currentTrick?.trickNumber ?? 0;
  const trickPlays = session.currentTrick?.plays?.length ?? 0;
  const played = session.playedCards?.length ?? 0;
  const phaseCode =
    session.phase === "play"
      ? 4
      : session.phase === "draw"
        ? 3
        : session.phase === "decision"
          ? 2
          : session.phase === "reveal"
            ? 1
            : 0;
  return phaseCode * 10_000 + drawDone * 1_000 + trickNum * 100 + trickPlays * 10 + played;
}

export function buildMatchKey(
  snapshot: PresentationMatchSnapshot | null | undefined,
): string {
  if (!snapshot?.sessionId) return "idle";
  const sessionId = snapshot.sessionId;
  const handNum = snapshot.handNumber ?? 0;
  const actionSeq = snapshot.serverActionSeq ?? 0;
  const trickNum = snapshot.trickNumber ?? 0;
  const turnIdx = snapshot.turnIndex ?? -1;
  return `${sessionId}-h${handNum}-t${trickNum}-turn${turnIdx}-aseq${actionSeq}`;
}

export function buildMatchKeyFromSession(session: TableSessionData): string {
  const order = session.actionOrder ?? session.participantIds;
  const turnId = session.turnPlayerId ?? null;
  const turnIndex = turnId ? order.indexOf(turnId) : -1;
  return buildMatchKey({
    sessionId: session.sessionId,
    handNumber: session.handNumber,
    serverActionSeq: deriveServerActionSeq(session),
    trickNumber: session.currentTrick?.trickNumber ?? 0,
    turnIndex,
  });
}

/** Phases where server authority is live — bot presentation is cosmetic only. */
export function isLiveHandPhaseForBotPresentation(
  phase: string | null | undefined,
): boolean {
  return phase === "reveal" || phase === "decision" || phase === "draw" || phase === "play";
}
