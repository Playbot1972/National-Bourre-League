import { useLayoutEffect, useRef, useState } from "react";
import { activePlayerOrder, CARDS_PER_PLAYER } from "../../game/playerOrder";
import { canStartDealPresentation } from "../handPresentationMachine";
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
import type { TableSessionData } from "../types";

export interface UseTableDealPresentationInput {
  session: TableSessionData;
  dealPresentationAllowed: boolean;
  privateHandReady?: boolean;
  tableRootRef: React.RefObject<HTMLElement | null>;
}

export function useTableDealPresentation({
  session,
  dealPresentationAllowed,
  privateHandReady = false,
  tableRootRef,
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

    if (
      !canStartDealPresentation(
        dealPresentationAllowed,
        session.phase,
        privateHandReady,
      )
    ) {
      return;
    }

    const dealKey = `${session.handNumber}:${session.participantIds.join(",")}`;
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
        },
      });
    });

    const watchdog = window.setTimeout(
      () => {
        root.classList.remove("btable-wrap--clockwise-dealing");
        setClockwiseDealing(false);
        setDealPresentationActive(false);
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
    dealPresentationAllowed,
    privateHandReady,
    tableRootRef,
  ]);

  return clockwiseDealing;
}
