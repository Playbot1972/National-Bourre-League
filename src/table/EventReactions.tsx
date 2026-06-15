import { useEffect } from "react";
import type { TableEvent } from "./hooks/useTableEvents";
import type { TablePlayer } from "./types";

interface EventReactionsProps {
  events: TableEvent[];
  players: TablePlayer[];
  onDismiss: (id: string) => void;
}

export function EventReactions({ events, players, onDismiss }: EventReactionsProps) {
  const reactionEvents = events.filter(
    (e) => e.emoji && (e.kind === "reaction" || e.kind === "trick-win"),
  );

  useEffect(() => {
    const timers = reactionEvents.map((evt) =>
      window.setTimeout(() => onDismiss(evt.id), evt.durationMs ?? 1600),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reactionEvents, onDismiss]);

  if (!reactionEvents.length) return null;

  return (
    <div className="breactions" aria-hidden="true">
      {reactionEvents.map((evt, i) => {
        const name = players.find((p) => p.playerId === evt.playerId)?.displayName;
        return (
          <div
            key={evt.id}
            className="breactions__burst"
            style={{ ["--burst-i" as string]: i }}
          >
            <span className="breactions__emoji">{evt.emoji}</span>
            {name && evt.kind === "trick-win" && (
              <span className="breactions__name">{name.split(" ")[0]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
