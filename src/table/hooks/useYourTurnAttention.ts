import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../trickTiming";

/** Delay before the local "Your Turn" attention cue appears. */
export const YOUR_TURN_ATTENTION_MS = 15_000;

/** Pop-in scale animation. */
export const YOUR_TURN_POP_MS = 380;

/** Brief hold after pop before exit. */
export const YOUR_TURN_HOLD_MS = 420;

/** Float up + fade off-screen. */
export const YOUR_TURN_EXIT_MS = 620;

export type YourTurnAttentionPhase = "hidden" | "pop" | "exit";

export function useYourTurnAttention(input: {
  isMyTurn: boolean;
  phase: string | null | undefined;
  suppressTurn: boolean;
  turnPlayerId: string | null | undefined;
  trickNumber: number;
  trickPlaysCount: number;
}): YourTurnAttentionPhase {
  const [attentionPhase, setAttentionPhase] = useState<YourTurnAttentionPhase>("hidden");
  const delayTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const activityKey = [
    input.turnPlayerId ?? "",
    input.trickNumber,
    input.trickPlaysCount,
    input.phase ?? "",
  ].join(":");

  const clearTimers = () => {
    if (delayTimerRef.current != null) {
      window.clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (exitTimerRef.current != null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  useEffect(() => {
    clearTimers();
    setAttentionPhase("hidden");

    const active =
      input.isMyTurn &&
      input.phase === "play" &&
      !input.suppressTurn &&
      Boolean(input.turnPlayerId);

    if (!active) return;

    delayTimerRef.current = window.setTimeout(() => {
      delayTimerRef.current = null;
      setAttentionPhase("pop");
    }, YOUR_TURN_ATTENTION_MS);

    return clearTimers;
  }, [
    activityKey,
    input.isMyTurn,
    input.phase,
    input.suppressTurn,
    input.turnPlayerId,
  ]);

  useEffect(() => {
    if (attentionPhase !== "pop") return;

    const holdMs = prefersReducedMotion() ? 280 : YOUR_TURN_HOLD_MS;
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = null;
      setAttentionPhase("exit");
    }, YOUR_TURN_POP_MS + holdMs);

    return () => {
      if (exitTimerRef.current != null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [attentionPhase]);

  useEffect(() => {
    if (attentionPhase !== "exit") return;

    const exitMs = prefersReducedMotion() ? 240 : YOUR_TURN_EXIT_MS;
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      setAttentionPhase("hidden");
    }, exitMs);

    return () => {
      if (hideTimerRef.current != null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [attentionPhase]);

  return attentionPhase;
}

export function yourTurnAttentionReducedMotion(): boolean {
  return prefersReducedMotion();
}
