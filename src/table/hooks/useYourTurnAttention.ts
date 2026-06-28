import { useCallback, useEffect, useRef, useState } from "react";
import { TURN_COUNTDOWN_MS } from "../turnCountdown";
import { prefersReducedMotion } from "../trickTiming";

/** First "Your Turn" graphic — only after idle wait (matches turn countdown duration). */
export const YOUR_TURN_FIRST_REMINDER_MS = TURN_COUNTDOWN_MS;

/** Gentle nudges if the local player still has not acted. */
export const YOUR_TURN_REPEAT_MS = [12_000, 18_000, 24_000] as const;

/** Pop-in scale animation. */
export const YOUR_TURN_POP_MS = 380;

/** Brief hold after pop before exit. */
export const YOUR_TURN_HOLD_MS = 420;

/** Float up + fade off-screen. */
export const YOUR_TURN_EXIT_MS = 620;

/** @deprecated Use YOUR_TURN_FIRST_REMINDER_MS — kept for e2e imports. */
export const YOUR_TURN_FIRST_MS = YOUR_TURN_FIRST_REMINDER_MS;

export type YourTurnAttentionPhase = "hidden" | "pop" | "exit";

export function useYourTurnAttention(input: {
  actionRequired: boolean;
  activityKey: string;
}): { phase: YourTurnAttentionPhase; beat: number } {
  const [attentionPhase, setAttentionPhase] = useState<YourTurnAttentionPhase>("hidden");
  const [beat, setBeat] = useState(0);
  const delayTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const repeatIndexRef = useRef(0);
  const actionRequiredRef = useRef(input.actionRequired);
  actionRequiredRef.current = input.actionRequired;

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

  const scheduleNextReminder = useCallback(() => {
    const idx = repeatIndexRef.current;
    if (idx === 0) return;
    const delay =
      YOUR_TURN_REPEAT_MS[Math.min(idx - 1, YOUR_TURN_REPEAT_MS.length - 1)];
    delayTimerRef.current = window.setTimeout(() => {
      delayTimerRef.current = null;
      if (!actionRequiredRef.current) return;
      setBeat(idx);
      setAttentionPhase("pop");
      repeatIndexRef.current = idx + 1;
    }, delay);
  }, []);

  useEffect(() => {
    clearTimers();
    repeatIndexRef.current = 0;

    if (!input.actionRequired) {
      setAttentionPhase("hidden");
      setBeat(0);
      return clearTimers;
    }

    delayTimerRef.current = window.setTimeout(() => {
      delayTimerRef.current = null;
      if (!actionRequiredRef.current) return;
      setBeat(0);
      setAttentionPhase("pop");
      repeatIndexRef.current = 1;
    }, YOUR_TURN_FIRST_REMINDER_MS);

    return clearTimers;
  }, [input.activityKey, input.actionRequired]);

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
  }, [attentionPhase, beat]);

  useEffect(() => {
    if (attentionPhase !== "exit") return;

    const exitMs = prefersReducedMotion() ? 240 : YOUR_TURN_EXIT_MS;
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      setAttentionPhase("hidden");
      if (actionRequiredRef.current) {
        scheduleNextReminder();
      }
    }, exitMs);

    return () => {
      if (hideTimerRef.current != null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [attentionPhase, input.actionRequired, scheduleNextReminder]);

  return { phase: attentionPhase, beat };
}

export function yourTurnAttentionReducedMotion(): boolean {
  return prefersReducedMotion();
}
