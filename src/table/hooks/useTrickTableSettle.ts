import { useLayoutEffect, useRef } from "react";
import { animateTableTrickSettle } from "../animations/cardMotion";
import type { TrickPresentationPhase } from "../trickTiming";

/**
 * GSAP felt settle when the trick pipeline enters nextLeadReady —
 * gives the table a beat to breathe before the next lead.
 */
export function useTrickTableSettle(
  phase: TrickPresentationPhase,
  tableRootRef: React.RefObject<HTMLElement | null>,
): void {
  const prevPhaseRef = useRef(phase);

  useLayoutEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    if (prev === phase || phase !== "nextLeadReady") return;

    const felt = tableRootRef.current?.querySelector<HTMLElement>(".btable__felt");
    if (!felt) return;
    animateTableTrickSettle(felt);
  }, [phase, tableRootRef]);
}
