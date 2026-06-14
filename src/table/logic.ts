export const MAX_TRICKS_PER_HAND = 5;

export function tricksToWinHint(playerCount: number, totalTricks = MAX_TRICKS_PER_HAND) {
  const n = Math.max(2, playerCount || 2);
  return Math.ceil(totalTricks / n);
}

export function totalTricksPlayed(
  tricksByPlayer: Record<string, number>,
  participantIds: string[],
) {
  return participantIds.reduce((sum, pid) => sum + (tricksByPlayer[pid] || 0), 0);
}

export function isHandComplete(
  tricksByPlayer: Record<string, number>,
  participantIds: string[],
) {
  return totalTricksPlayed(tricksByPlayer, participantIds) >= MAX_TRICKS_PER_HAND;
}

/** Most tricks wins; ties at the top share winner status. */
export function deriveWinnersFromTricks(
  tricksByPlayer: Record<string, number>,
  participantIds: string[],
) {
  const participants = [...new Set(participantIds.filter(Boolean))];
  if (participants.length < 2) {
    return { ready: false, winnerIds: [] as string[], maxTricks: 0 };
  }
  let maxTricks = 0;
  for (const pid of participants) {
    maxTricks = Math.max(maxTricks, tricksByPlayer[pid] || 0);
  }
  if (maxTricks === 0) {
    return { ready: false, winnerIds: [] as string[], maxTricks };
  }
  const winnerIds = participants.filter((pid) => (tricksByPlayer[pid] || 0) === maxTricks);
  return { ready: true, winnerIds, maxTricks };
}

export function formatRiskStake(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

export function formatNet(amount: number) {
  const n = Number(amount) || 0;
  if (n > 0) return `+${formatRiskStake(n)}`;
  if (n < 0) return `−${formatRiskStake(Math.abs(n))}`;
  return formatRiskStake(0);
}

export function initials(name: string) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "?";
}

/** Horizontal / vertical radii (% of table) — wider oval for more players. */
export function seatRadii(total: number) {
  const n = Math.max(2, Math.min(8, total || 2));
  if (n >= 8) return { rx: 47, ry: 22 };
  if (n >= 7) return { rx: 46, ry: 24 };
  if (n >= 6) return { rx: 44, ry: 26 };
  if (n >= 5) return { rx: 42, ry: 28 };
  if (n >= 4) return { rx: 40, ry: 30 };
  return { rx: 36, ry: 32 };
}

/** Evenly spaced seats around a horizontal oval (0 = bottom / hero seat). */
export function seatPosition(index: number, total: number) {
  if (total <= 0) return { x: 50, y: 50 };
  const { rx, ry } = seatRadii(total);
  const angle = (index / total) * Math.PI * 2 + Math.PI / 2;
  return {
    x: 50 + Math.sin(angle) * rx,
    y: 50 + Math.cos(angle) * ry,
  };
}
