import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../trickTiming";

/** Delay before the first local "Your Turn" attention cue appears. */
export const YOUR_TURN_ATTENTION_MS = 7_000;

/** Repeat delays after each cue hides (6s, 5s, 4s, 3s, then 2s thereafter). */
export const YOUR_TURN_REPEAT_INTERVALS_MS = [6_000, 5_000, 4_000, 3_000, 2_000] as const;

/** Pop-in scale animation. */
export const YOUR_TURN_POP_MS = 380;

/** Brief hold after pop before exit. */
export const YOUR_TURN_HOLD_MS = 420;

/** Float up + fade off-screen. */
export const YOUR_TURN_EXIT_MS = 620;

export type YourTurnAttentionPhase = "hidden" | "pop" | "exit";

export interface YourTurnAttentionState {
  phase: YourTurnAttentionPhase;
  /** 0 before first show; increments after each completed pop/exit cycle. */
  cycleIndex: number;
}

function repeatDelayMs(repeatIndex: number): number {
  if (repeatIndex <= 0) return YOUR_TURN_ATTENTION_MS;
  const intervals = YOUR_TURN_REPEAT_INTERVALS_MS;
  return intervals[Math.min(repeatIndex - 1, intervals.length - 1)]!;
}

export function useYourTurnAttention(input: {
  isMyTurn: boolean;
  phase: string | null | undefined;
  suppressTurn: boolean;
  turnPlayerId: string | null | undefined;
  trickNumber: number;
  trickPlaysCount: number;
}): YourTurnAttentionState {
  const [attentionPhase, setAttentionPhase] = useState<YourTurnAttentionPhase>("hidden");
  const [cycleIndex, setCycleIndex] = useState(0);
  const delayTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const repeatIndexRef = useRef(0);
  const inputRef = useRef(input);
  inputRef.current = input;

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

  const scheduleNextDelay = () => {
    const delayMs = repeatDelayMs(repeatIndexRef.current);
    repeatIndexRef.current += 1;
    delayTimerRef.current = window.setTimeout(() => {
      delayTimerRef.current = null;
      setAttentionPhase("pop");
    }, delayMs);
  };

  useEffect(() => {
    clearTimers();
    setAttentionPhase("hidden");
    setCycleIndex(0);
    repeatIndexRef.current = 0;

    const active =
      input.isMyTurn &&
      input.phase === "play" &&
      !input.suppressTurn &&
      Boolean(input.turnPlayerId);

    if (!active) return;

    scheduleNextDelay();

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
      setCycleIndex((c) => c + 1);

      const current = inputRef.current;
      const stillActive =
        current.isMyTurn &&
        current.phase === "play" &&
        !current.suppressTurn &&
        Boolean(current.turnPlayerId);
      if (stillActive) scheduleNextDelay();
    }, exitMs);

    return () => {
      if (hideTimerRef.current != null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [attentionPhase]);

  return { phase: attentionPhase, cycleIndex };
}

export function yourTurnAttentionReducedMotion(): boolean {
  return prefersReducedMotion();
}
