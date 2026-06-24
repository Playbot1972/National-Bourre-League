import { useEffect, useMemo, useReducer, useRef } from "react";
import {
  buildHandPresentationModel,
  createHandPresentationStore,
  phaseScheduleMs,
  reduceHandPresentation,
  snapshotFromSession,
  type HandPresentationModel,
  type HandServerSnapshot,
} from "../handPresentationMachine";
import { isGameFlowDebugEnabled, logGameFlow } from "../gameFlowDebug";
import { PRESENTATION_WATCHDOG_MS, ENROLLMENT_SEAT_PULSE_MS } from "../handPresentationTiming";
import { prefersReducedMotion } from "../trickTiming";
import type { SerializedCard, TableSessionData } from "../types";

const EMPTY_IDS: string[] = [];
const EMPTY_HERO_CARDS: SerializedCard[] = [];

function heroDrawDelta(
  prevKeys: string[],
  nextKeys: string[],
): { discardCount: number; replaceCount: number } {
  const prev = new Set(prevKeys);
  const next = new Set(nextKeys);
  const removed = [...prev].filter((k) => !next.has(k)).length;
  const added = [...next].filter((k) => !prev.has(k)).length;
  return { discardCount: removed, replaceCount: added };
}

export interface UseHandPresentationInput {
  session: TableSessionData;
  enrollmentActive: boolean;
  potAmount: number;
  handComplete: boolean;
  trickPipelineActive?: boolean;
  heroCards?: SerializedCard[];
  enrolledIds?: string[];
  declinedIds?: string[];
  actionOrder?: string[];
}

export type HandPresentation = HandPresentationModel;

export function useHandPresentation({
  session,
  enrollmentActive,
  potAmount,
  handComplete,
  trickPipelineActive = false,
  heroCards = EMPTY_HERO_CARDS,
  enrolledIds = EMPTY_IDS,
  declinedIds = EMPTY_IDS,
  actionOrder,
}: UseHandPresentationInput): HandPresentation {
  const snapshot = useMemo(
    (): HandServerSnapshot =>
      snapshotFromSession({
        sessionId: session.sessionId,
        handNumber: session.handNumber,
        phase: session.phase,
        enrollmentActive,
        participantIds: session.participantIds,
        actionOrder: actionOrder ?? session.participantIds,
        drawCompletedIds: session.drawCompletedIds,
        turnPlayerId: session.turnPlayerId,
        trumpUpcard: session.trumpUpcard,
        dealerId: session.dealerId,
        handComplete,
        potAmount,
        carryOverPot: session.carryOverPot,
        enrolledIds,
        declinedIds,
      }),
    [
      session,
      enrollmentActive,
      potAmount,
      handComplete,
      enrolledIds,
      declinedIds,
      actionOrder,
    ],
  );

  const [store, dispatch] = useReducer(
    reduceHandPresentation,
    snapshot,
    createHandPresentationStore,
  );

  const timersRef = useRef<number[]>([]);
  const heroKeysRef = useRef<string[]>([]);
  const phaseKeyRef = useRef<string>("");

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
    const heroKeys = heroCards.map((c) => `${c.rank}-${c.suit}`);
    const delta = heroDrawDelta(heroKeysRef.current, heroKeys);
    heroKeysRef.current = heroKeys;

    dispatch({
      type: "serverUpdate",
      snapshot,
      heroDrawDiscardCount: delta.discardCount,
      heroDrawReplaceCount: delta.replaceCount,
    });
    if (isGameFlowDebugEnabled()) {
      logGameFlow("useHandPresentation", "serverUpdate-effect", {
        handNumber: snapshot.handNumber,
        serverPhase: snapshot.phase,
        drawCompleted: snapshot.drawCompletedIds.length,
        participantCount: snapshot.participantIds.length,
        trumpUpcard: Boolean(snapshot.trumpUpcard),
        turnPlayerId: snapshot.turnPlayerId,
      });
    }
  }, [snapshot, heroCards]);

  const enrollmentPulseKey = JSON.stringify(store.enrollmentPulse);
  useEffect(() => {
    const hasPulse = Object.values(store.enrollmentPulse).some(Boolean);
    if (!hasPulse) return;
    const id = window.setTimeout(
      () => dispatch({ type: "clearEnrollmentPulse" }),
      ENROLLMENT_SEAT_PULSE_MS,
    );
    return () => window.clearTimeout(id);
  }, [enrollmentPulseKey]);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const phaseKey = `${store.phase}:${store.animatingDrawPlayerId ?? ""}:${store.drawAnimSubPhase}:${store.phaseStartedAt}`;
    if (phaseKeyRef.current === phaseKey) return;
    phaseKeyRef.current = phaseKey;

    clearTimers();
    const delay = phaseScheduleMs(store, reduced);
    if (delay <= 0) return;

    schedule(() => {
      if (isGameFlowDebugEnabled()) {
        logGameFlow("useHandPresentation", "advancePhase-timer", {
          fromPhase: store.phase,
          delay,
        });
      }
      dispatch({ type: "advancePhase" });
    }, delay);
    schedule(() => dispatch({ type: "watchdog" }), PRESENTATION_WATCHDOG_MS);
  }, [store.phase, store.animatingDrawPlayerId, store.drawAnimSubPhase, store.phaseStartedAt]);

  useEffect(() => {
    if (
      session.phase === "reveal" ||
      session.phase === "decision" ||
      session.phase === "draw" ||
      session.phase === "play"
    ) {
      const count = heroCards.length;
      if (count > 0) {
        dispatch({ type: "dealCardRevealed", count });
      }
    }
  }, [heroCards.length, session.phase]);

  useEffect(() => {
    if (trickPipelineActive) return;
    dispatch({ type: "tryBeginHandSettle" });
  }, [trickPipelineActive]);

  return buildHandPresentationModel(store);
}
