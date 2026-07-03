import {
  detectTrickResolution,
  serializedPlays,
  suppressesTurnIndicator,
  type FrozenTrick,
  type TrickPlay,
  type TrickPresentationPhase,
} from "./trickTiming";
import { playFlyKey } from "./trickPlayFly";
import { isGameFlowDebugEnabled, logGameFlow, logPresentationPhase } from "./gameFlowDebug";
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
  /** True while a trick is landing or running the hold/reveal/sweep pipeline. */
  isPipelineActive: boolean;
  /** Longest stable play prefix seen this trick (survives stale snapshots). */
  peakPlayCount: number;
  /** Stagger target — cards still waiting to be revealed when below this. */
  revealTarget: number;
  /** Frozen final trick for echo layer when the live row clears before settle. */
  trickEchoPlays: TrickPlay[];
  trickEchoWinnerId: string | null;
  trickEchoPhase: TrickPresentationPhase;
  showFinalTrickEcho: boolean;
  /** Frozen trick snapshot for collection animation and echo. */
  frozenTrick: FrozenTrick | null;
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
  /** Longest prefix-stable trick play list seen this trick (survives stale snapshots). */
  peakTrickPlays: TrickPlay[];
  /** Cards already shown this trick — never shrink display below this during live play. */
  displayRevealFloor: number;
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
    peakTrickPlays: serializedPlays(currentTrick),
    displayRevealFloor: 0,
  };
}

export function trickPlaysArePrefix(shorter: TrickPlay[], longer: TrickPlay[]): boolean {
  if (longer.length < shorter.length) return false;
  for (let i = 0; i < shorter.length; i++) {
    if (playFlyKey(shorter[i]) !== playFlyKey(longer[i])) return false;
  }
  return true;
}

export function updatePeakTrickPlays(
  store: TrickPresentationStore,
  snapshot: ServerTrickSnapshot,
  livePlays: TrickPlay[],
): TrickPlay[] {
  const liveTrickNum = snapshot.currentTrick?.trickNumber ?? null;
  const prevTrickNum = store.prevTrick?.trickNumber ?? null;
  const trickChanged =
    liveTrickNum != null && prevTrickNum != null && liveTrickNum !== prevTrickNum;

  let peak: TrickPlay[] = trickChanged ? [] : [...(store.peakTrickPlays ?? [])];
  for (const candidate of [livePlays, serializedPlays(store.prevTrick), store.peakTrickPlays ?? []]) {
    if (candidate.length > peak.length && trickPlaysArePrefix(peak, candidate)) {
      peak = candidate;
    }
  }
  return peak;
}

export function bufferServerSnapshot(
  store: TrickPresentationStore,
  snapshot: ServerTrickSnapshot,
): TrickPresentationStore {
  if (store.phase === "live") return store;
  return { ...store, pendingServer: snapshot };
}

export function liveRevealTarget(store: TrickPresentationStore): number {
  return Math.max(
    store.pendingResolution?.frozen.plays.length ?? 0,
    serializedPlays(store.prevTrick).length,
    store.peakTrickPlays?.length ?? 0,
  );
}

export function applyLiveServerUpdate(
  store: TrickPresentationStore,
  snapshot: ServerTrickSnapshot,
): TrickPresentationStore {
  const livePlays = serializedPlays(snapshot.currentTrick);
  const prevPlays = serializedPlays(store.prevTrick);
  const peakTrickPlays = updatePeakTrickPlays(store, snapshot, livePlays);
  const keepPrevTrick =
    store.phase === "live" &&
    !store.pendingResolution &&
    ((livePlays.length < store.revealedCount && prevPlays.length >= store.revealedCount) ||
      (livePlays.length < peakTrickPlays.length && prevPlays.length >= peakTrickPlays.length));

  const liveTrickNum = snapshot.currentTrick?.trickNumber ?? null;
  const prevTrickNum = store.prevTrick?.trickNumber ?? null;
  const trickChanged =
    liveTrickNum != null && prevTrickNum != null && liveTrickNum !== prevTrickNum;

  return {
    ...store,
    prevTricks: { ...snapshot.tricksByPlayer },
    prevTrick: keepPrevTrick ? store.prevTrick : snapshot.currentTrick,
    displayTricksByPlayer: { ...snapshot.tricksByPlayer },
    pendingServer: null,
    resolvedTricks: null,
    peakTrickPlays,
    displayRevealFloor: trickChanged ? 0 : store.displayRevealFloor,
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
    peakTrickPlays: frozen.plays,
  };
}

export type TrickPresentationEvent =
  | { type: "reset" }
  | { type: "reinit"; snapshot: ServerTrickSnapshot }
  | { type: "serverUpdate"; snapshot: ServerTrickSnapshot; participantIds: string[]; trumpSuit?: string | null; reducedMotion?: boolean }
  | { type: "revealNextCard" }
  | { type: "clampRevealedCount"; target: number }
  | { type: "commitTrickResolution" }
  | { type: "advancePhase" }
  | { type: "forceHandEndDrain" };

export function reduceTrickPresentation(
  store: TrickPresentationStore,
  event: TrickPresentationEvent,
): TrickPresentationStore {
  const next = reduceTrickPresentationCore(store, event);
  if (isGameFlowDebugEnabled()) {
    if (store.phase !== next.phase) {
      logPresentationPhase("trick", store.phase, next.phase, {
        trickNumber: next.frozenTrick?.trickNumber,
        winnerId: next.frozenTrick?.winnerId,
        pendingResolution: Boolean(next.pendingResolution),
      });
    }
    const plays = serializedPlays(store.prevTrick).length;
    const nextPlays = serializedPlays(next.prevTrick).length;
    if (
      store.phase !== next.phase ||
      store.revealedCount !== next.revealedCount ||
      plays !== nextPlays ||
      Boolean(store.pendingResolution) !== Boolean(next.pendingResolution) ||
      event.type === "serverUpdate"
    ) {
      logGameFlow("trickPresentation", event.type, {
        phase: `${store.phase} -> ${next.phase}`,
        revealedCount: `${store.revealedCount} -> ${next.revealedCount}`,
        prevTrickPlays: `${plays} -> ${nextPlays}`,
        peakPlays: next.peakTrickPlays?.length ?? 0,
        pendingResolution: Boolean(next.pendingResolution),
        livePlays: event.type === "serverUpdate" ? event.snapshot.currentTrick?.plays?.length : undefined,
      });
    }
  }
  return next;
}

function reduceTrickPresentationCore(
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
      const target = liveRevealTarget(store);
      if (store.revealedCount >= target) return store;
      const revealedCount = store.revealedCount + 1;
      return {
        ...store,
        revealedCount,
        displayRevealFloor: Math.max(store.displayRevealFloor, revealedCount),
      };
    }

    case "clampRevealedCount": {
      if (store.phase !== "live" || store.pendingResolution) return store;
      const safeTarget = Math.max(event.target, store.peakTrickPlays?.length ?? 0);
      if (store.revealedCount <= safeTarget) return store;
      return { ...store, revealedCount: safeTarget };
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

    case "forceHandEndDrain": {
      let next = store;
      if (next.phase === "live" && next.pendingResolution) {
        next = beginTrickResolution(
          { ...next, pendingResolution: null },
          next.pendingResolution.frozen,
          next.pendingResolution.snapshot.tricksByPlayer,
          next.pendingResolution.snapshot.currentTrick,
        );
      }
      if (next.phase === "live" && !next.pendingResolution) return next;

      const pending = next.pendingServer;
      const pendingTricks = pending?.tricksByPlayer ?? {};
      const pendingHasTricks = Object.values(pendingTricks).some((v) => (v ?? 0) > 0);
      const displayTricks = pendingHasTricks
        ? { ...pendingTricks }
        : { ...next.displayTricksByPlayer };
      const pendingReveal = serializedPlays(pending?.currentTrick).length;
      return {
        ...next,
        phase: "live",
        frozenTrick: null,
        showWinnerTag: false,
        revealedCount: pendingReveal,
        resolvedTricks: null,
        pendingResolution: null,
        pendingServer: null,
        prevTricks: pendingHasTricks ? { ...pendingTricks } : next.prevTricks,
        prevTrick: pending?.currentTrick ?? next.prevTrick,
        displayTricksByPlayer: displayTricks,
        peakTrickPlays: serializedPlays(pending?.currentTrick),
        displayRevealFloor: pendingReveal,
      };
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
            peakTrickPlays: serializedPlays(pending?.currentTrick),
            displayRevealFloor: pendingReveal,
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

export function resolveHoldPlays(
  store: TrickPresentationStore,
  livePlays: TrickPlay[],
): TrickPlay[] {
  const pendingPlays = store.pendingResolution?.frozen.plays ?? [];
  if (pendingPlays.length > 0) return pendingPlays;

  const prevPlays = serializedPlays(store.prevTrick);
  const peak = store.peakTrickPlays ?? [];
  if (store.phase !== "live") {
    return livePlays.length > 0 ? livePlays : prevPlays.length > 0 ? prevPlays : peak;
  }

  if (peak.length > livePlays.length) {
    return peak;
  }

  // Stale snapshots (e.g. trump upcard clear + play in one tick) may briefly shrink
  // currentTrick.plays — never drop cards the UI has already revealed.
  if (prevPlays.length > livePlays.length) {
    return prevPlays;
  }

  return livePlays.length > 0 ? livePlays : prevPlays;
}

export function buildTrickPresentationModel(
  store: TrickPresentationStore,
  liveCurrentTrick: CurrentTrickState | null | undefined,
): TrickPresentationModel {
  const livePlays = serializedPlays(liveCurrentTrick);
  const holdPlays = resolveHoldPlays(store, livePlays);
  const floor = store.displayRevealFloor;
  const holdForDisplay =
    holdPlays.length >= floor
      ? holdPlays
      : (store.peakTrickPlays?.length ?? 0) >= floor
        ? store.peakTrickPlays!
        : holdPlays;
  const rawRevealLimit =
    store.phase === "live"
      ? store.pendingResolution
        ? Math.max(store.revealedCount, holdForDisplay.length)
        : Math.min(store.revealedCount, holdForDisplay.length)
      : holdForDisplay.length;
  const revealLimit =
    store.phase === "live" && !store.pendingResolution
      ? Math.max(rawRevealLimit, floor)
      : rawRevealLimit;
  const displayPlays =
    store.phase === "live"
      ? holdForDisplay.slice(0, revealLimit)
      : store.frozenTrick?.plays ?? [];

  const trickEchoPlays = store.frozenTrick?.plays ?? [];
  const trickEchoWinnerId = store.frozenTrick?.winnerId ?? null;
  const trickEchoPhase = store.phase;
  const showFinalTrickEcho =
    trickEchoPlays.length > 0 &&
    displayPlays.length === 0 &&
    store.phase !== "live";

  const winnerPlayerId =
    store.phase === "live" || store.phase === "trickComplete"
      ? null
      : store.frozenTrick?.winnerId ?? null;

  const showWinnerTag =
    store.showWinnerTag && (store.phase === "winnerReveal" || store.phase === "collectTrick");

  const peakPlayCount = store.peakTrickPlays?.length ?? 0;
  const revealTarget =
    store.phase === "live"
      ? liveRevealTarget(store)
      : store.revealedCount;

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
    isPipelineActive: store.phase !== "live" || Boolean(store.pendingResolution),
    peakPlayCount,
    revealTarget,
    trickEchoPlays,
    trickEchoWinnerId,
    trickEchoPhase,
    showFinalTrickEcho,
    frozenTrick: store.frozenTrick,
  };
}
