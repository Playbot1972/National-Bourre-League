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
}

export interface AntePresentationState {
  anteLandedCount: number;
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
    if (phase !== "ante" || !anteAnimActive || anteAmount <= 0) {
      return;
    }

    const root = tableRootRef.current;
    if (!root) return;

    const ids = participantIds.filter(Boolean).slice(0, 8);
    if (!ids.length) return;

    setAnteLandedCount(0);

    const devLog = import.meta.env.DEV;
    if (devLog) {
      console.log("[nbl-ante] sequence-start", {
        handNumber,
        playerCount: ids.length,
        playerIds: ids,
        reducedMotion: prefersReducedMotion(),
      });
    }

    const started = runAntePresentation(root, handNumber, ids, {
      onLaunch: (playerId, playerIndex) => {
        if (devLog) {
          console.log("[nbl-ante] launched", { handNumber, playerId, playerIndex });
        }
      },
      onLand: (playerId, playerIndex) => {
        if (devLog) {
          console.log("[nbl-ante] landed", { handNumber, playerId, playerIndex });
        }
        playAnteChipFeedback(handNumber, playerIndex);
        if (devLog) {
          console.log("[nbl-ante] sound-requested", { handNumber, playerId, playerIndex });
        }
        setAnteLandedCount((n) => {
          const next = n + 1;
          if (devLog) {
            console.log("[nbl-ante] pot-increment", {
              handNumber,
              landed: next,
              total: ids.length,
            });
          }
          return next;
        });
      },
      onComplete: () => {
        if (devLog) {
          console.log("[nbl-ante] sequence-complete", { handNumber });
        }
      },
    });

    if (!started && devLog) {
      console.log("[nbl-ante] sequence-skipped-dedupe", { handNumber });
    }

    return () => {
      killAntePresentation();
    };
  }, [phase, anteAnimActive, handNumber, participantIds.join(","), anteAmount, tableRootRef]);

  return { anteLandedCount };
}
