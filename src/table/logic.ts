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

export function formatBankroll(amount: number) {
  return formatRiskStake(Math.max(0, Number(amount) || 0));
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
 * Seat rail ellipse inside `.btable__seats` (percent of seat box).
 * Stage-fit contain handles viewport edges; rails can sit near the felt lip.
 */
export const RAIL_RX = 46;
export const RAIL_RY = 44;

/** Outward nudge onto the rail lip — balanced for spacing vs safe contain-fit. */
export const SEAT_RAIL_OUTSET = 5;

export function seatRailAxes(total: number): { rx: number; ry: number; outset: number } {
  const n = Math.max(2, Math.min(8, total || 2));
  if (n >= 7) return { rx: 42, ry: 40, outset: 4 };
  if (n >= 5) return { rx: 44, ry: 42, outset: 4 };
  return { rx: RAIL_RX, ry: RAIL_RY, outset: SEAT_RAIL_OUTSET };
}

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

  const { rx, ry, outset } = seatRailAxes(n);
  // Negative angle step: bottom → right → top → left (clockwise on screen).
  const theta = -((index / n) * Math.PI * 2) + Math.PI / 2;
  const nx = Math.cos(theta);
  const ny = Math.sin(theta);

  return {
    x: 50 + rx * nx + nx * outset,
    y: 50 + ry * ny + ny * outset,
    region: seatRegion(theta),
  };
}

/** Table width:height — compact racetrack shape on all devices. */
export function tableAspectForPlayers(total: number): number {
  const n = Math.max(2, Math.min(8, total || 2));
  return 1.12 + ((n - 2) * 0.12) / 6;
}
