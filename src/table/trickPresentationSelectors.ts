import type { TrickPresentationSnapshot } from "./trickPresentationStore";
import type { TrickPresentationPhase } from "./trickTiming";

export interface TrickSeatOverlay {
  phase: TrickPresentationPhase;
  displayTricksByPlayer: Record<string, number>;
  trickWinnerSeatId: string | null;
  suppressTurnPlayerId: boolean;
  isPipelineActive: boolean;
  revealedCount: number;
  revealTarget: number;
}

export interface TrickCenterProps {
  trickDisplayPlays: TrickPresentationSnapshot["displayPlays"];
  trickWinnerPlayerId: string | null;
  trickShowWinnerTag: boolean;
  trickPresentationPhase: TrickPresentationPhase;
  trickEchoPlays: TrickPresentationSnapshot["trickEchoPlays"];
  trickEchoWinnerId: string | null;
  trickEchoPhase: TrickPresentationPhase;
  showFinalTrickEcho: boolean;
  peakTrickPlayCount: number;
}

export interface TrickCollectionSlice {
  phase: TrickPresentationPhase;
  trickWinnerSeatId: string | null;
  frozenTrick: TrickPresentationSnapshot["frozenTrick"];
  displayTricksByPlayer: Record<string, number>;
}

export interface TrickSessionBridge {
  phase: TrickPresentationPhase;
  isPipelineActive: boolean;
  revealedCount: number;
  revealTarget: number;
  peakPlayCount: number;
  displayPlaysLength: number;
  displayTricksByPlayer: Record<string, number>;
  trickWinnerSeatId: string | null;
  suppressTurnPlayerId: boolean;
  forceHandEndDrain: () => void;
}

const EMPTY_TRICKS: Record<string, number> = {};

function tricksEqual(a: Record<string, number>, b: Record<string, number>): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function selectTrickSeatOverlay(
  snapshot: TrickPresentationSnapshot | null,
): TrickSeatOverlay {
  if (!snapshot) {
    return {
      phase: "live",
      displayTricksByPlayer: EMPTY_TRICKS,
      trickWinnerSeatId: null,
      suppressTurnPlayerId: false,
      isPipelineActive: false,
      revealedCount: 0,
      revealTarget: 0,
    };
  }
  return {
    phase: snapshot.phase,
    displayTricksByPlayer: snapshot.displayTricksByPlayer,
    trickWinnerSeatId: snapshot.trickWinnerSeatId,
    suppressTurnPlayerId: snapshot.suppressTurnPlayerId,
    isPipelineActive: snapshot.isPipelineActive,
    revealedCount: snapshot.revealedCount,
    revealTarget: snapshot.revealTarget,
  };
}

export function trickSeatOverlayEqual(a: TrickSeatOverlay, b: TrickSeatOverlay): boolean {
  return (
    a.phase === b.phase &&
    a.trickWinnerSeatId === b.trickWinnerSeatId &&
    a.suppressTurnPlayerId === b.suppressTurnPlayerId &&
    a.isPipelineActive === b.isPipelineActive &&
    a.revealedCount === b.revealedCount &&
    a.revealTarget === b.revealTarget &&
    tricksEqual(a.displayTricksByPlayer, b.displayTricksByPlayer)
  );
}

export function selectTrickCenterProps(
  snapshot: TrickPresentationSnapshot | null,
): TrickCenterProps {
  if (!snapshot) {
    return {
      trickDisplayPlays: [],
      trickWinnerPlayerId: null,
      trickShowWinnerTag: false,
      trickPresentationPhase: "live",
      trickEchoPlays: [],
      trickEchoWinnerId: null,
      trickEchoPhase: "live",
      showFinalTrickEcho: false,
      peakTrickPlayCount: 0,
    };
  }
  return {
    trickDisplayPlays: snapshot.displayPlays,
    trickWinnerPlayerId: snapshot.winnerPlayerId,
    trickShowWinnerTag: snapshot.showWinnerTag,
    trickPresentationPhase: snapshot.phase,
    trickEchoPlays: snapshot.trickEchoPlays,
    trickEchoWinnerId: snapshot.trickEchoWinnerId,
    trickEchoPhase: snapshot.trickEchoPhase,
    showFinalTrickEcho: snapshot.showFinalTrickEcho,
    peakTrickPlayCount: snapshot.peakPlayCount,
  };
}

export function trickCenterPropsEqual(a: TrickCenterProps, b: TrickCenterProps): boolean {
  return (
    a.trickDisplayPlays === b.trickDisplayPlays &&
    a.trickWinnerPlayerId === b.trickWinnerPlayerId &&
    a.trickShowWinnerTag === b.trickShowWinnerTag &&
    a.trickPresentationPhase === b.trickPresentationPhase &&
    a.trickEchoPlays === b.trickEchoPlays &&
    a.trickEchoWinnerId === b.trickEchoWinnerId &&
    a.trickEchoPhase === b.trickEchoPhase &&
    a.showFinalTrickEcho === b.showFinalTrickEcho &&
    a.peakTrickPlayCount === b.peakTrickPlayCount
  );
}

export function selectTrickCollectionSlice(
  snapshot: TrickPresentationSnapshot | null,
): TrickCollectionSlice {
  if (!snapshot) {
    return {
      phase: "live",
      trickWinnerSeatId: null,
      frozenTrick: null,
      displayTricksByPlayer: EMPTY_TRICKS,
    };
  }
  return {
    phase: snapshot.phase,
    trickWinnerSeatId: snapshot.trickWinnerSeatId,
    frozenTrick: snapshot.frozenTrick,
    displayTricksByPlayer: snapshot.displayTricksByPlayer,
  };
}

export function trickCollectionSliceEqual(
  a: TrickCollectionSlice,
  b: TrickCollectionSlice,
): boolean {
  return (
    a.phase === b.phase &&
    a.trickWinnerSeatId === b.trickWinnerSeatId &&
    a.frozenTrick === b.frozenTrick &&
    tricksEqual(a.displayTricksByPlayer, b.displayTricksByPlayer)
  );
}

const noopForceDrain = () => {};

export function selectTrickSessionBridge(
  snapshot: TrickPresentationSnapshot | null,
): TrickSessionBridge {
  if (!snapshot) {
    return {
      phase: "live",
      isPipelineActive: false,
      revealedCount: 0,
      revealTarget: 0,
      peakPlayCount: 0,
      displayPlaysLength: 0,
      displayTricksByPlayer: EMPTY_TRICKS,
      trickWinnerSeatId: null,
      suppressTurnPlayerId: false,
      forceHandEndDrain: noopForceDrain,
    };
  }
  return {
    phase: snapshot.phase,
    isPipelineActive: snapshot.isPipelineActive,
    revealedCount: snapshot.revealedCount,
    revealTarget: snapshot.revealTarget,
    peakPlayCount: snapshot.peakPlayCount,
    displayPlaysLength: snapshot.displayPlays.length,
    displayTricksByPlayer: snapshot.displayTricksByPlayer,
    trickWinnerSeatId: snapshot.trickWinnerSeatId,
    suppressTurnPlayerId: snapshot.suppressTurnPlayerId,
    forceHandEndDrain: snapshot.forceHandEndDrain,
  };
}

export function trickSessionBridgeEqual(a: TrickSessionBridge, b: TrickSessionBridge): boolean {
  return (
    a.phase === b.phase &&
    a.isPipelineActive === b.isPipelineActive &&
    a.revealedCount === b.revealedCount &&
    a.revealTarget === b.revealTarget &&
    a.peakPlayCount === b.peakPlayCount &&
    a.displayPlaysLength === b.displayPlaysLength &&
    tricksEqual(a.displayTricksByPlayer, b.displayTricksByPlayer) &&
    a.trickWinnerSeatId === b.trickWinnerSeatId &&
    a.suppressTurnPlayerId === b.suppressTurnPlayerId
  );
}
