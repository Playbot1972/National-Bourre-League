import { useEffect } from "react";
import { playAnteChipFeedback } from "../feedback";
import { clearAnteAudioTimers, scheduleAnteChipSounds } from "../feedback/anteAudio";
import { prefersReducedMotion } from "../trickTiming";

export interface UseAnteAudioInput {
  phase: string;
  handNumber: number;
  anteAnimActive: boolean;
  dealStaggerCount: number;
}

/** One coin-chime per player when the ante chip animation runs. */
export function useAnteAudio({
  phase,
  handNumber,
  anteAnimActive,
  dealStaggerCount,
}: UseAnteAudioInput): void {
  useEffect(() => {
    if (phase !== "ante" || !anteAnimActive) return;

    const reduced = prefersReducedMotion();
    const scheduled = scheduleAnteChipSounds(
      handNumber,
      dealStaggerCount,
      (playerIndex) => {
        playAnteChipFeedback(handNumber, playerIndex);
      },
      { staggerMs: reduced ? 44 : undefined },
    );

    if (import.meta.env.DEV && scheduled) {
      console.log("[nbl-audio] ante-sequence", {
        handNumber,
        playerCount: dealStaggerCount,
      });
    }

    return () => {
      clearAnteAudioTimers();
    };
  }, [phase, anteAnimActive, handNumber, dealStaggerCount]);
}
