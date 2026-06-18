import { useEffect } from "react";
import type { TableEvent } from "./hooks/useTableEvents";

interface CinematicSplashProps {
  events: TableEvent[];
  onDismiss: (id: string) => void;
}

const SPLASH_KINDS = new Set(["big-pot", "pot-cap", "hand-win"]);

export function CinematicSplash({ events, onDismiss }: CinematicSplashProps) {
  const splash = [...events].reverse().find((e) => SPLASH_KINDS.has(e.kind));

  useEffect(() => {
    if (!splash) return;
    const t = window.setTimeout(() => onDismiss(splash.id), splash.durationMs ?? 2200);
    return () => window.clearTimeout(t);
  }, [splash, onDismiss]);

  if (!splash) return null;

  return (
    <div className={`bsplash bsplash--${splash.kind}`} role="status" aria-live="polite">
      <div className="bsplash__glow" aria-hidden="true" />
      <div className="bsplash__content">
        {splash.emoji && <span className="bsplash__emoji">{splash.emoji}</span>}
        <p className="bsplash__title">{splash.title}</p>
        {splash.subtitle && <p className="bsplash__subtitle">{splash.subtitle}</p>}
      </div>
    </div>
  );
}
