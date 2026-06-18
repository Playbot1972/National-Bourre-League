import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./trickTiming";

interface BourreResultStingProps {
  active: boolean;
  displayName?: string;
}

/**
 * Brief result sting for the player who went bourré — dark emphasis then
 * a controlled light wash, not a theme toggle.
 */
export function BourreResultSting({ active, displayName }: BourreResultStingProps) {
  const [visible, setVisible] = useState(false);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const ms = reduced ? 900 : 1400;
    const timer = window.setTimeout(() => setVisible(false), ms);
    return () => window.clearTimeout(timer);
  }, [active, reduced]);

  if (!visible) return null;

  return (
    <div
      className={[
        "bbourre-sting",
        reduced ? "bbourre-sting--reduced" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="bourre-result-sting"
      role="status"
      aria-live="polite"
      aria-label={displayName ? `${displayName} went bourré` : "Bourré"}
    >
      <div className="bbourre-sting__wash" aria-hidden="true" />
      <div className="bbourre-sting__badge">
        <span className="bbourre-sting__label">Bourré</span>
        {displayName ? (
          <span className="bbourre-sting__name muted small">{displayName}</span>
        ) : null}
      </div>
    </div>
  );
}
