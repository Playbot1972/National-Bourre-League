export type BoorayIconVariant = "app" | "mark";

export interface BoorayIconProps {
  size?: number;
  variant?: BoorayIconVariant;
  className?: string;
  title?: string;
}

/** In-app Booray mark aligned with assets/icons/booray-icon-app.svg */
export function BoorayIcon({
  size = 48,
  variant = "app",
  className = "",
  title = "Booray",
}: BoorayIconProps) {
  if (variant === "mark") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        role="img"
        aria-label={title}
      >
        <path
          fill="#10131c"
          d="M50 8c-18 0-32 14-24 32-14 5-22 18-17 32 4 11 14 18 26 19 2 0 4 0 6-.5L50 92l9-11.5c2 .5 4 .5 6 .5 12-1 22-8 26-19 5-14-3-27-17-32 8-18-6-32-24-32z"
        />
        <path
          fill="none"
          stroke="#f3ece0"
          strokeWidth="2.2"
          strokeLinecap="round"
          d="M50 22c-12 0-21 9-16 22M50 22c12 0 21 9 16 22M50 38v28M34 58q16 12 32 0"
        />
        <circle cx="50" cy="30" r="9" fill="#f3ece0" />
        <rect x="46.5" y="78" width="7" height="8" fill="#f3ece0" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="booray-bg" x1="80" y1="40" x2="432" y2="472" gradientUnits="userSpaceOnUse">
          <stop stopColor="#141a2e" />
          <stop offset="0.55" stopColor="#0a0e18" />
          <stop offset="1" stopColor="#04060c" />
        </linearGradient>
        <linearGradient id="booray-cream" x1="256" y1="120" x2="256" y2="380" gradientUnits="userSpaceOnUse">
          <stop stopColor="#faf6ee" />
          <stop offset="1" stopColor="#e5dac8" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#booray-bg)" />
      <circle cx="256" cy="248" r="198" stroke="#5eb3ff" strokeOpacity="0.38" strokeWidth="5" fill="none" strokeDasharray="420 220" />
      <circle cx="256" cy="248" r="168" stroke="#e84855" strokeOpacity="0.34" strokeWidth="4" fill="none" strokeDasharray="360 200" />
      <g opacity="0.22">
        <rect x="124" y="150" width="60" height="84" rx="7" fill="#10131c" stroke="#5eb3ff" strokeWidth="3" transform="rotate(-24 154 192)" />
        <rect x="328" y="150" width="60" height="84" rx="7" fill="#10131c" stroke="#e84855" strokeWidth="3" transform="rotate(24 358 192)" />
      </g>
      <rect x="136" y="96" width="240" height="320" rx="18" fill="url(#booray-cream)" stroke="#10131c" strokeWidth="9" />
      <g transform="translate(166 134) scale(1.2)">
        <path
          fill="#10131c"
          d="M0 -8c-3 0-5 2.5-4 5.5-2 .8-3.5 3-2.8 5.5.7 2 2.5 3.2 4.5 3.3.3 0 .7 0 1-.1L0 24l2.8-3.5c.3.1.7.1 1 .1 2-.1 3.8-1.3 4.5-3.3.7-2.5-.8-4.7-2.8-5.5 1-3-1-5.5-4-5.5z"
        />
      </g>
      <g transform="translate(256 268) scale(2.35)">
        <path
          fill="#10131c"
          d="M0 -42c-16 0-28 12-21 28-12 4-19 14-15 26 3 9 11 14 21 15 1 0 2 0 3-.2L0 88l8-10c1 .2 2 .2 3 .2 10-1 18-6 21-15 4-12-3-22-15-26 7-16-5-28-21-28z"
        />
        <path
          fill="none"
          stroke="#faf6ee"
          strokeWidth="2.8"
          strokeLinecap="round"
          d="M0 -30c-10 0-18 7-13 18M0 -30c10 0 18 7 13 18M0 -12v34M-14 18q14 10 28 0"
        />
        <circle cx="0" cy="-18" r="5.5" fill="#faf6ee" />
        <rect x="-3.5" y="52" width="7" height="10" fill="#faf6ee" />
      </g>
    </svg>
  );
}
