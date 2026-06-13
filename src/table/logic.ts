export const BOURRE_TRICKS_TO_WIN = 3;
export const MAX_TRICKS_PER_HAND = 5;

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
  if (maxTricks < BOURRE_TRICKS_TO_WIN) {
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

/** Evenly spaced seats around an oval (0 = bottom / hero seat). */
export function seatPosition(index: number, total: number) {
  if (total <= 0) return { x: 50, y: 50 };
  const angle = (index / total) * Math.PI * 2 + Math.PI / 2;
  const rx = 38;
  const ry = 32;
  return {
    x: 50 + Math.sin(angle) * rx,
    y: 50 + Math.cos(angle) * ry * 0.92,
  };
}
