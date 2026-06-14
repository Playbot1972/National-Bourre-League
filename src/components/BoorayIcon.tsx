export type BoorayIconVariant = "app" | "mark";

export interface BoorayIconProps {
  /** Render size in CSS pixels */
  size?: number;
  variant?: BoorayIconVariant;
  className?: string;
  title?: string;
}

/**
 * In-app Booray mark — mirrors assets/icons/booray-icon-app.svg (simplified ace/spade).
 */
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
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className={className}
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id="booray-gold" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f4d58d" />
            <stop offset="1" stopColor="#c8922f" />
          </linearGradient>
        </defs>
        <path
          fill="url(#booray-gold)"
          d="M32 4c-8.2 0-14 7.4-10.8 14.2-6.2 2.6-10.4 8.8-8.2 15.4 1.8 5.6 7 9 12.4 9.2.8 0 1.6-.1 2.4-.3L32 56l3.2-13.5c.8.2 1.6.3 2.4.3 5.4-.2 10.6-3.6 12.4-9.2 2.2-6.6-2-12.8-8.2-15.4C46 11.4 40.2 4 32 4z"
        />
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
        <linearGradient id="booray-bg" x1="64" y1="48" x2="448" y2="464" gradientUnits="userSpaceOnUse">
          <stop stopColor="#123528" />
          <stop offset="0.45" stopColor="#0a2218" />
          <stop offset="1" stopColor="#050d0a" />
        </linearGradient>
        <linearGradient id="booray-gold-app" x1="256" y1="96" x2="256" y2="416" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff2c9" />
          <stop offset="0.35" stopColor="#f4d58d" />
          <stop offset="1" stopColor="#b87a24" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="108" fill="url(#booray-bg)" />
      <circle cx="256" cy="256" r="188" stroke="#f4d58d" strokeOpacity="0.14" strokeWidth="3" fill="none" />
      <text
        x="256"
        y="228"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', Times, serif"
        fontSize="188"
        fontWeight="700"
        fill="url(#booray-gold-app)"
      >
        A
      </text>
      <path
        fill="url(#booray-gold-app)"
        transform="translate(256 318) scale(4.2)"
        d="M0 -14.5c-6.8 0-11.6 6.1-9 11.8-5.1 2.2-8.6 7.4-6.8 13 1.5 4.6 5.8 7.5 10.3 7.7.7 0 1.3-.1 2-.2L0 44l3.5-14.7c.7.1 1.3.2 2 .2 4.5-.2 8.8-3.1 10.3-7.7 1.8-5.6-1.7-10.8-6.8-13 2.6-5.7-2.2-11.8-9-11.8z"
      />
    </svg>
  );
}
