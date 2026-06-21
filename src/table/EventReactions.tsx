import { useEffect } from "react";
import type { TableEvent } from "./hooks/useTableEvents";

interface EventReactionsProps {
  events: TableEvent[];
  onDismiss: (id: string) => void;
}

export function EventReactions({ events, onDismiss }: EventReactionsProps) {
  const reactionEvents = events.filter((e) => e.emoji && e.kind === "reaction");

  useEffect(() => {
    const timers = reactionEvents.map((evt) =>
      window.setTimeout(() => onDismiss(evt.id), evt.durationMs ?? 1600),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reactionEvents, onDismiss]);

  if (!reactionEvents.length) return null;

  return (
    <div className="breactions" aria-hidden="true">
      {reactionEvents.map((evt, i) => (
        <div
          key={evt.id}
          className="breactions__burst"
          style={{ ["--burst-i" as string]: i }}
        >
          <span className="breactions__emoji">{evt.emoji}</span>
        </div>
      ))}
    </div>
  );
}
