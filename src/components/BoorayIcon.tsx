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
          <stop stopColor="#12182a" />
          <stop offset="0.55" stopColor="#0a0e18" />
          <stop offset="1" stopColor="#050810" />
        </linearGradient>
        <linearGradient id="booray-cream" x1="256" y1="120" x2="256" y2="380" gradientUnits="userSpaceOnUse">
          <stop stopColor="#faf6ee" />
          <stop offset="1" stopColor="#e8dfd0" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="108" fill="url(#booray-bg)" />
      <circle cx="256" cy="248" r="198" stroke="#5eb3ff" strokeOpacity="0.35" strokeWidth="5" fill="none" strokeDasharray="420 220" />
      <circle cx="256" cy="248" r="168" stroke="#e84855" strokeOpacity="0.32" strokeWidth="4" fill="none" strokeDasharray="360 200" />
      <rect x="136" y="96" width="240" height="320" rx="18" fill="url(#booray-cream)" stroke="#10131c" strokeWidth="10" />
      <text x="168" y="152" fontFamily="Arial Black, Arial, sans-serif" fontSize="44" fontWeight="900" fill="#10131c">
        A
      </text>
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
