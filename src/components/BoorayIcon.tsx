export type BoorayIconVariant = "app" | "mark";

export interface BoorayIconProps {
  size?: number;
  variant?: BoorayIconVariant;
  className?: string;
  title?: string;
}

/** In-app Booray mark — app variant uses the same raster as PWA/store icons. */
export function BoorayIcon({
  size = 48,
  variant = "app",
  className = "",
  title = "Booray",
}: BoorayIconProps) {
  if (variant === "app") {
    return (
      <img
        src="/icons/icon-192.png"
        width={size}
        height={size}
        className={className}
        role="img"
        alt={title}
        decoding="async"
      />
    );
  }

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
