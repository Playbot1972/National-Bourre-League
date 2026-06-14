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

/** Matches `.btable__rail` stadium oval (50% / 50% border-radius). */
export const TABLE_ELLIPSE = { rx: 48, ry: 40 } as const;

/** Push seat centers outward onto the rail (Texas Hold'em style). */
export const SEAT_RAIL_OUTSET = 2.5;

/** Horizontal / vertical radii (% of table) — uniform oval, slight inset for tiny tables. */
export function seatRadii(total: number) {
  const n = Math.max(2, Math.min(8, total || 2));
  const inset = n <= 3 ? 0.9 : n <= 4 ? 0.95 : 1;
  return {
    rx: TABLE_ELLIPSE.rx * inset,
    ry: TABLE_ELLIPSE.ry * inset,
  };
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
 * Evenly spaced seats on the rail oval (0 = bottom / hero, clockwise).
 * Uses cos/sin parametric ellipse so spacing matches the visible table edge.
 */
export function seatPosition(index: number, total: number): SeatPlacement {
  if (total <= 0) return { x: 50, y: 50, region: "bottom" };
  const { rx, ry } = seatRadii(total);
  const theta = (index / total) * Math.PI * 2 + Math.PI / 2;
  const nx = Math.cos(theta);
  const ny = Math.sin(theta);
  const onRailX = 50 + rx * nx;
  const onRailY = 50 + ry * ny;
  return {
    x: onRailX + nx * SEAT_RAIL_OUTSET,
    y: onRailY + ny * SEAT_RAIL_OUTSET,
    region: seatRegion(theta),
  };
}
