import { useLayoutEffect, useRef, useState } from "react";
import { playAnteChipFeedback } from "../feedback";
import {
  clearAntePile,
  killAntePresentation,
  runAntePresentation,
} from "../animations/antePresentationMotion";
import { isGameFlowDebugEnabled } from "../gameFlowDebug";
import { handOpenLog } from "../handOpeningDebug";
import { prefersReducedMotion } from "../trickTiming";

function anteDebug(message: string, detail: Record<string, unknown>): void {
  if (!import.meta.env.DEV && !isGameFlowDebugEnabled()) return;
  console.log(`[nbl-ante] ${message}`, detail);
}

export interface UseAntePresentationInput {
  phase: string;
  handNumber: number;
  anteAnimActive: boolean;
  participantIds: string[];
  anteAmount: number;
  tableRootRef: React.RefObject<HTMLElement | null>;
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

function anteSkipReason(phase: string, anteAnimActive: boolean, anteAmount: number): string {
  if (!anteAnimActive) return "anteAnimActive-false";
  if (anteAmount <= 0) return "anteAmount-zero";
  if (phase !== "ante") return "phase-not-ante";
  return "unknown";
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
}: UseAntePresentationInput): AntePresentationState {
  const [anteLandedCount, setAnteLandedCount] = useState(0);
  const handRef = useRef(handNumber);

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
      anteDebug("sequence-skipped-gate", {
        handNumber,
        phase,
        anteAnimActive,
        anteAmount,
        reason: anteSkipReason(phase, anteAnimActive, anteAmount),
      });
      return;
    }

    const root = tableRootRef.current;
    if (!root) {
      anteDebug("sequence-skipped-no-root", { handNumber });
      return;
    }

    const ids = participantIds.filter(Boolean).slice(0, 8);
    if (!ids.length) {
      anteDebug("sequence-skipped-no-players", { handNumber, participantIds });
      return;
    }

    setAnteLandedCount(0);

    anteDebug("sequence-start", {
      handNumber,
      playerCount: ids.length,
      playerIds: ids,
      reducedMotion: prefersReducedMotion(),
    });
    handOpenLog("ante-sequence-start", { handNumber, playerCount: ids.length });

    const started = runAntePresentation(root, handNumber, ids, {
      onLaunch: (playerId, playerIndex) => {
        anteDebug("launched", { handNumber, playerId, playerIndex });
      },
      onLand: (playerId, playerIndex) => {
        anteDebug("landed", { handNumber, playerId, playerIndex });
        handOpenLog("ante-landed", { handNumber, playerId, playerIndex });
        playAnteChipFeedback(handNumber, playerIndex);
        anteDebug("sound-requested", { handNumber, playerId, playerIndex, event: "anteChip" });
        setAnteLandedCount((n) => {
          const next = n + 1;
          anteDebug("pot-increment", { handNumber, landed: next, total: ids.length });
          return next;
        });
      },
      onComplete: () => {
        anteDebug("sequence-complete", { handNumber });
        handOpenLog("ante-sequence-complete", { handNumber });
      },
    });

    if (!started) {
      anteDebug("sequence-skipped-motion", {
        handNumber,
        reason: "dedupe-or-missing-dom",
      });
    }

    return () => {
      killAntePresentation();
    };
  }, [phase, anteAnimActive, handNumber, participantIds.join(","), anteAmount, tableRootRef]);

  return { anteLandedCount };
}
