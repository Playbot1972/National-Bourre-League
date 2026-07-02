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
import { PRESENTATION_WATCHDOG_MS, ENROLLMENT_SEAT_PULSE_MS, BOT_DRAW_PRESENTATION_WATCHDOG_MS, HAND_SETTLE_PIPELINE_WATCHDOG_MS } from "../handPresentationTiming";
import { prefersReducedMotion } from "../trickTiming";
import type { HandPresentationApi } from "../handPresentationApi";
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
  /** Last-resort: slam trick presentation to idle when hand-end convergence times out. */
  forceTrickHandEndDrain?: () => void;
  heroCards?: SerializedCard[];
  enrolledIds?: string[];
  declinedIds?: string[];
  actionOrder?: string[];
  /** Receives notifyDealPresentationComplete once the hook mounts. */
  presentationApiRef?: React.MutableRefObject<HandPresentationApi | null>;
}

export type HandPresentation = HandPresentationModel;

export function useHandPresentation({
  session,
  enrollmentActive,
  potAmount,
  handComplete,
  trickPipelineActive = false,
  forceTrickHandEndDrain,
  heroCards = EMPTY_HERO_CARDS,
  enrolledIds = EMPTY_IDS,
  declinedIds = EMPTY_IDS,
  actionOrder,
  presentationApiRef,
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
  const advanceArmedKeyRef = useRef<string | null>(null);
  const storeRef = useRef(store);
  storeRef.current = store;

  const clearTimers = () => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
    advanceArmedKeyRef.current = null;
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (!presentationApiRef) return;
    presentationApiRef.current = {
      notifyDealPresentationComplete: () => {
        dispatch({ type: "dealPresentationComplete" });
      },
    };
    return () => {
      presentationApiRef.current = null;
    };
  }, [presentationApiRef]);

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
    const phaseKey = `${store.handNumber}:${store.phase}:${store.animatingDrawPlayerId ?? ""}:${store.drawAnimSubPhase}:${store.phaseStartedAt}`;
    if (advanceArmedKeyRef.current === phaseKey) {
      if (isGameFlowDebugEnabled()) {
        logGameFlow("useHandPresentation", "advancePhase-timer-skip-duplicate", { phaseKey });
      }
      return;
    }

    clearTimers();
    const delay = phaseScheduleMs(store, reduced);
    if (delay <= 0) return;

    const armedAt = {
      handNumber: store.handNumber,
      phase: store.phase,
      animatingDrawPlayerId: store.animatingDrawPlayerId,
      drawAnimSubPhase: store.drawAnimSubPhase,
      phaseStartedAt: store.phaseStartedAt,
    };
    advanceArmedKeyRef.current = phaseKey;

    if (isGameFlowDebugEnabled()) {
      logGameFlow("useHandPresentation", "advancePhase-timer-armed", {
        phaseKey,
        delay,
        fromPhase: store.phase,
        drawAnimSubPhase: store.drawAnimSubPhase,
      });
    }

    schedule(() => {
      if (advanceArmedKeyRef.current !== phaseKey) return;
      advanceArmedKeyRef.current = null;

      const current = storeRef.current;
      if (
        current.handNumber !== armedAt.handNumber ||
        current.phase !== armedAt.phase ||
        current.animatingDrawPlayerId !== armedAt.animatingDrawPlayerId ||
        current.drawAnimSubPhase !== armedAt.drawAnimSubPhase ||
        current.phaseStartedAt !== armedAt.phaseStartedAt
      ) {
        if (isGameFlowDebugEnabled()) {
          logGameFlow("useHandPresentation", "advancePhase-timer-stale", {
            armedAt,
            current: {
              handNumber: current.handNumber,
              phase: current.phase,
              animatingDrawPlayerId: current.animatingDrawPlayerId,
              drawAnimSubPhase: current.drawAnimSubPhase,
              phaseStartedAt: current.phaseStartedAt,
            },
          });
        }
        return;
      }

      if (isGameFlowDebugEnabled()) {
        logGameFlow("useHandPresentation", "advancePhase-timer", {
          fromPhase: armedAt.phase,
          delay,
          animatingDrawPlayerId: armedAt.animatingDrawPlayerId,
          drawAnimSubPhase: armedAt.drawAnimSubPhase,
        });
      }
      dispatch({ type: "advancePhase" });
    }, delay);
    const watchdogMs =
      store.phase === "drawPlayer" || store.phase === "drawReady"
        ? BOT_DRAW_PRESENTATION_WATCHDOG_MS
        : PRESENTATION_WATCHDOG_MS;
    schedule(() => dispatch({ type: "watchdog" }), watchdogMs);
  }, [
    store.handNumber,
    store.phase,
    store.animatingDrawPlayerId,
    store.drawAnimSubPhase,
    store.phaseStartedAt,
    store.dealPresentationComplete,
  ]);

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

  useEffect(() => {
    if (store.phase !== "play" || !store.pendingHandSettle) return;

    if (!trickPipelineActive) {
      dispatch({ type: "tryBeginHandSettle" });
      return;
    }

    const id = window.setTimeout(() => {
      const current = storeRef.current;
      if (current.phase !== "play" || !current.pendingHandSettle) return;
      if (isGameFlowDebugEnabled()) {
        logGameFlow("useHandPresentation", "hand-end-convergence-force", {
          trickPipelineActive: true,
        });
      }
      forceTrickHandEndDrain?.();
      dispatch({ type: "tryBeginHandSettle" });
    }, HAND_SETTLE_PIPELINE_WATCHDOG_MS);

    return () => window.clearTimeout(id);
  }, [store.phase, store.pendingHandSettle, trickPipelineActive, forceTrickHandEndDrain]);

  return useMemo(() => buildHandPresentationModel(store), [store]);
}
