import { useEffect, useLayoutEffect, useReducer, useRef } from "react";
import {
  CARD_LAND_MS,
  CARD_REVEAL_STAGGER_MS,
  prefersReducedMotion,
  trickResolutionScheduleMs,
  trumpBeatLedSuit,
  TRICK_HAND_END_DRAIN_MS,
  TRICK_PIPELINE_STUCK_MS,
  type TrickPresentationPhase,
} from "../trickTiming";
import {
  playFlyKey,
  clearPlayOriginCache,
  primePlayOrigins,
  snapshotPlayOrigin,
} from "../trickPlayFly";
import {
  buildTrickPresentationModel,
  createTrickPresentationStore,
  reduceTrickPresentation,
  type TrickPresentationModel,
} from "../trickPresentationMachine";
import { isGameFlowDebugEnabled, logGameFlow } from "../gameFlowDebug";
import type { CurrentTrickState, PlayedCardEntry } from "../types";

export interface UseTrickPresentationInput {
  phase?: string | null;
  currentTrick?: CurrentTrickState | null;
  tricksByPlayer: Record<string, number>;
  participantIds: string[];
  trumpSuit?: string | null;
  playedCards?: PlayedCardEntry[];
  turnPlayerId?: string | null;
  handComplete?: boolean;
}

export type TrickPresentation = TrickPresentationModel & {
  phase: TrickPresentationPhase;
  forceHandEndDrain: () => void;
};

export function useTrickPresentation({
  phase,
  currentTrick,
  tricksByPlayer,
  participantIds,
  trumpSuit,
  playedCards,
  turnPlayerId,
  handComplete = false,
}: UseTrickPresentationInput): TrickPresentation {
  const [store, dispatch] = useReducer(
    reduceTrickPresentation,
    tricksByPlayer,
    (initialTricks) => createTrickPresentationStore(initialTricks, currentTrick),
  );

  const timersRef = useRef<number[]>([]);
  const resolutionKeyRef = useRef<string | null>(null);
  const snapshottedPlaysRef = useRef<Set<string>>(new Set());
  const pipelineActiveRef = useRef(false);
  const revealTimerRef = useRef<number | null>(null);
  const targetRevealRef = useRef(0);
  const prevSessionPlayRef = useRef(false);
  const storeRef = useRef(store);
  storeRef.current = store;

  const pipelineActive =
    store.phase !== "live" || Boolean(store.pendingResolution);
  pipelineActiveRef.current = pipelineActive;
  const sessionPlayActive = phase === "play";

  const snapshotTrickPlayOrigins = (plays: { playerId: string; card: { rank: string; suit: string } }[]) => {
    for (const play of plays) {
      const key = playFlyKey(play);
      if (snapshottedPlaysRef.current.has(key)) continue;
      snapshottedPlaysRef.current.add(key);
      snapshotPlayOrigin(play.playerId, key);
    }
  };

  const clearTimers = () => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
    resolutionKeyRef.current = null;
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    const enteredPlay = sessionPlayActive && !prevSessionPlayRef.current;
    prevSessionPlayRef.current = sessionPlayActive;

    const handEnding =
      handComplete || (phase == null && participantIds.length === 0);

    if (enteredPlay || (!sessionPlayActive && !pipelineActiveRef.current && !handEnding)) {
      clearTimers();
      resolutionKeyRef.current = null;
      snapshottedPlaysRef.current.clear();
      clearPlayOriginCache();
      dispatch({
        type: "reinit",
        snapshot: { currentTrick, tricksByPlayer, playedCards },
      });
      if (isGameFlowDebugEnabled()) {
        logGameFlow("useTrickPresentation", enteredPlay ? "reinit-play-entry" : "reinit-idle", {
          trickNumber: currentTrick?.trickNumber,
          trickPlays: currentTrick?.plays?.length ?? 0,
        });
      }
      return;
    }

    dispatch({
      type: "serverUpdate",
      snapshot: { currentTrick, tricksByPlayer, playedCards },
      participantIds,
      trumpSuit,
      reducedMotion: prefersReducedMotion(),
    });
    if (isGameFlowDebugEnabled()) {
      logGameFlow("useTrickPresentation", "serverUpdate-effect", {
        sessionPhase: phase,
        trickNumber: currentTrick?.trickNumber,
        livePlays: currentTrick?.plays?.length ?? 0,
        turnPlayerId,
      });
    }
  }, [
    phase,
    currentTrick,
    tricksByPlayer,
    participantIds,
    trumpSuit,
    playedCards,
    sessionPlayActive,
    handComplete,
    participantIds.length,
  ]);

  useLayoutEffect(() => {
    if (!sessionPlayActive && !pipelineActive) return;
    primePlayOrigins(participantIds);
    if (turnPlayerId) primePlayOrigins([turnPlayerId]);
    const livePlays = currentTrick?.plays ?? [];
    if (livePlays.length > 0) snapshotTrickPlayOrigins(livePlays);
    const pendingPlays = store.pendingResolution?.frozen.plays ?? [];
    if (pendingPlays.length > 0) snapshotTrickPlayOrigins(pendingPlays);
  }, [
    sessionPlayActive,
    pipelineActive,
    participantIds,
    turnPlayerId,
    currentTrick?.plays,
    store.pendingResolution?.frozen.plays,
  ]);

  useEffect(() => {
    if ((!sessionPlayActive && !pipelineActive) || store.phase !== "trickComplete" || !store.frozenTrick) {
      return;
    }

    const key = `${store.frozenTrick.trickNumber}:${store.frozenTrick.winnerId}:${store.frozenTrick.plays.length}`;
    if (resolutionKeyRef.current === key) return;
    resolutionKeyRef.current = key;
    clearTimers();

    const frozen = store.frozenTrick;
    const isFinalTrick = frozen.trickNumber === 5;
    const scheduleMs = trickResolutionScheduleMs({
      trumpBeat: trumpBeatLedSuit(frozen.plays, frozen.leadSuit, trumpSuit),
      finalTrick: isFinalTrick,
      reducedMotion: prefersReducedMotion(),
    });

    schedule(() => dispatch({ type: "advancePhase" }), scheduleMs.readBeforeWinnerMs);
    schedule(() => dispatch({ type: "advancePhase" }), scheduleMs.readTotalMs);
    schedule(
      () => dispatch({ type: "advancePhase" }),
      scheduleMs.readTotalMs + scheduleMs.sweepMs,
    );
    schedule(
      () => dispatch({ type: "advancePhase" }),
      scheduleMs.pipelineMs,
    );
  }, [sessionPlayActive, pipelineActive, store.phase, store.frozenTrick, trumpSuit]);

  useEffect(() => {
    if ((!sessionPlayActive && !pipelineActive) || store.phase !== "live" || !store.pendingResolution) {
      return;
    }

    const playCount = store.pendingResolution.frozen.plays.length;
    if (store.revealedCount < playCount) return;

    const landMs = prefersReducedMotion() ? Math.round(CARD_LAND_MS * 0.55) : CARD_LAND_MS;
    const id = window.setTimeout(() => dispatch({ type: "commitTrickResolution" }), landMs);
    return () => window.clearTimeout(id);
  }, [
    sessionPlayActive,
    pipelineActive,
    store.phase,
    store.pendingResolution,
    store.revealedCount,
  ]);

  useEffect(() => {
    if (store.phase === "live") resolutionKeyRef.current = null;
  }, [store.phase]);

  useEffect(() => {
    if (!sessionPlayActive && !pipelineActive) return;
    if (store.phase === "live") return;

    const stuckMs = TRICK_PIPELINE_STUCK_MS;
    const id = window.setTimeout(() => {
      const current = storeRef.current;
      if (current.phase === "live") return;
      if (isGameFlowDebugEnabled()) {
        logGameFlow("useTrickPresentation", "pipeline-stuck-force-advance", {
          phase: current.phase,
          pendingResolution: Boolean(current.pendingResolution),
        });
      }
      dispatch({ type: "advancePhase" });
    }, stuckMs);

    return () => window.clearTimeout(id);
  }, [sessionPlayActive, pipelineActive, store.phase, store.pendingResolution]);

  useEffect(() => {
    if ((!sessionPlayActive && !pipelineActive) || store.phase !== "live" || !store.pendingResolution) {
      return;
    }

    const playCount = store.pendingResolution.frozen.plays.length;
    if (store.revealedCount >= playCount) return;

    const id = window.setTimeout(() => {
      const current = storeRef.current;
      if (current.phase !== "live" || !current.pendingResolution) return;
      if (current.revealedCount >= current.pendingResolution.frozen.plays.length) return;
      if (isGameFlowDebugEnabled()) {
        logGameFlow("useTrickPresentation", "pending-resolution-reveal-catchup", {
          revealedCount: current.revealedCount,
          target: current.pendingResolution.frozen.plays.length,
        });
      }
      dispatch({ type: "revealNextCard" });
    }, TRICK_PIPELINE_STUCK_MS);

    return () => window.clearTimeout(id);
  }, [
    sessionPlayActive,
    pipelineActive,
    store.phase,
    store.pendingResolution,
    store.revealedCount,
  ]);

  useEffect(() => {
    const handEndedForDrain =
      handComplete || (phase == null && participantIds.length === 0);
    if (!pipelineActive || !handEndedForDrain) return;
    if (sessionPlayActive && !handComplete) return;

    const drainTimers: number[] = [];
    const scheduleDrain = (fn: () => void, ms: number) => {
      drainTimers.push(window.setTimeout(fn, ms));
    };

    if (isGameFlowDebugEnabled()) {
      logGameFlow("useTrickPresentation", "hand-end-drain-armed", {
        phase: store.phase,
        pendingResolution: Boolean(store.pendingResolution),
        trickNumber:
          store.frozenTrick?.trickNumber ?? store.pendingResolution?.frozen.trickNumber,
      });
    }

    // Let the normal trick pipeline timers run at full pace — only force-clear as a
    // last resort so trick 5 and settlement are not compressed when bots finish fast.
    scheduleDrain(() => {
      const current = storeRef.current;
      if (current.phase === "live" && !current.pendingResolution) return;
      if (isGameFlowDebugEnabled()) {
        logGameFlow("useTrickPresentation", "hand-end-drain-force", {
          phase: current.phase,
          pendingResolution: Boolean(current.pendingResolution),
        });
      }
      dispatch({ type: "forceHandEndDrain" });
    }, TRICK_HAND_END_DRAIN_MS);

    return () => {
      for (const id of drainTimers) window.clearTimeout(id);
    };
  }, [
    sessionPlayActive,
    pipelineActive,
    store.phase,
    store.pendingResolution,
    store.frozenTrick,
    handComplete,
    phase,
    participantIds.length,
  ]);

  const targetReveal =
    store.phase === "live"
      ? Math.max(
          store.pendingResolution?.frozen.plays.length ?? 0,
          currentTrick?.plays?.length ?? 0,
          store.peakTrickPlays?.length ?? 0,
        )
      : store.revealedCount;

  targetRevealRef.current = targetReveal;

  const clearRevealTimer = () => {
    if (revealTimerRef.current != null) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  };

  const scheduleRevealIfNeeded = () => {
    if ((!sessionPlayActive && !pipelineActiveRef.current) || store.phase !== "live") {
      clearRevealTimer();
      return;
    }
    if (store.revealedCount >= targetRevealRef.current) {
      clearRevealTimer();
      return;
    }
    if (revealTimerRef.current != null) return;

    const timing = prefersReducedMotion()
      ? Math.round(CARD_REVEAL_STAGGER_MS * 0.55)
      : CARD_REVEAL_STAGGER_MS;
    revealTimerRef.current = window.setTimeout(() => {
      revealTimerRef.current = null;
      if (isGameFlowDebugEnabled()) {
        logGameFlow("useTrickPresentation", "revealNextCard-timer", {
          revealedCount: store.revealedCount,
          targetReveal: targetRevealRef.current,
        });
      }
      dispatch({ type: "revealNextCard" });
    }, timing);
  };

  useEffect(() => {
    scheduleRevealIfNeeded();
    return clearRevealTimer;
  }, [sessionPlayActive, pipelineActive, store.phase, store.revealedCount]);

  useEffect(() => {
    scheduleRevealIfNeeded();
  }, [targetReveal]);

  useEffect(() => {
    if ((!sessionPlayActive && !pipelineActive) || store.phase !== "live" || store.pendingResolution) {
      return;
    }
    if (store.revealedCount <= targetReveal) return;
    dispatch({ type: "clampRevealedCount", target: targetReveal });
  }, [
    sessionPlayActive,
    pipelineActive,
    store.phase,
    store.pendingResolution,
    targetReveal,
    store.revealedCount,
  ]);

  const model = buildTrickPresentationModel(store, currentTrick);
  return {
    ...model,
    forceHandEndDrain: () => dispatch({ type: "forceHandEndDrain" }),
  };
}
