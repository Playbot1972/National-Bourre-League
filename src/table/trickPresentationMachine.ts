import {
  detectTrickResolution,
  serializedPlays,
  suppressesTurnIndicator,
  type FrozenTrick,
  type TrickPlay,
  type TrickPresentationPhase,
} from "./trickTiming";
import type { CurrentTrickState } from "./types";

export interface ServerTrickSnapshot {
  currentTrick: CurrentTrickState | null | undefined;
  tricksByPlayer: Record<string, number>;
}

export interface TrickPresentationModel {
  phase: TrickPresentationPhase;
  displayPlays: TrickPlay[];
  winnerPlayerId: string | null;
  showWinnerTag: boolean;
  displayTricksByPlayer: Record<string, number>;
  suppressTurnPlayerId: boolean;
  trickWinnerSeatId: string | null;
  revealedCount: number;
  isResolving: boolean;
}

export interface TrickPresentationStore {
  phase: TrickPresentationPhase;
  frozenTrick: FrozenTrick | null;
  revealedCount: number;
  showWinnerTag: boolean;
  displayTricksByPlayer: Record<string, number>;
  prevTricks: Record<string, number>;
  prevTrick: CurrentTrickState | null | undefined;
  pendingServer: ServerTrickSnapshot | null;
  resolvedTricks: Record<string, number> | null;
}

export function createTrickPresentationStore(
  tricksByPlayer: Record<string, number>,
  currentTrick?: CurrentTrickState | null,
): TrickPresentationStore {
  return {
    phase: "live",
    frozenTrick: null,
    revealedCount: 0,
    showWinnerTag: false,
    displayTricksByPlayer: { ...tricksByPlayer },
    prevTricks: { ...tricksByPlayer },
    prevTrick: currentTrick,
    pendingServer: null,
    resolvedTricks: null,
  };
}

export function bufferServerSnapshot(
  store: TrickPresentationStore,
  snapshot: ServerTrickSnapshot,
): TrickPresentationStore {
  if (store.phase === "live") return store;
  return { ...store, pendingServer: snapshot };
}

export function applyLiveServerUpdate(
  store: TrickPresentationStore,
  snapshot: ServerTrickSnapshot,
): TrickPresentationStore {
  return {
    ...store,
    prevTricks: { ...snapshot.tricksByPlayer },
    prevTrick: snapshot.currentTrick,
    displayTricksByPlayer: { ...snapshot.tricksByPlayer },
    pendingServer: null,
    resolvedTricks: null,
  };
}

export function beginTrickResolution(
  store: TrickPresentationStore,
  frozen: FrozenTrick,
  nextTricks: Record<string, number>,
  nextTrick: CurrentTrickState | null | undefined,
): TrickPresentationStore {
  return {
    ...store,
    phase: "trickComplete",
    frozenTrick: frozen,
    revealedCount: frozen.plays.length,
    showWinnerTag: false,
    displayTricksByPlayer: { ...store.prevTricks },
    resolvedTricks: { ...nextTricks },
    pendingServer: {
      currentTrick: nextTrick,
      tricksByPlayer: nextTricks,
    },
  };
}

export type TrickPresentationEvent =
  | { type: "reset" }
  | { type: "reinit"; snapshot: ServerTrickSnapshot }
  | { type: "serverUpdate"; snapshot: ServerTrickSnapshot; participantIds: string[]; trumpSuit?: string | null; reducedMotion?: boolean }
  | { type: "revealNextCard" }
  | { type: "advancePhase" };

export function reduceTrickPresentation(
  store: TrickPresentationStore,
  event: TrickPresentationEvent,
): TrickPresentationStore {
  switch (event.type) {
    case "reset":
    case "reinit":
      return createTrickPresentationStore(
        event.type === "reinit" ? event.snapshot.tricksByPlayer : store.displayTricksByPlayer,
        event.type === "reinit" ? event.snapshot.currentTrick : null,
      );

    case "revealNextCard": {
      if (store.phase !== "live") return store;
      const target = serializedPlays(store.prevTrick).length;
      if (store.revealedCount >= target) return store;
      return { ...store, revealedCount: store.revealedCount + 1 };
    }

    case "advancePhase": {
      switch (store.phase) {
        case "trickComplete":
          return { ...store, phase: "winnerReveal", showWinnerTag: true };
        case "winnerReveal":
          return {
            ...store,
            phase: "collectTrick",
            displayTricksByPlayer: { ...(store.resolvedTricks ?? store.displayTricksByPlayer) },
          };
        case "collectTrick":
          return { ...store, phase: "nextLeadReady" };
        case "nextLeadReady": {
          const pending = store.pendingServer;
          return {
            ...store,
            phase: "live",
            frozenTrick: null,
            showWinnerTag: false,
            revealedCount: 0,
            resolvedTricks: null,
            pendingServer: null,
            prevTricks: pending ? { ...pending.tricksByPlayer } : store.prevTricks,
            prevTrick: pending?.currentTrick ?? store.prevTrick,
            displayTricksByPlayer: pending
              ? { ...pending.tricksByPlayer }
              : store.displayTricksByPlayer,
          };
        }
        default:
          return store;
      }
    }

    case "serverUpdate": {
      const { snapshot, participantIds } = event;
      if (store.phase !== "live") {
        return bufferServerSnapshot(store, snapshot);
      }

      const resolved = detectTrickResolution({
        prevTricks: store.prevTricks,
        nextTricks: snapshot.tricksByPlayer,
        participantIds,
        prevTrick: store.prevTrick,
      });

      if (resolved) {
        return beginTrickResolution(
          store,
          resolved,
          snapshot.tricksByPlayer,
          snapshot.currentTrick,
        );
      }

      return applyLiveServerUpdate(store, snapshot);
    }

    default:
      return store;
  }
}

export function buildTrickPresentationModel(
  store: TrickPresentationStore,
  liveCurrentTrick: CurrentTrickState | null | undefined,
): TrickPresentationModel {
  const livePlays = serializedPlays(liveCurrentTrick);
  const displayPlays =
    store.phase === "live"
      ? livePlays.slice(0, store.revealedCount)
      : store.frozenTrick?.plays ?? [];

  const winnerPlayerId =
    store.phase === "live" || store.phase === "trickComplete"
      ? null
      : store.frozenTrick?.winnerId ?? null;

  const showWinnerTag =
    store.showWinnerTag && (store.phase === "winnerReveal" || store.phase === "collectTrick");

  return {
    phase: store.phase,
    displayPlays,
    winnerPlayerId,
    showWinnerTag,
    displayTricksByPlayer: store.displayTricksByPlayer,
    suppressTurnPlayerId: suppressesTurnIndicator(store.phase),
    trickWinnerSeatId:
      store.phase === "live" || store.phase === "trickComplete"
        ? null
        : store.frozenTrick?.winnerId ?? null,
    revealedCount: store.revealedCount,
    isResolving: store.phase !== "live",
  };
}
