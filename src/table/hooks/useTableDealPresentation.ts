import { useLayoutEffect, useRef, useState } from "react";
import { activePlayerOrder, CARDS_PER_PLAYER } from "../../game/playerOrder";
import { seatRingPlayerIds } from "../layout/seatOrder";
import {
  buildClockwiseDealSteps,
  dealPresentationDurationMs,
  killDealPresentation,
  resetDealRevealMarkers,
  runClockwiseDealPresentation,
} from "../animations/dealPresentationMotion";
import { handOpenLog } from "../handOpeningDebug";
import { setDealPresentationActive } from "../presentationMotionBusy";
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

export function useTableDealPresentation({
  session,
  heroCards,
  privateHandReady = false,
  handPresentationPhase,
  onDealPresentationComplete,
  tableRootRef,
}: UseTableDealPresentationInput): boolean {
  const [clockwiseDealing, setClockwiseDealing] = useState(false);
  const lastDealKeyRef = useRef<string | null>(null);
  const handNumberRef = useRef(session.handNumber);
  const dealCompleteRef = useRef(onDealPresentationComplete);
  dealCompleteRef.current = onDealPresentationComplete;

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    if (!root) return;

    if (handNumberRef.current !== session.handNumber) {
      handNumberRef.current = session.handNumber;
      lastDealKeyRef.current = null;
      killDealPresentation();
      resetDealRevealMarkers(root);
      setDealPresentationActive(false);
      setClockwiseDealing(false);
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

    const dealKey = `${session.handNumber}:${cardCount}:${session.participantIds.join(",")}`;
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

    lastDealKeyRef.current = dealKey;
    killDealPresentation();
    resetDealRevealMarkers(root);
    root.classList.add("btable-wrap--clockwise-dealing");
    setClockwiseDealing(true);
    setDealPresentationActive(true);
    handOpenLog("deal-start", {
      handNumber: session.handNumber,
      stepCount: steps.length,
      participantCount: dealOrder.length,
    });

    const reduced = prefersReducedMotion();
    const rafId = window.requestAnimationFrame(() => {
      runClockwiseDealPresentation({
        steps,
        root,
        trumpHolderId: session.trumpHolderId ?? session.dealerId ?? null,
        onComplete: () => {
          root.classList.remove("btable-wrap--clockwise-dealing");
          setClockwiseDealing(false);
          setDealPresentationActive(false);
          handOpenLog("deal-animation-complete", { handNumber: session.handNumber });
          dealCompleteRef.current?.();
        },
      });
    });

    const watchdog = window.setTimeout(
      () => {
        root.classList.remove("btable-wrap--clockwise-dealing");
        setClockwiseDealing(false);
        setDealPresentationActive(false);
        dealCompleteRef.current?.();
      },
      dealPresentationDurationMs(steps.length, reduced) + 400,
    );

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(watchdog);
      killDealPresentation();
      root.classList.remove("btable-wrap--clockwise-dealing");
      setDealPresentationActive(false);
      setClockwiseDealing(false);
    };
  }, [
    session.handNumber,
    session.dealerId,
    session.participantIds,
    session.trumpHolderId,
    heroCards.length,
    privateHandReady,
    handPresentationPhase,
    tableRootRef,
  ]);

  return clockwiseDealing;
}
