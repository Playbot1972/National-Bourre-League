import { useEffect, useRef, type RefObject } from "react";
import {
  killTrumpMergePresentation,
  runTrumpMergeIntoHeroHand,
} from "../animations/trumpMergePresentation";
import { prefersReducedMotion } from "../trickTiming";

export interface UseTrumpMergePresentationInput {
  tableRootRef: RefObject<HTMLElement | null>;
  trumpMergeActive: boolean;
  isTrumpHolder: boolean;
  onComplete: () => void;
}

/** Fly center trump into hero slot 5 once when the server clears trumpUpcard. */
export function useTrumpMergePresentation({
  tableRootRef,
  trumpMergeActive,
  isTrumpHolder,
  onComplete,
}: UseTrumpMergePresentationInput): void {
  const mergeKeyRef = useRef<string | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!trumpMergeActive) {
      mergeKeyRef.current = null;
      return;
    }

    const mergeKey = "active";
    if (mergeKeyRef.current === mergeKey) return;
    mergeKeyRef.current = mergeKey;

    const finish = () => onCompleteRef.current();

    if (!isTrumpHolder || prefersReducedMotion()) {
      finish();
      return;
    }

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      const root = tableRootRef.current ?? document.querySelector<HTMLElement>(".btable-wrap");
      if (!root) {
        finish();
        return;
      }
      const tl = runTrumpMergeIntoHeroHand(root, {
        onComplete: () => {
          if (!cancelled) finish();
        },
      });
      if (!tl) finish();
    };

    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(run);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(id);
      killTrumpMergePresentation();
    };
  }, [trumpMergeActive, isTrumpHolder, tableRootRef]);
}
