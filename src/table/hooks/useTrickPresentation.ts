import { useEffect, useReducer, useRef } from "react";
import {
  CARD_LAND_MS,
  prefersReducedMotion,
  trickResolutionScheduleMs,
  trumpBeatLedSuit,
  type TrickPresentationPhase,
} from "../trickTiming";
import {
  buildTrickPresentationModel,
  createTrickPresentationStore,
  reduceTrickPresentation,
  type TrickPresentationModel,
} from "../trickPresentationMachine";
import type { CurrentTrickState } from "../types";

interface UseTrickPresentationInput {
  phase?: string | null;
  currentTrick?: CurrentTrickState | null;
  tricksByPlayer: Record<string, number>;
  participantIds: string[];
  trumpSuit?: string | null;
}

export type TrickPresentation = TrickPresentationModel & {
  phase: TrickPresentationPhase;
};

export function useTrickPresentation({
  phase,
  currentTrick,
  tricksByPlayer,
  participantIds,
  trumpSuit,
}: UseTrickPresentationInput): TrickPresentation {
  const [store, dispatch] = useReducer(
    reduceTrickPresentation,
    tricksByPlayer,
    (initialTricks) => createTrickPresentationStore(initialTricks, currentTrick),
  );

  const timersRef = useRef<number[]>([]);
  const resolutionKeyRef = useRef<string | null>(null);

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
    if (phase !== "play") {
      clearTimers();
      resolutionKeyRef.current = null;
      dispatch({
        type: "reinit",
        snapshot: { currentTrick, tricksByPlayer },
      });
      return;
    }

    dispatch({
      type: "serverUpdate",
      snapshot: { currentTrick, tricksByPlayer },
      participantIds,
      trumpSuit,
      reducedMotion: prefersReducedMotion(),
    });
  }, [phase, currentTrick, tricksByPlayer, participantIds, trumpSuit]);

  useEffect(() => {
    if (phase !== "play" || store.phase !== "trickComplete" || !store.frozenTrick) return;

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
  }, [phase, store.phase, store.frozenTrick, trumpSuit]);

  useEffect(() => {
    if (phase !== "play" || store.phase !== "live" || !store.pendingResolution) return;

    const playCount = store.pendingResolution.frozen.plays.length;
    if (store.revealedCount < playCount) return;

    const landMs = prefersReducedMotion() ? Math.round(CARD_LAND_MS * 0.55) : CARD_LAND_MS;
    const id = window.setTimeout(() => dispatch({ type: "commitTrickResolution" }), landMs);
    return () => window.clearTimeout(id);
  }, [phase, store.phase, store.pendingResolution, store.revealedCount]);

  useEffect(() => {
    if (store.phase === "live") resolutionKeyRef.current = null;
  }, [store.phase]);

  const targetReveal =
    store.phase === "live"
      ? store.pendingResolution?.frozen.plays.length ??
        (currentTrick?.plays?.length ?? 0)
      : store.revealedCount;

  useEffect(() => {
    if (phase !== "play" || store.phase !== "live") return;
    if (store.revealedCount >= targetReveal) return;

    const timing = prefersReducedMotion() ? Math.round(CARD_LAND_MS * 0.55) : CARD_LAND_MS;
    const id = window.setTimeout(() => dispatch({ type: "revealNextCard" }), timing);
    return () => window.clearTimeout(id);
  }, [phase, store.phase, store.revealedCount, targetReveal]);

  useEffect(() => {
    if (phase !== "play" || store.phase !== "live") return;
    if (targetReveal < store.revealedCount) {
      dispatch({
        type: "serverUpdate",
        snapshot: { currentTrick, tricksByPlayer },
        participantIds,
        trumpSuit,
        reducedMotion: prefersReducedMotion(),
      });
    }
  }, [phase, store.phase, targetReveal, store.revealedCount, currentTrick, tricksByPlayer, participantIds, trumpSuit]);

  const model = buildTrickPresentationModel(store, currentTrick);
  return model;
}
