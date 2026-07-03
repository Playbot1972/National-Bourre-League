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
import { setDealPresentationActive } from "../presentationMotionBusy";
import { prefersReducedMotion } from "../trickTiming";
import type { SerializedCard, TableSessionData } from "../types";

export interface UseTableDealPresentationInput {
  session: TableSessionData;
  heroCards: SerializedCard[];
  /** Full private hand (5 cards) — trump holder effective hand is 4 while center trump is up. */
  dealSourceCards?: SerializedCard[];
  privateHandReady?: boolean;
  tableRootRef: React.RefObject<HTMLElement | null>;
  onDealPresentationComplete?: () => void;
}

export function useTableDealPresentation({
  session,
  heroCards,
  dealSourceCards,
  privateHandReady = false,
  tableRootRef,
  onDealPresentationComplete,
}: UseTableDealPresentationInput): boolean {
  const [clockwiseDealing, setClockwiseDealing] = useState(false);
  const lastDealKeyRef = useRef<string | null>(null);
  const handNumberRef = useRef(session.handNumber);

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

    const inDealPhase = session.phase === "reveal" || session.phase === "decision";

    const cardCount = dealSourceCards?.length ?? heroCards.length;
    if (!inDealPhase || !privateHandReady || cardCount < CARDS_PER_PLAYER) {
      return;
    }

    const dealKey = `${session.handNumber}:${cardCount}:${session.participantIds.join(",")}`;
    if (lastDealKeyRef.current === dealKey) {
      onDealPresentationComplete?.();
      return;
    }

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
          onDealPresentationComplete?.();
        },
      });
    });

    const watchdog = window.setTimeout(
      () => {
        root.classList.remove("btable-wrap--clockwise-dealing");
        setClockwiseDealing(false);
        setDealPresentationActive(false);
        onDealPresentationComplete?.();
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
    session.phase,
    session.dealerId,
    session.participantIds,
    dealSourceCards?.length,
    heroCards.length,
    privateHandReady,
    tableRootRef,
    onDealPresentationComplete,
  ]);

  return clockwiseDealing;
}
