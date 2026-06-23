interface EnrollmentTimerRingProps {
  fraction: number;
  /** Optional numeric seconds centered in the ring */
  secondsLeft?: number;
}

/** Avatar-only countdown ring — absolutely positioned inside `.bseat__avatar-wrap`. */
export function EnrollmentTimerRing({ fraction, secondsLeft }: EnrollmentTimerRingProps) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const viewSize = 56;
  const stroke = 3;
  const radius = (viewSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  const urgent = clamped <= 0.25;

  return (
    <div className="btable-timer-ring btable-timer-ring--avatar" data-testid="avatar-timer-ring" aria-hidden="true">
      <svg
        className={`bseat__timer-ring${urgent ? " bseat__timer-ring--urgent" : ""}`}
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <circle
          className="bseat__timer-ring__track"
          cx={viewSize / 2}
          cy={viewSize / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="bseat__timer-ring__progress"
          cx={viewSize / 2}
          cy={viewSize / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${viewSize / 2} ${viewSize / 2})`}
        />
      </svg>
      {secondsLeft != null && (
        <span className="btable-timer-ring__seconds" aria-hidden="true">
          {secondsLeft}
        </span>
      )}
    </div>
  );
}
