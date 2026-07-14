import { useLayoutEffect, useRef, useState } from "react";
import { playAnteChipFeedback } from "../feedback";
import {
  clearAntePile,
  clearAntePresentationDedupe,
  killAntePresentation,
  runAntePresentation,
} from "../animations/antePresentationMotion";
import { anteSequenceDurationMs } from "../antePresentationTiming";
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
  const anteCompletedHandRef = useRef<number | null>(null);
  completeRef.current = onAntePresentationComplete;

  const fireAnteComplete = () => {
    if (anteCompletedHandRef.current === handNumber) return;
    anteCompletedHandRef.current = handNumber;
    completeRef.current?.();
  };

  useLayoutEffect(() => {
    if (handRef.current !== handNumber) {
      clearAntePresentationDedupe(handRef.current);
      handRef.current = handNumber;
      anteCompletedHandRef.current = null;
      setAnteLandedCount(0);
      killAntePresentation();
      const root = tableRootRef.current;
      if (root) clearAntePile(root);
    }
  }, [handNumber, tableRootRef]);

  useLayoutEffect(() => {
    if (phase !== "ante") return;
    if (anteAnimActive && shouldRunAntePresentation(phase, anteAnimActive, anteAmount)) return;
    fireAnteComplete();
  }, [phase, anteAnimActive, handNumber, anteAmount]);

  useLayoutEffect(() => {
    if (!shouldRunAntePresentation(phase, anteAnimActive, anteAmount)) {
      return;
    }

    const root = tableRootRef.current;
    if (!root) return;

    const ids = participantIds.filter(Boolean).slice(0, 8);
    if (!ids.length) {
      fireAnteComplete();
      return;
    }

    setAnteLandedCount(0);

    let rafId = 0;
    let watchdogId = 0;
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(watchdogId);
      fireAnteComplete();
    };

    const startSequence = () => {
      if (cancelled) return;

      const started = runAntePresentation(root, handNumber, ids, {
        onLand: (_playerId, playerIndex) => {
          playAnteChipFeedback(handNumber, playerIndex);
          setAnteLandedCount((n) => n + 1);
        },
        onComplete: () => {
          finish();
        },
      });

      if (!started) {
        finish();
        return;
      }

      watchdogId = window.setTimeout(
        finish,
        anteSequenceDurationMs(ids.length, prefersReducedMotion()) + 600,
      );
    };

    const waitForTargets = (frame = 0) => {
      if (cancelled) return;
      const pile = root.querySelector(".bpot__ante-pile");
      const target = root.querySelector("[data-ante-pot-target]");
      if (pile && target) {
        startSequence();
        return;
      }
      if (frame >= 24) {
        finish();
        return;
      }
      rafId = window.requestAnimationFrame(() => waitForTargets(frame + 1));
    };

    waitForTargets();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(watchdogId);
      killAntePresentation();
      clearAntePresentationDedupe(handNumber);
    };
  }, [phase, anteAnimActive, handNumber, participantIds.join(","), anteAmount, tableRootRef]);

  return { anteLandedCount };
}
