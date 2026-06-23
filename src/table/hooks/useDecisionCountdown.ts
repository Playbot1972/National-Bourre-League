import { useCallback, useEffect, useRef, useState } from "react";
import { HAND_DECISION_MS } from "../../game/decision";

export const DECISION_COUNTDOWN_SECONDS = 15;
export const DECISION_COUNTDOWN_MS = HAND_DECISION_MS;

export function computeDecisionCountdown(
  nowMs: number,
  active: boolean,
  deadlineMs?: number | null,
): { secondsLeft: number; fraction: number; expired: boolean } {
  const effectiveDeadline = deadlineMs ?? nowMs + DECISION_COUNTDOWN_MS;
  const msLeft = active ? Math.max(0, effectiveDeadline - nowMs) : 0;
  const secondsLeft = Math.max(0, Math.ceil(msLeft / 1000));
  const fraction = active ? msLeft / DECISION_COUNTDOWN_MS : 0;
  return { secondsLeft, fraction, expired: active && msLeft <= 0 };
}

export interface DecisionCountdownInput {
  /** True when the local player may choose play or pass. */
  active: boolean;
  /** Server deadline (ms since epoch), when available. */
  deadlineMs?: number | null;
  /** Called once when the timer expires — same path as manual pass. */
  onExpire: () => void;
}

export interface DecisionCountdownState {
  secondsLeft: number;
  fraction: number;
  /** Call before a manual pass/play to cancel expiry dispatch. */
  cancel: () => void;
}

/**
 * Client-side decision countdown for ring UI and immediate auto-pass.
 * Uses server deadline when present; falls back to a fresh 15s window.
 */
export function useDecisionCountdown({
  active,
  deadlineMs,
  onExpire,
}: DecisionCountdownInput): DecisionCountdownState {
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const [nowMs, setNowMs] = useState(() => Date.now());

  const cancel = useCallback(() => {
    expiredRef.current = true;
  }, []);

  useEffect(() => {
    expiredRef.current = false;
  }, [active, deadlineMs]);

  useEffect(() => {
    if (!active) return;
    const tick = () => setNowMs(Date.now());
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [active, deadlineMs]);

  useEffect(() => {
    if (!active || expiredRef.current) return;
    const { expired } = computeDecisionCountdown(Date.now(), active, deadlineMs);
    if (!expired) return;
    expiredRef.current = true;
    onExpireRef.current();
  }, [active, deadlineMs, nowMs]);

  const { secondsLeft, fraction } = computeDecisionCountdown(nowMs, active, deadlineMs);

  return { secondsLeft, fraction, cancel };
}
