/** Visual-only yellow ring overlay — no game actions. */

interface AvatarActiveRingProps {
  fraction: number;
}

export function AvatarActiveRing({ fraction }: AvatarActiveRingProps) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const size = 56;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  const urgent = clamped <= 0.25;

  return (
    <svg
      className={`bseat__timer-ring btable-timer-ring--avatar${urgent ? " bseat__timer-ring--urgent" : ""}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      data-testid="avatar-active-ring"
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
  );
}
