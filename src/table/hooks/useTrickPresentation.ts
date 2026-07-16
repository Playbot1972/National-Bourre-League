import { useEffect, useLayoutEffect, useReducer, useRef, useCallback } from "react";
import {
  CARD_LAND_MS,
  CARD_REVEAL_STAGGER_MS,
  FINAL_HAND_TRICK_PRESENTATION_MS,
  prefersReducedMotion,
  trickResolutionScheduleMs,
  trumpBeatLedSuit,
  type TrickPresentationPhase,
} from "../trickTiming";
import {
  playFlyKey,
  clearPlayOriginCache,
  forcePrimePlayOrigin,
  primePlayOrigins,
  snapshotPlayOrigin,
} from "../trickPlayFly";
import {
  buildTrickPresentationModel,
  createTrickPresentationStore,
  reduceTrickPresentation,
  shouldReinitTrickPresentationStore,
  type TrickPresentationModel,
} from "../trickPresentationMachine";
import {
  getHeroPlayHandoff,
  setHeroPlayTrickIndex,
} from "../heroPlayHandoff";
import { serializedPlays } from "../trickTiming";
import { isGameFlowDebugEnabled, logGameFlow } from "../gameFlowDebug";
import type { CurrentTrickState, PlayedCardEntry } from "../types";

interface UseTrickPresentationInput {
  phase?: string | null;
  handNumber?: number;
  currentTrick?: CurrentTrickState | null;
  tricksByPlayer: Record<string, number>;
  participantIds: string[];
  trumpSuit?: string | null;
  playedCards?: PlayedCardEntry[];
  turnPlayerId?: string | null;
  handComplete?: boolean;
  currentUserId?: string | null;
}

export type TrickPresentation = TrickPresentationModel & {
  phase: TrickPresentationPhase;
  forceHandEndDrain: () => void;
  clearHandEndEcho: () => void;
};

export function useTrickPresentation({
  phase,
  handNumber = 0,
  currentTrick,
  tricksByPlayer,
  participantIds,
  trumpSuit,
  playedCards,
  turnPlayerId,
  handComplete = false,
  currentUserId = null,
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
  const prevHandNumberRef = useRef(handNumber);
  const prevTurnPlayerIdRef = useRef<string | null>(null);
  const playOriginsPrimedRef = useRef(false);
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
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    const enteredPlay = sessionPlayActive && !prevSessionPlayRef.current;
    prevSessionPlayRef.current = sessionPlayActive;
    const handNumberChanged = handNumber !== prevHandNumberRef.current;
    prevHandNumberRef.current = handNumber;

    if (handNumberChanged && handNumber > 0) {
      clearTimers();
      resolutionKeyRef.current = null;
      snapshottedPlaysRef.current.clear();
      playOriginsPrimedRef.current = false;
      prevTurnPlayerIdRef.current = null;
      clearPlayOriginCache();
      dispatch({
        type: "reinit",
        snapshot: { currentTrick, tricksByPlayer, playedCards },
      });
      if (isGameFlowDebugEnabled()) {
        logGameFlow("useTrickPresentation", "reinit-hand-number", {
          handNumber,
          trickNumber: currentTrick?.trickNumber,
        });
      }
      return;
    }

    if (
      shouldReinitTrickPresentationStore({
        enteredPlay,
        sessionPlayActive,
        pipelineActive: pipelineActiveRef.current,
        handComplete,
        phase,
        participantCount: participantIds.length,
        handEndEchoTrick: storeRef.current.handEndEchoTrick,
      })
    ) {
      clearTimers();
      resolutionKeyRef.current = null;
      snapshottedPlaysRef.current.clear();
      playOriginsPrimedRef.current = false;
      prevTurnPlayerIdRef.current = null;
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
    handNumber,
    participantIds.length,
  ]);

  useLayoutEffect(() => {
    if (!sessionPlayActive && !pipelineActive) {
      prevTurnPlayerIdRef.current = null;
      playOriginsPrimedRef.current = false;
      return;
    }

    if (sessionPlayActive && !playOriginsPrimedRef.current) {
      primePlayOrigins(participantIds, { force: true });
      playOriginsPrimedRef.current = true;
    }

    if (turnPlayerId && turnPlayerId !== prevTurnPlayerIdRef.current) {
      forcePrimePlayOrigin(turnPlayerId);
      prevTurnPlayerIdRef.current = turnPlayerId;
    }

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

  useLayoutEffect(() => {
    const handoff = getHeroPlayHandoff();
    if (!handoff || !currentUserId || !sessionPlayActive || store.phase !== "live") return;
    if (!handoff.playKey.startsWith(`${currentUserId}:`)) return;

    const livePlays = serializedPlays(currentTrick);
    const peakPlays = store.peakTrickPlays ?? [];
    const plays =
      peakPlays.length >= livePlays.length && peakPlays.length > 0 ? peakPlays : livePlays;

    const heroIdx = plays.findIndex((p) => playFlyKey(p) === handoff.playKey);
    if (heroIdx < 0) return;

    setHeroPlayTrickIndex(heroIdx);

    const revealThrough = heroIdx + 1;
    if (store.revealedCount >= revealThrough) return;

    if (revealTimerRef.current != null) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    dispatch({ type: "revealThroughCount", count: revealThrough });
    if (isGameFlowDebugEnabled()) {
      logGameFlow("useTrickPresentation", "hero-play-immediate-reveal", {
        playKey: handoff.playKey,
        trickIndex: heroIdx,
        revealThrough,
      });
    }
  }, [
    sessionPlayActive,
    store.phase,
    store.revealedCount,
    store.peakTrickPlays,
    currentTrick?.plays,
    currentTrick?.trickNumber,
    handNumber,
    currentUserId,
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
    const scheduleMs = trickResolutionScheduleMs({
      trumpBeat: trumpBeatLedSuit(frozen.plays, frozen.leadSuit, trumpSuit),
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
    const handEndedForDrain =
      handComplete || (phase == null && participantIds.length === 0);
    if (!pipelineActive || !handEndedForDrain) return;
    if (sessionPlayActive && !handComplete) return;

    const reduced = prefersReducedMotion();
    const watchdogMs = reduced
      ? Math.max(3000, Math.round(FINAL_HAND_TRICK_PRESENTATION_MS * 0.55))
      : FINAL_HAND_TRICK_PRESENTATION_MS;

    if (isGameFlowDebugEnabled()) {
      logGameFlow("useTrickPresentation", "hand-end-drain-watchdog-armed", {
        phase: store.phase,
        pendingResolution: Boolean(store.pendingResolution),
        revealedCount: store.revealedCount,
        watchdogMs,
      });
    }

    const id = window.setTimeout(() => {
      const current = storeRef.current;
      if (current.phase === "live" && !current.pendingResolution) return;
      if (isGameFlowDebugEnabled()) {
        logGameFlow("useTrickPresentation", "hand-end-drain-force", {
          phase: current.phase,
          pendingResolution: Boolean(current.pendingResolution),
        });
      }
      dispatch({ type: "forceHandEndDrain" });
    }, watchdogMs);

    return () => window.clearTimeout(id);
  }, [
    sessionPlayActive,
    pipelineActive,
    store.phase,
    store.pendingResolution,
    store.revealedCount,
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
  const forceHandEndDrain = useCallback(() => dispatch({ type: "forceHandEndDrain" }), []);
  const clearHandEndEcho = useCallback(() => dispatch({ type: "clearHandEndEcho" }), []);
  return {
    ...model,
    forceHandEndDrain,
    clearHandEndEcho,
  };
}
