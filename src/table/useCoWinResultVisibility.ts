import { useEffect, useRef, useState } from "react";
import { isGameFlowDebugEnabled, logGameFlow } from "./gameFlowDebug";
import { getTieResultDurationMs } from "./tieResultTiming";

/**
 * Keeps tie/co-win result UI visible for a readable minimum even when the server
 * clears pendingCoWinSettlement quickly (e.g. bot votes).
 */
export function useCoWinResultVisibility(
  active: boolean,
  proposalKey: string,
  message: string,
): { visible: boolean; manualContinueAllowed: boolean } {
  const [latched, setLatched] = useState(false);
  const [manualContinueAllowed, setManualContinueAllowed] = useState(false);
  const shownAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const proposalRef = useRef<string | null>(null);
  const durationMsRef = useRef(getTieResultDurationMs(message));

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    clearTimer();

    if (proposalRef.current !== proposalKey) {
      proposalRef.current = proposalKey;
      shownAtRef.current = null;
      setLatched(false);
      setManualContinueAllowed(false);
      durationMsRef.current = getTieResultDurationMs(message);
    }

    if (active) {
      if (shownAtRef.current == null) {
        const shownAt = Date.now();
        shownAtRef.current = shownAt;
        durationMsRef.current = getTieResultDurationMs(message);
        setLatched(true);
        setManualContinueAllowed(false);
        if (isGameFlowDebugEnabled()) {
          logGameFlow("tieResult", "shown", {
            proposalKey,
            durationMs: durationMsRef.current,
            shownAt,
          });
        }
        timerRef.current = window.setTimeout(() => {
          setManualContinueAllowed(true);
          if (isGameFlowDebugEnabled()) {
            logGameFlow("tieResult", "manual-continue-allowed", {
              proposalKey,
              elapsedMs: Date.now() - shownAt,
            });
          }
        }, durationMsRef.current);
      }
      return clearTimer;
    }

    if (!latched || shownAtRef.current == null) {
      return clearTimer;
    }

    const elapsed = Date.now() - shownAtRef.current;
    const remaining = durationMsRef.current - elapsed;
    if (remaining <= 0) {
      if (isGameFlowDebugEnabled()) {
        logGameFlow("tieResult", "auto-hide", {
          proposalKey,
          elapsedMs: elapsed,
          durationMs: durationMsRef.current,
        });
      }
      shownAtRef.current = null;
      setLatched(false);
      setManualContinueAllowed(false);
      return clearTimer;
    }

    timerRef.current = window.setTimeout(() => {
      if (isGameFlowDebugEnabled()) {
        logGameFlow("tieResult", "auto-hide", {
          proposalKey,
          elapsedMs: Date.now() - (shownAtRef.current ?? Date.now()),
          durationMs: durationMsRef.current,
        });
      }
      shownAtRef.current = null;
      setLatched(false);
      setManualContinueAllowed(false);
      timerRef.current = null;
    }, remaining);

    return clearTimer;
  }, [active, latched, proposalKey, message]);

  useEffect(() => () => clearTimer(), []);

  return {
    visible: active || latched,
    manualContinueAllowed: !active || manualContinueAllowed,
  };
}
