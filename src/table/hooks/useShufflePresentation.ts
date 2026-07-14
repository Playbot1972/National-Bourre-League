import { useLayoutEffect, useRef } from "react";
import { playShuffleFeedback } from "../feedback";
import { shufflePresentationHoldMs } from "../handPresentationTiming";
import { handOpenLog } from "../handOpeningDebug";
import { anteTimingMark } from "../anteTimingDebug";
import { prefersReducedMotion } from "../trickTiming";

export interface UseShufflePresentationInput {
  phase: string;
  handNumber: number;
  onShufflePresentationComplete?: () => void;
}

/** Pure gate for post-ante shuffle audio (testable). */
export function shouldRunShufflePresentation(phase: string): boolean {
  return phase === "shuffle";
}

/**
 * Post-ante shuffle beat — runs only after ante presentation completes.
 * Clockwise deal waits for this phase to finish.
 */
export function useShufflePresentation({
  phase,
  handNumber,
  onShufflePresentationComplete,
}: UseShufflePresentationInput): void {
  const handRef = useRef(handNumber);
  const completeRef = useRef(onShufflePresentationComplete);
  completeRef.current = onShufflePresentationComplete;
  const startedKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (handRef.current !== handNumber) {
      handRef.current = handNumber;
      startedKeyRef.current = null;
    }
  }, [handNumber]);

  useLayoutEffect(() => {
    if (!shouldRunShufflePresentation(phase)) return;

    const key = `${handNumber}:shuffle`;
    if (startedKeyRef.current === key) return;
    startedKeyRef.current = key;

    handOpenLog("shuffle-start", { handNumber, source: "shuffle-presentation-hook" });
    anteTimingMark("shuffle-start", { handNumber, source: "shuffle-presentation-hook" });
    playShuffleFeedback({ delayMs: 0, force: true });

    const holdMs = shufflePresentationHoldMs(prefersReducedMotion());
    const timer = window.setTimeout(() => {
      handOpenLog("shuffle-sequence-complete", { handNumber });
      completeRef.current?.();
    }, holdMs);

    return () => {
      window.clearTimeout(timer);
      if (startedKeyRef.current === key) {
        startedKeyRef.current = null;
      }
    };
  }, [phase, handNumber]);
}
