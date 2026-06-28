import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../trickTiming";

/** Show helper guidance only after this idle window. */
export const INACTIVITY_HELPER_DELAY_MS = 5_000;

/** Slow flash cadence (~once per second). */
export const INACTIVITY_HELPER_FLASH_MS = 1_000;

export function formatInactivityHelperText(
  phase: string | null | undefined,
): string | null {
  if (phase === "draw") return "Choose discard and then tap";
  if (phase === "play") return "Tap a card to play";
  return null;
}

export function useInactivityHelper(input: {
  actionRequired: boolean;
  activityKey: string;
  phase: string | null | undefined;
  hasUserInteracted: boolean;
}): { visible: boolean; text: string | null; flashOn: boolean } {
  const [ready, setReady] = useState(false);
  const [flashOn, setFlashOn] = useState(true);
  const delayTimerRef = useRef<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const actionRequiredRef = useRef(input.actionRequired);
  actionRequiredRef.current = input.actionRequired;

  const text = formatInactivityHelperText(input.phase);
  const shouldTrack =
    input.actionRequired && text != null && !input.hasUserInteracted;

  useEffect(() => {
    if (delayTimerRef.current != null) {
      window.clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    setReady(false);

    if (!shouldTrack) return;

    delayTimerRef.current = window.setTimeout(() => {
      delayTimerRef.current = null;
      if (!actionRequiredRef.current || input.hasUserInteracted) return;
      setReady(true);
      setFlashOn(true);
    }, INACTIVITY_HELPER_DELAY_MS);

    return () => {
      if (delayTimerRef.current != null) {
        window.clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, [input.activityKey, shouldTrack, input.hasUserInteracted]);

  useEffect(() => {
    if (flashTimerRef.current != null) {
      window.clearInterval(flashTimerRef.current);
      flashTimerRef.current = null;
    }

    if (!ready || !shouldTrack || prefersReducedMotion()) {
      setFlashOn(true);
      return;
    }

    flashTimerRef.current = window.setInterval(() => {
      setFlashOn((on) => !on);
    }, INACTIVITY_HELPER_FLASH_MS);

    return () => {
      if (flashTimerRef.current != null) {
        window.clearInterval(flashTimerRef.current);
        flashTimerRef.current = null;
      }
    };
  }, [ready, shouldTrack, input.activityKey]);

  return {
    visible: ready && shouldTrack,
    text,
    flashOn,
  };
}
