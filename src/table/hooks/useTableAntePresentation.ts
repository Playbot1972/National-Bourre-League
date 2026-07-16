import { useLayoutEffect, useRef } from "react";
import {
  antePostOrder,
  killAntePresentation,
  runAntePresentation,
} from "../animations/antePresentationMotion";
import { ANTE_POST_HOLD_MS } from "../handPresentationTiming";
import { prefersReducedMotion } from "../trickTiming";

export interface UseTableAntePresentationInput {
  handNumber: number;
  phase: string | null | undefined;
  anteAnimActive: boolean;
  dealerId: string | null | undefined;
  participantIds: string[];
  seatRing: string[];
  tableRootRef: React.RefObject<HTMLElement | null>;
  onCoinLanded: (playerId: string) => void;
  onSequenceComplete: () => void;
}

export function useTableAntePresentation({
  handNumber,
  phase,
  anteAnimActive,
  dealerId,
  participantIds,
  seatRing,
  tableRootRef,
  onCoinLanded,
  onSequenceComplete,
}: UseTableAntePresentationInput): void {
  const lastKeyRef = useRef<string | null>(null);
  const handNumberRef = useRef(handNumber);
  const holdTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    if (!root) return;

    if (handNumberRef.current !== handNumber) {
      handNumberRef.current = handNumber;
      lastKeyRef.current = null;
      if (holdTimerRef.current != null) {
        window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      killAntePresentation();
    }
  }, [handNumber, tableRootRef]);

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    if (!root || !anteAnimActive || phase !== "ante") return;

    const order = antePostOrder(dealerId, participantIds, seatRing);
    const key = `${handNumber}:${order.join(",")}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    killAntePresentation();
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (!order.length) {
      onSequenceComplete();
      return;
    }

    const reduced = prefersReducedMotion();
    const holdMs = reduced ? Math.round(ANTE_POST_HOLD_MS * 0.55) : ANTE_POST_HOLD_MS;

    runAntePresentation({
      order,
      root,
      onCoinLanded,
      onComplete: () => {
        holdTimerRef.current = window.setTimeout(() => {
          holdTimerRef.current = null;
          onSequenceComplete();
        }, holdMs);
      },
    });

    return () => {
      if (holdTimerRef.current != null) {
        window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      killAntePresentation();
    };
  }, [
    handNumber,
    phase,
    anteAnimActive,
    dealerId,
    participantIds,
    seatRing,
    tableRootRef,
    onCoinLanded,
    onSequenceComplete,
  ]);
}
