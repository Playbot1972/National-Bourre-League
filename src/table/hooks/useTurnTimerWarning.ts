import { useEffect, useRef } from "react";
import {
  resolveTurnCountdownActiveActorId,
  turnCountdownActivityKey,
  type TurnCountdownInput,
} from "../turnCountdown";
import {
  isTurnTimerWarningPlaying,
  startTurnTimerWarning,
  stopTurnTimerWarning,
} from "../feedback/turnTimerAudio";
import {
  shouldStartTurnTimerWarning,
  turnCountdownElapsedMs,
  turnTimerWarningDelayMs,
} from "../turnTimerWarning";

export interface UseTurnTimerWarningInput extends TurnCountdownInput {
  currentUserId?: string | null;
  /** Fires when the local player begins an action (loading). */
  localActionPending?: boolean;
}

/**
 * Starts timer.mp3 once elapsed ring time crosses 15s; stops on turn change or action.
 */
export function useTurnTimerWarning({
  currentUserId = null,
  localActionPending = false,
  ...input
}: UseTurnTimerWarningInput): void {
  const skipWarning = Boolean(input.ante?.anteAnimActive);
  const activeActorId = skipWarning ? null : resolveTurnCountdownActiveActorId(input);
  const activityKey = turnCountdownActivityKey({ ...input, activeActorId });
  const ringStartedAtRef = useRef<number | null>(null);
  const lastKeyRef = useRef("");
  const warningStartedRef = useRef(false);
  const startTimerRef = useRef<number | null>(null);

  const clearStartTimer = () => {
    if (startTimerRef.current != null) {
      window.clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!activeActorId) {
      clearStartTimer();
      if (isTurnTimerWarningPlaying()) {
        stopTurnTimerWarning("turnChange");
      }
      warningStartedRef.current = false;
      ringStartedAtRef.current = null;
      lastKeyRef.current = activityKey;
      return;
    }

    if (activityKey !== lastKeyRef.current || ringStartedAtRef.current == null) {
      clearStartTimer();
      if (isTurnTimerWarningPlaying()) {
        stopTurnTimerWarning("turnChange");
      }
      warningStartedRef.current = false;
      ringStartedAtRef.current = Date.now();
      lastKeyRef.current = activityKey;

      const ringStart = ringStartedAtRef.current;
      const armedKey = activityKey;
      const delayMs = turnTimerWarningDelayMs(ringStart, Date.now());

      if (import.meta.env.DEV) {
        console.log("[nbl-timer-audio] ring-start", {
          turnKey: activityKey,
          actorId: activeActorId,
          ringStartedAtMs: ringStart,
          delayMs,
        });
      }

      const fireStart = () => {
        if (lastKeyRef.current !== armedKey || warningStartedRef.current) return;
        const elapsedMs = turnCountdownElapsedMs(ringStart, Date.now());
        if (!shouldStartTurnTimerWarning(elapsedMs, warningStartedRef.current)) return;
        warningStartedRef.current = true;
        startTurnTimerWarning({
          turnKey: armedKey,
          actorId: activeActorId,
          ringStartedAtMs: ringStart,
          elapsedMs,
        });
      };

      if (delayMs <= 0) {
        fireStart();
      } else {
        startTimerRef.current = window.setTimeout(fireStart, delayMs);
      }
    }

    return () => {
      clearStartTimer();
    };
  }, [activeActorId, activityKey]);

  useEffect(() => {
    return () => {
      clearStartTimer();
      if (isTurnTimerWarningPlaying()) {
        stopTurnTimerWarning("cleanup");
      }
      warningStartedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!localActionPending || !isTurnTimerWarningPlaying()) return;
    if (activeActorId == null || currentUserId == null || activeActorId !== currentUserId) {
      return;
    }
    stopTurnTimerWarning("playerAction");
    warningStartedRef.current = false;
    clearStartTimer();
  }, [localActionPending, activeActorId, currentUserId]);
}
