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

/**
 * Outer rail ellipse — matches `.btable__rail` with border-radius 50% / 50%
 * (semi-axes are half the seat-layer width and height).
 */
export const RAIL_RX = 50;
export const RAIL_RY = 50;

/** Push avatar centers slightly past the rail lip onto the outer edge. */
export const SEAT_RAIL_OUTSET = 2;

export type SeatRegion = "bottom" | "top" | "left" | "right";

export function seatRegion(theta: number): SeatRegion {
  const deg = (((theta * 180) / Math.PI) % 360 + 360) % 360;
  if (deg >= 55 && deg <= 125) return "bottom";
  if (deg >= 235 && deg <= 305) return "left";
  if (deg >= 145 && deg <= 215) return "top";
  return "right";
}

export interface SeatPlacement {
  x: number;
  y: number;
  region: SeatRegion;
}

/**
 * Evenly spaced seats on the outer rail oval (index 0 = bottom / hero, clockwise).
 * Equal angle steps; ellipse matches the visible table edge in all orientations.
 */
export function seatPosition(index: number, total: number): SeatPlacement {
  const n = Math.max(2, Math.min(8, total || 2));
  if (n <= 0) return { x: 50, y: 50, region: "bottom" };

  const theta = (index / n) * Math.PI * 2 + Math.PI / 2;
  const nx = Math.cos(theta);
  const ny = Math.sin(theta);

  return {
    x: 50 + RAIL_RX * nx + nx * SEAT_RAIL_OUTSET,
    y: 50 + RAIL_RY * ny + ny * SEAT_RAIL_OUTSET,
    region: seatRegion(theta),
  };
}

/** Table width:height ratio — widens smoothly from 2 → 8 players (same in portrait & landscape). */
export function tableAspectForPlayers(total: number): number {
  const n = Math.max(2, Math.min(8, total || 2));
  return 1.15 + ((n - 2) * 0.84) / 6;
}
