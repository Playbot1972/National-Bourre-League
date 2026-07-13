import { useLayoutEffect, useRef, useState } from "react";
import { playAnteChipFeedback } from "../feedback";
import {
  clearAntePile,
  killAntePresentation,
  runAntePresentation,
} from "../animations/antePresentationMotion";
import { prefersReducedMotion } from "../trickTiming";

export interface UseAntePresentationInput {
  phase: string;
  handNumber: number;
  anteAnimActive: boolean;
  participantIds: string[];
  anteAmount: number;
  tableRootRef: React.RefObject<HTMLElement | null>;
  onAntePresentationComplete?: () => void;
}

export interface AntePresentationState {
  anteLandedCount: number;
}

/** Pure gate for ante fly-in + per-player chip audio (testable). */
export function shouldRunAntePresentation(
  phase: string,
  anteAnimActive: boolean,
  anteAmount: number,
): boolean {
  return anteAnimActive && anteAmount > 0 && phase === "ante";
}

/**
 * Cartoon money fly-in from each seat to the pot — one launch/land beat per player.
 * Plays coin-chime-light on each land (not bulk-fired).
 */
export function useAntePresentation({
  phase,
  handNumber,
  anteAnimActive,
  participantIds,
  anteAmount,
  tableRootRef,
  onAntePresentationComplete,
}: UseAntePresentationInput): AntePresentationState {
  const [anteLandedCount, setAnteLandedCount] = useState(0);
  const handRef = useRef(handNumber);
  const completeRef = useRef(onAntePresentationComplete);
  completeRef.current = onAntePresentationComplete;

  useLayoutEffect(() => {
    if (handRef.current !== handNumber) {
      handRef.current = handNumber;
      setAnteLandedCount(0);
      killAntePresentation();
      const root = tableRootRef.current;
      if (root) clearAntePile(root);
    }
  }, [handNumber, tableRootRef]);

  useLayoutEffect(() => {
    if (!shouldRunAntePresentation(phase, anteAnimActive, anteAmount)) {
      return;
    }

    const root = tableRootRef.current;
    if (!root) return;

    const ids = participantIds.filter(Boolean).slice(0, 8);
    if (!ids.length) return;

    setAnteLandedCount(0);

    const started = runAntePresentation(root, handNumber, ids, {
      onLand: (_playerId, playerIndex) => {
        playAnteChipFeedback(handNumber, playerIndex);
        setAnteLandedCount((n) => n + 1);
      },
      onComplete: () => {
        completeRef.current?.();
      },
    });

    if (!started) {
      completeRef.current?.();
    }

    return () => {
      killAntePresentation();
    };
  }, [phase, anteAnimActive, handNumber, participantIds.join(","), anteAmount, tableRootRef]);

  return { anteLandedCount };
}
