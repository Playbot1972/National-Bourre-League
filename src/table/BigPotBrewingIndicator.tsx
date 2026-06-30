import { useEffect } from "react";
import type { TableEvent } from "./hooks/useTableEvents";

interface BigPotBrewingIndicatorProps {
  event: TableEvent;
  onDismiss: (id: string) => void;
}

/** Compact big-pot splash anchored to the empty hero card dock — not table center. */
export function BigPotBrewingIndicator({ event, onDismiss }: BigPotBrewingIndicatorProps) {
  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(event.id), event.durationMs ?? 2000);
    return () => window.clearTimeout(t);
  }, [event.id, event.durationMs, onDismiss]);

  return (
    <div
      className="bpot-brew"
      role="status"
      aria-live="polite"
      data-testid="big-pot-brewing"
    >
      <div className="bpot-brew__glow" aria-hidden="true" />
      <div className="bpot-brew__content">
        {event.emoji && <span className="bpot-brew__emoji">{event.emoji}</span>}
        <p className="bpot-brew__title">{event.title}</p>
        {event.subtitle && <p className="bpot-brew__subtitle">{event.subtitle}</p>}
      </div>
    </div>
  );
}
