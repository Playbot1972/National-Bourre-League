import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../trickTiming";

/** Delay before the local "Your Turn" attention cue appears. */
export const YOUR_TURN_ATTENTION_MS = 15_000;

export function useYourTurnAttention(input: {
  isMyTurn: boolean;
  phase: string | null | undefined;
  suppressTurn: boolean;
  turnPlayerId: string | null | undefined;
  trickNumber: number;
  trickPlaysCount: number;
}): boolean {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const activityKey = [
    input.turnPlayerId ?? "",
    input.trickNumber,
    input.trickPlaysCount,
    input.phase ?? "",
  ].join(":");

  useEffect(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);

    const active =
      input.isMyTurn &&
      input.phase === "play" &&
      !input.suppressTurn &&
      Boolean(input.turnPlayerId);

    if (!active) return;

    timerRef.current = window.setTimeout(() => {
      setVisible(true);
      timerRef.current = null;
    }, YOUR_TURN_ATTENTION_MS);

    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    activityKey,
    input.isMyTurn,
    input.phase,
    input.suppressTurn,
    input.turnPlayerId,
  ]);

  return visible;
}

export function yourTurnAttentionReducedMotion(): boolean {
  return prefersReducedMotion();
}
