import { memo, useEffect, useRef, useState } from "react";
import {
  buildTurnCountdownState,
  type TurnCountdownSegment,
} from "./turnCountdown";
import { prefersReducedMotion } from "./trickTiming";

const RING_RADIUS = 22;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export interface TurnCountdownRingProps {
  activityKey: string;
  startedAtMs: number;
  reducedMotion?: boolean;
}

function TurnCountdownRingInner({
  activityKey,
  startedAtMs,
  reducedMotion = prefersReducedMotion(),
}: TurnCountdownRingProps) {
  const [progress, setProgress] = useState(1);
  const [segment, setSegment] = useState<TurnCountdownSegment>("green");
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef(startedAtMs);
  startedAtRef.current = startedAtMs;

  useEffect(() => {
    const tick = (nowMs: number) => {
      const state = buildTurnCountdownState("local", startedAtRef.current, nowMs);
      if (!state) return;
      setProgress(state.progress);
      setSegment(state.segment);
    };

    if (reducedMotion) {
      tick(Date.now());
      const intervalId = window.setInterval(() => tick(Date.now()), 250);
      return () => window.clearInterval(intervalId);
    }

    const frame = (nowMs: number) => {
      tick(nowMs);
      rafRef.current = window.requestAnimationFrame(frame);
    };
    rafRef.current = window.requestAnimationFrame(frame);
    return () => {
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [activityKey, reducedMotion]);

  const clamped = Math.max(0, Math.min(1, progress));
  const dashOffset = RING_CIRCUMFERENCE * (1 - clamped);

  return (
    <svg
      className={[
        "bseat__turn-countdown",
        reducedMotion ? "bseat__turn-countdown--reduced" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 48 48"
      aria-hidden="true"
      data-testid="turn-countdown-ring"
      data-turn-segment={segment}
    >
      <circle
        className="bseat__turn-countdown-track"
        cx="24"
        cy="24"
        r={RING_RADIUS}
        fill="none"
      />
      <circle
        className={`bseat__turn-countdown-progress bseat__turn-countdown-progress--${segment}`}
        cx="24"
        cy="24"
        r={RING_RADIUS}
        fill="none"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 24 24)"
      />
    </svg>
  );
}

export const TurnCountdownRing = memo(TurnCountdownRingInner);
