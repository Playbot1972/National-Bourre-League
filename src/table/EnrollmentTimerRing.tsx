interface EnrollmentTimerRingProps {
  fraction: number;
  /** Optional numeric seconds for screen readers */
  secondsLeft?: number;
  size?: number;
  className?: string;
}

/** SVG countdown ring for play/pass (enrollment or Pagat decision) clocks. */
export function EnrollmentTimerRing({
  fraction,
  secondsLeft,
  size = 56,
  className = "",
}: EnrollmentTimerRingProps) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  const urgent = clamped <= 0.25;
  const label =
    secondsLeft != null ? `${secondsLeft} seconds remaining` : "Decision timer";

  return (
    <div
      className={`btable-timer-ring${className ? ` ${className}` : ""}`}
      role="timer"
      aria-live="off"
      aria-label={label}
      data-testid="decision-timer-ring"
    >
      <svg
        className={`bseat__timer-ring${urgent ? " bseat__timer-ring--urgent" : ""}`}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          className="bseat__timer-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="bseat__timer-ring__progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
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
