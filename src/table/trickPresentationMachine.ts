import {
  detectTrickResolution,
  serializedPlays,
  suppressesTurnIndicator,
  type FrozenTrick,
  type TrickPlay,
  type TrickPresentationPhase,
} from "./trickTiming";
import type { CurrentTrickState, PlayedCardEntry } from "./types";

export interface ServerTrickSnapshot {
  currentTrick: CurrentTrickState | null | undefined;
  tricksByPlayer: Record<string, number>;
  playedCards?: PlayedCardEntry[];
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

export interface PendingTrickResolution {
  frozen: FrozenTrick;
  snapshot: ServerTrickSnapshot;
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
  /** Resolved on server but waiting for in-flight card land animations. */
  pendingResolution: PendingTrickResolution | null;
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
    pendingResolution: null,
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
  const livePlays = serializedPlays(snapshot.currentTrick);
  const prevPlays = serializedPlays(store.prevTrick);
  const keepPrevTrick =
    store.phase === "live" &&
    !store.pendingResolution &&
    livePlays.length < store.revealedCount &&
    prevPlays.length >= store.revealedCount;

  return {
    ...store,
    prevTricks: { ...snapshot.tricksByPlayer },
    prevTrick: keepPrevTrick ? store.prevTrick : snapshot.currentTrick,
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
  | { type: "clampRevealedCount"; target: number }
  | { type: "commitTrickResolution" }
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
      const target =
        store.pendingResolution?.frozen.plays.length ??
        serializedPlays(store.prevTrick).length;
      if (store.revealedCount >= target) return store;
      return { ...store, revealedCount: store.revealedCount + 1 };
    }

    case "clampRevealedCount": {
      if (store.phase !== "live" || store.pendingResolution) return store;
      if (store.revealedCount <= event.target) return store;
      return { ...store, revealedCount: event.target };
    }

    case "commitTrickResolution": {
      const pending = store.pendingResolution;
      if (!pending || store.phase !== "live") return store;
      return beginTrickResolution(
        { ...store, pendingResolution: null },
        pending.frozen,
        pending.snapshot.tricksByPlayer,
        pending.snapshot.currentTrick,
      );
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
          const pendingReveal = serializedPlays(pending?.currentTrick).length;
          return {
            ...store,
            phase: "live",
            frozenTrick: null,
            showWinnerTag: false,
            revealedCount: pendingReveal,
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
      if (store.pendingResolution) {
        return {
          ...store,
          pendingResolution: { frozen: store.pendingResolution.frozen, snapshot },
        };
      }
      if (store.phase !== "live") {
        return bufferServerSnapshot(store, snapshot);
      }

      const resolved = detectTrickResolution({
        prevTricks: store.prevTricks,
        nextTricks: snapshot.tricksByPlayer,
        participantIds,
        prevTrick: store.prevTrick,
        playedCards: snapshot.playedCards,
      });

      if (resolved) {
        return {
          ...store,
          pendingResolution: { frozen: resolved, snapshot },
        };
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
  const pendingPlays = store.pendingResolution?.frozen.plays ?? [];
  const holdPlays =
    pendingPlays.length > 0
      ? pendingPlays
      : livePlays.length > 0
        ? livePlays
        : serializedPlays(store.prevTrick);
  const displayPlays =
    store.phase === "live"
      ? holdPlays.slice(0, Math.min(store.revealedCount, holdPlays.length))
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
