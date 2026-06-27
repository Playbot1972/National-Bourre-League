import type { TurnCountdownSegment } from "./turnCountdown";
import { prefersReducedMotion } from "./trickTiming";

const RING_RADIUS = 22;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export interface TurnCountdownRingProps {
  progress: number;
  segment: TurnCountdownSegment;
  reducedMotion?: boolean;
}

export function TurnCountdownRing({
  progress,
  segment,
  reducedMotion = prefersReducedMotion(),
}: TurnCountdownRingProps) {
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
