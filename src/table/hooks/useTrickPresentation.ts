import { useEffect, useLayoutEffect, useReducer, useRef, useCallback } from "react";
import {
  CARD_LAND_MS,
  REVEAL_CATCHUP_BATCH_THRESHOLD,
  cardRevealStaggerMs,
  FINAL_HAND_TRICK_PRESENTATION_MS,
  prefersReducedMotion,
  resolveTrickPresentationTimingMode,
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
  presentationScopeKey,
  serverTrickNumber,
  effectivePresentationTrickNumber,
  shouldReinitPresentationScope,
} from "../presentationScope";
import { syncAuthoritativePresentationScope } from "../trickAnimationBridge";
import { resetPresentationMotionBusy } from "../presentationMotionBusy";
import {
  getHeroPlayHandoff,
  setHeroPlayTrickIndex,
} from "../heroPlayHandoff";
import { serializedPlays } from "../trickTiming";
import { isGameFlowDebugEnabled, logGameFlow } from "../gameFlowDebug";
import { isTrickPhaseTimerOwned } from "../presentationPhaseOwnership";
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
  completeTrickCollection: () => void;
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
  const resolutionBeatKeyRef = useRef<string | null>(null);
  const snapshottedPlaysRef = useRef<Set<string>>(new Set());
  const pipelineActiveRef = useRef(false);
  const revealTimerRef = useRef<number | null>(null);
  const targetRevealRef = useRef(0);
  const prevSessionPlayRef = useRef(false);
  const prevHandNumberRef = useRef(handNumber);
  const prevServerTrickRef = useRef(0);
  const presentationScopeRef = useRef(presentationScopeKey(handNumber, 0));
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
    const scopeAtSchedule = presentationScopeRef.current;
    const id = window.setTimeout(() => {
      if (presentationScopeRef.current !== scopeAtSchedule) return;
      fn();
    }, ms);
    timersRef.current.push(id);
  };

  useEffect(() => () => clearTimers(), []);

  const reinitForScope = useCallback(
    (nextHandNumber: number, reason: "hand" | "trick") => {
      const fromHand = prevHandNumberRef.current;
      const fromTrick = prevServerTrickRef.current;
      const trick = serverTrickNumber(currentTrick);
      const scope = presentationScopeKey(nextHandNumber, trick);
      prevHandNumberRef.current = nextHandNumber;
      prevServerTrickRef.current = trick;
      presentationScopeRef.current = scope;
      syncAuthoritativePresentationScope(scope);
      resetPresentationMotionBusy();
      clearTimers();
      resolutionKeyRef.current = null;
      resolutionBeatKeyRef.current = null;
      snapshottedPlaysRef.current.clear();
      playOriginsPrimedRef.current = false;
      prevTurnPlayerIdRef.current = null;
      clearPlayOriginCache();
      dispatch({
        type: "reinit",
        snapshot: { currentTrick, tricksByPlayer, playedCards },
      });
      if (isGameFlowDebugEnabled()) {
        logGameFlow("useTrickPresentation", "reinit-presentation-scope", {
          reason,
          fromHand,
          toHand: nextHandNumber,
          fromTrick,
          toTrick: trick,
          scope,
          hadPendingResolution: Boolean(storeRef.current.pendingResolution),
          phase: storeRef.current.phase,
        });
      }
    },
    [currentTrick, tricksByPlayer, playedCards],
  );

  useEffect(() => {
    const enteredPlay = sessionPlayActive && !prevSessionPlayRef.current;
    prevSessionPlayRef.current = sessionPlayActive;
    const serverTrick = serverTrickNumber(currentTrick);
    const scopeTrick = effectivePresentationTrickNumber(currentTrick, storeRef.current);

    if (
      shouldReinitPresentationScope({
        handNumber,
        prevHandNumber: prevHandNumberRef.current,
        serverTrickNumber: serverTrick,
        prevServerTrickNumber: prevServerTrickRef.current,
        store: storeRef.current,
      })
    ) {
      const reason = handNumber !== prevHandNumberRef.current ? "hand" : "trick";
      reinitForScope(handNumber, reason);
      return;
    }

    prevServerTrickRef.current = serverTrick > 0 ? serverTrick : prevServerTrickRef.current;
    presentationScopeRef.current = presentationScopeKey(handNumber, scopeTrick);
    syncAuthoritativePresentationScope(presentationScopeRef.current);

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
      resolutionBeatKeyRef.current = null;
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
    reinitForScope,
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
    if (!currentUserId || !sessionPlayActive || store.phase !== "live") return;

    const livePlays = serializedPlays(currentTrick);
    const peakPlays = store.peakTrickPlays ?? [];
    const plays =
      peakPlays.length >= livePlays.length && peakPlays.length > 0 ? peakPlays : livePlays;

    const handoff = getHeroPlayHandoff();
    let heroIdx = handoff?.playKey
      ? plays.findIndex((p) => playFlyKey(p) === handoff.playKey)
      : -1;
    if (heroIdx < 0) {
      heroIdx = plays.findIndex((p) => p.playerId === currentUserId);
    }
    if (heroIdx < 0) return;

    if (handoff?.playKey.startsWith(`${currentUserId}:`)) {
      setHeroPlayTrickIndex(heroIdx);
    }

    const revealThrough = heroIdx + 1;
    if (store.revealedCount >= revealThrough) return;

    if (revealTimerRef.current != null) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    dispatch({ type: "revealThroughCount", count: revealThrough });
    if (isGameFlowDebugEnabled()) {
      logGameFlow("useTrickPresentation", "hero-play-immediate-reveal", {
        playKey: handoff?.playKey ?? playFlyKey(plays[heroIdx]!),
        trickIndex: heroIdx,
        revealThrough,
        handoffActive: Boolean(handoff),
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
    if ((!sessionPlayActive && !pipelineActive) || !store.frozenTrick) {
      return;
    }
    if (!isTrickPhaseTimerOwned(store.phase)) return;

    const frozen = store.frozenTrick;
    const key = `${frozen.trickNumber}:${frozen.winnerId}:${frozen.plays.length}`;
    const beatKey = `${key}:${store.phase}`;
    if (resolutionBeatKeyRef.current === beatKey) return;
    resolutionBeatKeyRef.current = beatKey;
    resolutionKeyRef.current = key;
    clearTimers();

    const scheduleMs = trickResolutionScheduleMs({
      trumpBeat: trumpBeatLedSuit(frozen.plays, frozen.leadSuit, trumpSuit),
      reducedMotion: prefersReducedMotion(),
    });

    if (store.phase === "trickComplete") {
      schedule(() => dispatch({ type: "advancePhase" }), scheduleMs.readBeforeWinnerMs);
      return;
    }

    if (store.phase === "winnerReveal") {
      schedule(() => dispatch({ type: "advancePhase" }), scheduleMs.winnerRevealMs);
      return;
    }

    if (store.phase === "nextLeadReady") {
      schedule(() => dispatch({ type: "advancePhase" }), scheduleMs.nextLeadGapMs);
    }
  }, [
    sessionPlayActive,
    pipelineActive,
    store.phase,
    store.frozenTrick,
    trumpSuit,
  ]);

  useEffect(() => {
    if (store.phase === "live") {
      resolutionKeyRef.current = null;
      resolutionBeatKeyRef.current = null;
    }
  }, [store.phase]);

  useEffect(() => {
    if ((!sessionPlayActive && !pipelineActive) || store.phase !== "live" || !store.pendingResolution) {
      return;
    }

    const playCount = store.pendingResolution.frozen.plays.length;
    if (store.revealedCount < playCount) return;

    const visibleOnTable = buildTrickPresentationModel(
      storeRef.current,
      currentTrick,
    ).displayPlays.length;
    if (visibleOnTable < playCount) return;

    const landMs = prefersReducedMotion() ? Math.round(CARD_LAND_MS * 0.55) : CARD_LAND_MS;
    const scopeAtSchedule = presentationScopeRef.current;
    const id = window.setTimeout(() => {
      if (presentationScopeRef.current !== scopeAtSchedule) return;
      const latest = storeRef.current;
      if (!latest.pendingResolution || latest.phase !== "live") return;
      const latestVisible = buildTrickPresentationModel(latest, currentTrick).displayPlays.length;
      if (latestVisible < latest.pendingResolution.frozen.plays.length) return;
      dispatch({ type: "commitTrickResolution" });
    }, landMs);
    return () => window.clearTimeout(id);
  }, [
    sessionPlayActive,
    pipelineActive,
    store.phase,
    store.pendingResolution,
    store.revealedCount,
    currentTrick,
  ]);

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
      if (presentationScopeRef.current !== presentationScopeKey(handNumber, serverTrickNumber(currentTrick))) {
        return;
      }
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

    const serverPlays = currentTrick?.plays?.length ?? 0;
    const timingMode = resolveTrickPresentationTimingMode({
      revealedCount: store.revealedCount,
      targetReveal: targetRevealRef.current,
      serverTrickPlays: serverPlays,
    });
    const catchUp = timingMode === "catch-up";
    const backlog = targetRevealRef.current - store.revealedCount;
    const reducedMotion = prefersReducedMotion();
    const timing = cardRevealStaggerMs(timingMode, reducedMotion);

    revealTimerRef.current = window.setTimeout(() => {
      revealTimerRef.current = null;
      if (presentationScopeRef.current !== presentationScopeKey(handNumber, serverTrickNumber(currentTrick))) {
        return;
      }
      if (isGameFlowDebugEnabled()) {
        logGameFlow("useTrickPresentation", catchUp ? "revealNextCard-catchup" : "revealNextCard-timer", {
          revealedCount: store.revealedCount,
          targetReveal: targetRevealRef.current,
          backlog,
          timing,
          timingMode,
          batch: catchUp && backlog >= REVEAL_CATCHUP_BATCH_THRESHOLD,
        });
      }
      if (catchUp && backlog >= REVEAL_CATCHUP_BATCH_THRESHOLD) {
        dispatch({ type: "revealThroughCount", count: targetRevealRef.current });
        return;
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
  const completeTrickCollection = useCallback(() => {
    const current = storeRef.current;
    if (current.phase !== "collectTrick") return;
    if (isGameFlowDebugEnabled()) {
      logGameFlow("useTrickPresentation", "trick-collection-complete", {
        trickNumber: current.frozenTrick?.trickNumber,
        winnerId: current.frozenTrick?.winnerId,
      });
    }
    dispatch({ type: "advancePhase" });
  }, []);
  return {
    ...model,
    forceHandEndDrain,
    clearHandEndEcho,
    completeTrickCollection,
  };
}
