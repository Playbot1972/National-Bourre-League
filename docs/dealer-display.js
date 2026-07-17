/**
 * Dealer badge resolution — bankroll-eligible seats only (mirrors src/session/dealer.ts).
 */

import { scoreBankroll } from "./bourre-rules.js";

function eligiblePlayerIds(sortedPlayerIds, scoreById, buyInFallback) {
  return (sortedPlayerIds || []).filter((pid) => {
    const row = scoreById?.[pid];
    if (row?.out === true) return false;
    return scoreBankroll(row, buyInFallback) > 0;
  });
}

/** Dealer badge target; null when <2 eligible players or none qualify. */
export function resolveDisplayDealerId(
  dealerId,
  sortedPlayerIds,
  scoreById,
  buyInFallback = 0,
) {
  if (!sortedPlayerIds?.length) return null;
  const eligible = eligiblePlayerIds(sortedPlayerIds, scoreById, buyInFallback);
  if (eligible.length < 2) return null;

  const eligibleSet = new Set(eligible);
  if (!dealerId) {
    return sortedPlayerIds.find((pid) => eligibleSet.has(pid)) ?? null;
  }

  const idx = sortedPlayerIds.indexOf(dealerId);
  const ring =
    idx >= 0
      ? [...sortedPlayerIds.slice(idx), ...sortedPlayerIds.slice(0, idx)]
      : [...sortedPlayerIds];

  for (const pid of ring) {
    if (eligibleSet.has(pid)) return pid;
  }
  return null;
}
