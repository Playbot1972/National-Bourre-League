import type { MoneyEvent } from "./types";
import { sortMoneyEvents } from "./replay";

/** Human-readable money breakdown from event log (support / testing). */
export function explainMoneyEvents(
  events: MoneyEvent[],
  buyInFallback = 100,
): string {
  const sorted = sortMoneyEvents(events);
  const lines: string[] = [
    `Money event log (${sorted.length} events, buy-in ${buyInFallback})`,
    "",
  ];

  let hand: string | null = null;
  for (const e of sorted) {
    if (e.handId !== hand) {
      hand = e.handId;
      lines.push(hand == null ? "--- Session ---" : `--- Hand ${hand} ---`);
    }
    const who = e.playerId ?? "table";
    const sign = e.amount >= 0 ? "+" : "";
    const meta =
      Object.keys(e.metadata || {}).length > 0
        ? ` ${JSON.stringify(e.metadata)}`
        : "";
    lines.push(
      `  [${e.sequence}] ${e.phase} ${e.type} ${who}: ${sign}${e.amount}${meta}`,
    );
  }

  return lines.join("\n");
}
