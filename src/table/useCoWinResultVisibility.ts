import { useEffect, useRef, useState } from "react";
import { setCoWinResultLatched } from "./coWinResultLatchBridge";
import { isGameFlowDebugEnabled, logGameFlow } from "./gameFlowDebug";
import {
  getTieResultDurationMs,
  isTieContinueGuardComplete,
  tieResultAutoHideRemainingMs,
  TIE_RESULT_CONTINUE_GUARD_MS,
} from "./tieResultTiming";

/**
 * Keeps tie/co-win result UI visible for a readable minimum even when the server
 * clears pendingCoWinSettlement quickly (e.g. bot votes).
 * Independent of hand/trick presentation state machines.
 */
export function useCoWinResultVisibility(
  active: boolean,
  proposalKey: string,
  message: string,
): { visible: boolean; manualContinueAllowed: boolean } {
  const [latched, setLatched] = useState(false);
  const [manualContinueAllowed, setManualContinueAllowed] = useState(false);
  const shownAtRef = useRef<number | null>(null);
  const continueTimerRef = useRef<number | null>(null);
  const autoHideTimerRef = useRef<number | null>(null);
  const proposalRef = useRef<string | null>(null);
  const durationMsRef = useRef(getTieResultDurationMs(message));

  const clearContinueTimer = () => {
    if (continueTimerRef.current != null) {
      window.clearTimeout(continueTimerRef.current);
      continueTimerRef.current = null;
    }
  };

  const clearAutoHideTimer = () => {
    if (autoHideTimerRef.current != null) {
      window.clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  };

  const releaseLatch = (reason: string) => {
    if (isGameFlowDebugEnabled() && shownAtRef.current != null) {
      logGameFlow("tieResult", reason, {
        proposalKey: proposalRef.current,
        elapsedMs: Date.now() - shownAtRef.current,
        durationMs: durationMsRef.current,
      });
    }
    shownAtRef.current = null;
    setLatched(false);
    setManualContinueAllowed(false);
    setCoWinResultLatched(false);
  };

  const scheduleAutoHide = (remainingMs: number) => {
    clearAutoHideTimer();
    if (remainingMs <= 0) {
      releaseLatch("auto-hide");
      return;
    }
    autoHideTimerRef.current = window.setTimeout(() => {
      autoHideTimerRef.current = null;
      releaseLatch("auto-hide");
    }, remainingMs);
  };

  useEffect(() => {
    if (proposalRef.current !== proposalKey) {
      proposalRef.current = proposalKey;
      shownAtRef.current = null;
      clearContinueTimer();
      clearAutoHideTimer();
      setLatched(false);
      setManualContinueAllowed(false);
      setCoWinResultLatched(false);
      durationMsRef.current = getTieResultDurationMs(message);
    }

    if (active) {
      if (shownAtRef.current == null) {
        const shownAt = Date.now();
        shownAtRef.current = shownAt;
        durationMsRef.current = getTieResultDurationMs(message);
        setLatched(true);
        setManualContinueAllowed(false);
        setCoWinResultLatched(true);
        if (isGameFlowDebugEnabled()) {
          logGameFlow("tieResult", "shown", {
            proposalKey,
            durationMs: durationMsRef.current,
            shownAt,
          });
        }
      }
      clearAutoHideTimer();
    }

    if ((active || latched) && shownAtRef.current != null) {
      if (isTieContinueGuardComplete(shownAtRef.current)) {
        setManualContinueAllowed(true);
      } else if (continueTimerRef.current == null) {
        const guardRemaining =
          TIE_RESULT_CONTINUE_GUARD_MS - (Date.now() - shownAtRef.current);
        continueTimerRef.current = window.setTimeout(() => {
          continueTimerRef.current = null;
          setManualContinueAllowed(true);
          if (isGameFlowDebugEnabled()) {
            logGameFlow("tieResult", "manual-continue-allowed", {
              proposalKey,
              elapsedMs: Date.now() - (shownAtRef.current ?? Date.now()),
              guardMs: TIE_RESULT_CONTINUE_GUARD_MS,
            });
          }
        }, Math.max(0, guardRemaining));
      }
    }

    if (!active && latched && shownAtRef.current != null) {
      const remaining = tieResultAutoHideRemainingMs(
        shownAtRef.current,
        durationMsRef.current,
      );
      scheduleAutoHide(remaining);
    } else if (active) {
      clearAutoHideTimer();
    }

    return () => {
      if (!active && !latched) {
        clearContinueTimer();
        clearAutoHideTimer();
      }
    };
  }, [active, latched, proposalKey, message]);

  useEffect(
    () => () => {
      clearContinueTimer();
      clearAutoHideTimer();
      setCoWinResultLatched(false);
    },
    [],
  );

  return {
    visible: active || latched,
    manualContinueAllowed: (active || latched) && manualContinueAllowed,
  };
}
