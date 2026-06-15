import { useEffect, useRef, useState } from "react";
import type { PotMetrics, TableSessionData } from "../types";

export type TableEventKind =
  | "trick-win"
  | "big-pot"
  | "pot-cap"
  | "bourre"
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
  tricks: Record<string, number>;
  pot: number;
  trickPlays: number;
  phase: string | null | undefined;
};

function detectEvents(
  prev: Snapshot,
  session: TableSessionData,
  potMetrics: PotMetrics,
  participantIds: string[],
): TableEvent[] {
  const tricks = session.tricksByPlayer ?? {};
  const trickPlays = session.currentTrick?.plays?.length ?? 0;
  const phase = session.phase;
  const pot = potMetrics.currentPot;
  const newEvents: TableEvent[] = [];

  for (const pid of participantIds) {
    const before = prev.tricks[pid] ?? 0;
    const after = tricks[pid] ?? 0;
    if (after > before) {
      newEvents.push({
        id: nextId(),
        kind: "trick-win",
        title: "Trick captured",
        emoji: "🃏",
        playerId: pid,
        durationMs: 1800,
      });
    }
  }

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

  if (phase === "play" && prev.phase === "play") {
    const totalTricks = Object.values(tricks).reduce((s, n) => s + (n || 0), 0);
    if (totalTricks >= 4 && trickPlays === 0 && prev.trickPlays > 0) {
      const bourreIds = participantIds.filter((id) => (tricks[id] ?? 0) === 0);
      if (bourreIds.length) {
        newEvents.push({
          id: nextId(),
          kind: "bourre",
          title: "Bourré pressure",
          subtitle: "Zero tricks on the line",
          emoji: "😬",
          durationMs: 2400,
        });
      }
    }
  }

  return newEvents;
}

export function useTableEvents({ session, potMetrics, participantIds }: UseTableEventsInput) {
  const [events, setEvents] = useState<TableEvent[]>([]);
  const prevRef = useRef<Snapshot | null>(null);

  const snapshotKey = JSON.stringify({
    tricks: session.tricksByPlayer,
    pot: potMetrics.currentPot,
    trickPlays: session.currentTrick?.plays?.length ?? 0,
    phase: session.phase,
    cap: potMetrics.potCap,
    lim: potMetrics.limEnabled,
    participants: participantIds,
  });

  useEffect(() => {
    const tricks = session.tricksByPlayer ?? {};
    const trickPlays = session.currentTrick?.plays?.length ?? 0;
    const phase = session.phase;
    const pot = potMetrics.currentPot;
    const prev = prevRef.current;
    prevRef.current = { tricks: { ...tricks }, pot, trickPlays, phase };
    if (!prev) return;

    const newEvents = detectEvents(prev, session, potMetrics, participantIds);
    if (!newEvents.length) return;

    const frame = requestAnimationFrame(() => {
      setEvents((e) => [...e, ...newEvents]);
    });
    return () => cancelAnimationFrame(frame);
  }, [snapshotKey, session, potMetrics, participantIds]);

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
