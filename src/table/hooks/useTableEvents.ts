import { useEffect, useRef, useState } from "react";
import type { PotMetrics, TableSessionData } from "../types";

export type TableEventKind =
  | "big-pot"
  | "pot-cap"
  | "hand-win"
  | "reaction";

export interface TableEvent {
  id: string;
  kind: TableEventKind;
  title: string;
  subtitle?: string;
  emoji?: string;
  playerId?: string;
  durationMs?: number;
}

interface UseTableEventsInput {
  session: TableSessionData;
  potMetrics: PotMetrics;
  participantIds: string[];
}

let eventCounter = 0;

function nextId() {
  eventCounter += 1;
  return `evt-${eventCounter}-${Date.now()}`;
}

type Snapshot = {
  pot: number;
};

function detectEvents(
  prev: Snapshot,
  potMetrics: PotMetrics,
  participantIds: string[],
): TableEvent[] {
  const pot = potMetrics.currentPot;
  const newEvents: TableEvent[] = [];

  if (pot >= potMetrics.potCap && potMetrics.limEnabled && pot > prev.pot) {
    newEvents.push({
      id: nextId(),
      kind: "pot-cap",
      title: "Pot cap reached",
      subtitle: "LmT engaged",
      emoji: "🔒",
      durationMs: 2200,
    });
  } else if (pot >= potMetrics.anteAmount * Math.max(participantIds.length, 2) * 2 && pot > prev.pot) {
    newEvents.push({
      id: nextId(),
      kind: "big-pot",
      title: "Big pot brewing",
      emoji: "💰",
      durationMs: 2000,
    });
  }

  return newEvents;
}

export function useTableEvents({ session, potMetrics, participantIds }: UseTableEventsInput) {
  const [events, setEvents] = useState<TableEvent[]>([]);
  const prevRef = useRef<Snapshot | null>(null);

  const snapshotKey = JSON.stringify({
    handNumber: session.handNumber,
    pot: potMetrics.currentPot,
    cap: potMetrics.potCap,
    lim: potMetrics.limEnabled,
    participants: participantIds,
  });

  useEffect(() => {
    prevRef.current = null;
  }, [session.handNumber]);

  useEffect(() => {
    const pot = potMetrics.currentPot;
    const prev = prevRef.current;
    prevRef.current = { pot };
    if (!prev) return;

    const newEvents = detectEvents(prev, potMetrics, participantIds);
    if (!newEvents.length) return;

    const frame = requestAnimationFrame(() => {
      setEvents((e) => [...e, ...newEvents]);
    });
    return () => cancelAnimationFrame(frame);
  }, [snapshotKey, potMetrics, participantIds]);

  const dismissEvent = (id: string) => {
    setEvents((e) => e.filter((x) => x.id !== id));
  };

  const pushReaction = (emoji: string, playerId?: string) => {
    setEvents((e) => [
      ...e,
      {
        id: nextId(),
        kind: "reaction",
        title: "",
        emoji,
        playerId,
        durationMs: 1400,
      },
    ]);
  };

  return { events, dismissEvent, pushReaction };
}
