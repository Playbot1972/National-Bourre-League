/** Canonical server-authoritative match identity for table readiness. */

import { isGameFlowDebugEnabled, logGameFlow } from "./gameFlowDebug";
import { isRobotPlayerId } from "./botThinkWindow";

export interface ServerSnapshot {
  sessionId: string;
  handNumber: number;
  trickNumber?: number | null;
  turnIndex?: number | null;
  serverActionSeq: number | null | undefined;
  turnPlayerId?: string | null;
}

export interface PresentationReadinessProjection {
  matchKey: string;
  pipelineActive: boolean;
  motionGateActive: boolean;
  revealCatchUp: boolean;
  handPresenting: boolean;
}

export interface TableReadinessInput {
  matchKey: string;
  turnPlayerId: string | null;
  heroId: string | null;
  botIds: ReadonlySet<string>;
  presentation: PresentationReadinessProjection;
  drawCompleted?: number;
  drawTotal?: number;
}

export interface TableReadiness {
  isHeroTurn: boolean;
  isBotTurn: boolean;
  visualCatchUpBusy: boolean;
  canHeroAct: boolean;
  needsBotDriver: boolean;
}

export function buildMatchKey(snapshot: ServerSnapshot): string {
  if (snapshot.serverActionSeq == null) {
    throw new Error("Missing authoritative serverActionSeq");
  }
  return `${snapshot.sessionId}-h${snapshot.handNumber}-t${snapshot.trickNumber ?? 0}-turn${snapshot.turnIndex ?? 0}-aseq${snapshot.serverActionSeq}`;
}

export function computeTurnIndex(
  actionOrder: readonly string[],
  turnPlayerId: string | null | undefined,
): number {
  if (!turnPlayerId) return 0;
  const idx = actionOrder.indexOf(turnPlayerId);
  return idx >= 0 ? idx : 0;
}

export function buildServerSnapshot(input: {
  sessionId: string;
  handNumber: number;
  trickNumber?: number | null;
  turnPlayerId?: string | null;
  serverActionSeq?: number | null;
  actionOrder?: readonly string[];
  participantIds?: readonly string[];
}): ServerSnapshot {
  const order =
    input.actionOrder && input.actionOrder.length > 0
      ? input.actionOrder
      : input.participantIds ?? [];
  return {
    sessionId: input.sessionId,
    handNumber: input.handNumber,
    trickNumber: input.trickNumber ?? 0,
    turnIndex: computeTurnIndex(order, input.turnPlayerId ?? null),
    serverActionSeq: input.serverActionSeq,
    turnPlayerId: input.turnPlayerId ?? null,
  };
}

export function isStaleMatchKey(storedKey: string, authoritativeKey: string): boolean {
  return storedKey !== authoritativeKey;
}

/** True only while live trick reveal is catching up to server plays on the current trick. */
export function isRevealCatchUpBusy(input: {
  phase: string;
  revealedCount: number;
  revealTarget: number;
  serverTrickPlays: number;
}): boolean {
  return (
    input.phase === "live" &&
    input.serverTrickPlays > 0 &&
    input.revealedCount < input.revealTarget
  );
}

export function deriveTableReadiness(input: TableReadinessInput): TableReadiness {
  const isHeroTurn = Boolean(input.turnPlayerId && input.heroId && input.turnPlayerId === input.heroId);
  const isBotTurn = Boolean(input.turnPlayerId && input.botIds.has(input.turnPlayerId));
  const visualCatchUpBusy =
    input.presentation.matchKey === input.matchKey &&
    (input.presentation.pipelineActive ||
      input.presentation.motionGateActive ||
      input.presentation.revealCatchUp ||
      input.presentation.handPresenting);
  return {
    isHeroTurn,
    isBotTurn,
    visualCatchUpBusy,
    canHeroAct: isHeroTurn && !visualCatchUpBusy,
    needsBotDriver: isBotTurn && !visualCatchUpBusy,
  };
}

export function collectBotIds(playerIds: readonly string[]): Set<string> {
  const ids = new Set<string>();
  for (const id of playerIds) {
    if (isRobotPlayerId(id)) ids.add(id);
  }
  return ids;
}

export function assertMatchKeyInvariants(input: TableReadinessInput & TableReadiness): void {
  if (input.isHeroTurn && input.isBotTurn) {
    const message = "Invariant violation: hero and bot cannot both own the turn";
    if (isGameFlowDebugEnabled()) {
      logGameFlow("matchKey", "invariant-violation", { message, input });
    }
    throw new Error(message);
  }
  if (input.canHeroAct && input.needsBotDriver) {
    const message = "Invariant violation: hero and bot cannot both be active";
    if (isGameFlowDebugEnabled()) {
      logGameFlow("matchKey", "invariant-violation", { message, input });
    }
    throw new Error(message);
  }
  if (
    input.presentation.matchKey !== input.matchKey &&
    (input.presentation.pipelineActive ||
      input.presentation.motionGateActive ||
      input.presentation.revealCatchUp ||
      input.presentation.handPresenting)
  ) {
    if (isGameFlowDebugEnabled()) {
      logGameFlow("matchKey", "stale-presentation-busy", {
        authoritative: input.matchKey,
        presentation: input.presentation.matchKey,
      });
    }
  }
  const drawCompleted = input.drawCompleted ?? 0;
  const drawTotal = input.drawTotal ?? 0;
  if (drawTotal > 0 && drawCompleted > drawTotal) {
    const message = `Invariant violation: drawCompleted (${drawCompleted}) > drawTotal (${drawTotal})`;
    if (isGameFlowDebugEnabled()) {
      logGameFlow("matchKey", "invariant-violation", { message, input });
    }
    throw new Error(message);
  }
}
