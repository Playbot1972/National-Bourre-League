import { useEffect, useRef, useState } from "react";
import {
  buildTurnCountdownState,
  resolveTableActiveActorId,
  turnCountdownActivityKey,
  type TurnCountdownInput,
  type TurnCountdownState,
} from "../turnCountdown";
import { prefersReducedMotion } from "../trickTiming";

export interface UseTurnCountdownResult {
  countdown: TurnCountdownState | null;
  reducedMotion: boolean;
}

/**
 * Single table-wide turn countdown — one ring on the active actor at a time.
 * Resets when activity key changes; clears when no actor or turn suppressed.
 */
export function useTurnCountdown(input: TurnCountdownInput): UseTurnCountdownResult {
  const activeActorId = resolveTableActiveActorId(input);
  const activityKey = turnCountdownActivityKey({ ...input, activeActorId });
  const startedAtRef = useRef<number | null>(null);
  const lastKeyRef = useRef<string>("");
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!activeActorId) {
      startedAtRef.current = null;
      lastKeyRef.current = activityKey;
      return;
    }
    if (activityKey !== lastKeyRef.current || startedAtRef.current == null) {
      startedAtRef.current = Date.now();
      lastKeyRef.current = activityKey;
      setNowMs(Date.now());
    }
  }, [activeActorId, activityKey]);

  useEffect(() => {
    if (!activeActorId || startedAtRef.current == null) return;

    const tick = () => setNowMs(Date.now());
    const intervalMs = prefersReducedMotion() ? 250 : 100;
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [activeActorId, activityKey]);

  const countdown =
    activeActorId && startedAtRef.current != null
      ? buildTurnCountdownState(activeActorId, startedAtRef.current, nowMs)
      : null;

  return {
    countdown,
    reducedMotion: prefersReducedMotion(),
  };
}
