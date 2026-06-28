import type { MoneyEvent } from "./types";

/** Stable event id from action + type + player + sub-key. */
export function makeEventId(
  actionId: string,
  type: string,
  playerId: string | null,
  subKey = "",
): string {
  const pid = playerId ?? "_session";
  const sk = subKey ? `:${subKey}` : "";
  return `${actionId}:${type}:${pid}${sk}`;
}

/** True when actionId already has events in the log (idempotent no-op). */
export function hasActionBeenApplied(
  events: MoneyEvent[],
  actionId: string,
): boolean {
  return events.some((e) => e.actionId === actionId);
}

/** Deduplicate events by eventId (first wins). */
export function dedupeEventsById(events: MoneyEvent[]): MoneyEvent[] {
  const seen = new Set<string>();
  const out: MoneyEvent[] = [];
  for (const e of events) {
    if (seen.has(e.eventId)) continue;
    seen.add(e.eventId);
    out.push(e);
  }
  return out;
}

/** Deduplicate events by actionId (entire action skipped on retry). */
export function dedupeEventsByActionId(events: MoneyEvent[]): MoneyEvent[] {
  const seen = new Set<string>();
  const out: MoneyEvent[] = [];
  for (const e of events) {
    if (seen.has(e.actionId)) continue;
    seen.add(e.actionId);
    out.push(e);
  }
  return out;
}
