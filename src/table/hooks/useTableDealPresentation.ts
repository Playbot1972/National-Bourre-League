import { useLayoutEffect, useRef, useState } from "react";
import { activePlayerOrder, CARDS_PER_PLAYER } from "../../game/playerOrder";
import { seatRingPlayerIds } from "../layout/seatOrder";
import {
  buildClockwiseDealSteps,
  dealPresentationDurationMs,
  killDealPresentation,
  resetDealRevealMarkers,
  runClockwiseDealPresentation,
  type DealStep,
} from "../animations/dealPresentationMotion";
import { handOpenLog } from "../handOpeningDebug";
import { anteTimingMark } from "../anteTimingDebug";
import {
  isDealPresentationActive,
  setDealPresentationActive,
} from "../presentationMotionBusy";
import { prefersReducedMotion } from "../trickTiming";
import type { SerializedCard, TableSessionData } from "../types";

export interface UseTableDealPresentationInput {
  session: TableSessionData;
  heroCards: SerializedCard[];
  privateHandReady?: boolean;
  handPresentationPhase: string;
  onDealPresentationComplete?: () => void;
  tableRootRef: React.RefObject<HTMLElement | null>;
}

export interface TableDealPresentationState {
  /** Hides unrevealed cards — only while GSAP deal animation is running. */
  clockwiseDealing: boolean;
  /** Mounts opponent deal-target anchors before hide CSS is applied. */
  dealTargetsArmed: boolean;
}

const DEAL_SEAT_WAIT_FRAMES = 12;

function firstDealStepSeatReady(root: ParentNode, step: DealStep | undefined): boolean {
  if (!step) return true;
  return Boolean(
    root.querySelector(
      `[data-deal-seat="${step.playerId}"][data-deal-round="${step.roundIndex}"]`,
    ),
  );
}

/**
 * Deal key already committed but GSAP was torn down (effect re-run) — finish phase handoff.
 */
export function shouldRecoverDealPresentation(
  lastDealKey: string | null,
  dealKey: string,
  dealPresentationActive: boolean,
  handPresentationPhase: string,
): boolean {
  return (
    lastDealKey === dealKey &&
    handPresentationPhase === "deal" &&
    !dealPresentationActive
  );
}

export function useTableDealPresentation({
  session,
  heroCards,
  privateHandReady = false,
  handPresentationPhase,
  onDealPresentationComplete,
  tableRootRef,
}: UseTableDealPresentationInput): TableDealPresentationState {
  const [clockwiseDealing, setClockwiseDealing] = useState(false);
  const [dealTargetsArmed, setDealTargetsArmed] = useState(false);
  const lastDealKeyRef = useRef<string | null>(null);
  const handNumberRef = useRef(session.handNumber);
  const dealCompleteRef = useRef(onDealPresentationComplete);
  const dealCompletedHandRef = useRef<number | null>(null);
  dealCompleteRef.current = onDealPresentationComplete;

  const fireDealComplete = () => {
    if (dealCompletedHandRef.current === session.handNumber) return;
    dealCompletedHandRef.current = session.handNumber;
    dealCompleteRef.current?.();
  };

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    if (!root) return;

    if (handNumberRef.current !== session.handNumber) {
      handNumberRef.current = session.handNumber;
      lastDealKeyRef.current = null;
      dealCompletedHandRef.current = null;
      killDealPresentation();
      resetDealRevealMarkers(root);
      setDealPresentationActive(false);
      setClockwiseDealing(false);
      setDealTargetsArmed(false);
    }
  }, [session.handNumber, tableRootRef]);

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    if (!root) return;

    if (handPresentationPhase !== "deal") {
      return;
    }

    const cardCount = heroCards.length;
    if (!privateHandReady || cardCount < CARDS_PER_PLAYER) {
      return;
    }

    const participantKey = session.participantIds.join(",");
    const dealKey = `${session.handNumber}:${cardCount}:${participantKey}`;
    if (
      shouldRecoverDealPresentation(
        lastDealKeyRef.current,
        dealKey,
        isDealPresentationActive(),
        handPresentationPhase,
      )
    ) {
      handOpenLog("deal-handoff-recover", {
        handNumber: session.handNumber,
        dealKey,
      });
      fireDealComplete();
      return;
    }
    if (lastDealKeyRef.current === dealKey) return;

    const seatRing = seatRingPlayerIds(session.participantIds, session);
    const dealOrder = activePlayerOrder(
      session.dealerId,
      session.participantIds,
      seatRing.length ? seatRing : session.participantIds,
    );
    if (dealOrder.length < 2) return;

    const steps = buildClockwiseDealSteps(dealOrder, CARDS_PER_PLAYER);
    if (!steps.length) return;

    let dealCommitted = false;
    let cancelled = false;
    let rafId = 0;
    let watchdog = 0;
    const reduced = prefersReducedMotion();
    const trumpHolderId = session.trumpHolderId ?? session.dealerId ?? null;
    const firstStep = steps[0];

    // Mount opponent deal-target nodes only — do NOT apply hide CSS yet.
    setDealTargetsArmed(true);

    const finishDealPresentation = () => {
      if (cancelled) return;
      setClockwiseDealing(false);
      setDealTargetsArmed(false);
      setDealPresentationActive(false);
      resetDealRevealMarkers(root);
      fireDealComplete();
    };

    const beginDealMotion = (frame = 0) => {
      if (cancelled || dealCommitted) return;
      if (!firstDealStepSeatReady(root, firstStep)) {
        if (frame < DEAL_SEAT_WAIT_FRAMES) {
          rafId = window.requestAnimationFrame(() => beginDealMotion(frame + 1));
          return;
        }
        handOpenLog("deal-start-skipped-no-seats", {
          handNumber: session.handNumber,
          frame,
          playerId: firstStep?.playerId ?? null,
        });
        finishDealPresentation();
        return;
      }

      dealCommitted = true;
      lastDealKeyRef.current = dealKey;
      killDealPresentation();
      resetDealRevealMarkers(root);
      setClockwiseDealing(true);
      setDealPresentationActive(true);
      handOpenLog("deal-start", {
        handNumber: session.handNumber,
        stepCount: steps.length,
        participantCount: dealOrder.length,
      });
      anteTimingMark("deal-start", {
        handNumber: session.handNumber,
        stepCount: steps.length,
        source: "deal-presentation-hook",
      });

      runClockwiseDealPresentation({
        steps,
        root,
        trumpHolderId,
        onComplete: () => {
          handOpenLog("deal-animation-complete", { handNumber: session.handNumber });
          finishDealPresentation();
        },
      });

      watchdog = window.setTimeout(
        () => finishDealPresentation(),
        dealPresentationDurationMs(steps.length, reduced) + 400,
      );
    };

    rafId = window.requestAnimationFrame(() => beginDealMotion(0));

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(watchdog);
      killDealPresentation();
      setClockwiseDealing(false);
      setDealTargetsArmed(false);
      setDealPresentationActive(false);
      if (dealCommitted) {
        fireDealComplete();
      } else {
        lastDealKeyRef.current = null;
      }
    };
  }, [
    session.handNumber,
    session.dealerId,
    session.participantIds.join(","),
    session.trumpHolderId,
    heroCards.length,
    privateHandReady,
    handPresentationPhase,
    tableRootRef,
  ]);

  return { clockwiseDealing, dealTargetsArmed };
}
