import { useLayoutEffect, useRef, useState } from "react";
import { playAnteChipFeedback } from "../feedback";
import {
  antePresentationDedupeKey,
  clearAntePile,
  killAntePresentation,
  runAntePresentation,
} from "../animations/antePresentationMotion";

export interface UseAntePresentationInput {
  sessionId: string;
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
 * Plays coin-chime-light on each land via the dedicated anteChip sound event.
 */
export function useAntePresentation({
  sessionId,
  phase,
  handNumber,
  anteAnimActive,
  participantIds,
  anteAmount,
  tableRootRef,
  onAntePresentationComplete,
}: UseAntePresentationInput): AntePresentationState {
  const [anteLandedCount, setAnteLandedCount] = useState(0);
  const presentationKeyRef = useRef<string | null>(null);
  const completeRef = useRef(onAntePresentationComplete);
  completeRef.current = onAntePresentationComplete;

  useLayoutEffect(() => {
    const ids = participantIds.filter(Boolean).slice(0, 8);
    const nextKey = antePresentationDedupeKey(sessionId, handNumber, ids, anteAmount);
    if (presentationKeyRef.current !== nextKey) {
      presentationKeyRef.current = nextKey;
      setAnteLandedCount(0);
      killAntePresentation();
      const root = tableRootRef.current;
      if (root) clearAntePile(root);
    }
  }, [sessionId, handNumber, participantIds.join(","), anteAmount, tableRootRef]);

  useLayoutEffect(() => {
    if (!shouldRunAntePresentation(phase, anteAnimActive, anteAmount)) {
      return;
    }

    const root = tableRootRef.current;
    if (!root) return;

    const ids = participantIds.filter(Boolean).slice(0, 8);
    if (!ids.length) return;

    const presentationKey = antePresentationDedupeKey(sessionId, handNumber, ids, anteAmount);
    setAnteLandedCount(0);

    const started = runAntePresentation(root, presentationKey, ids, {
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
  }, [
    phase,
    anteAnimActive,
    sessionId,
    handNumber,
    participantIds.join(","),
    anteAmount,
    tableRootRef,
  ]);

  return { anteLandedCount };
}
