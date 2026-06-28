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

/**
 * Players who must win the current (final) trick to avoid bourré.
 * Only applies during play once four tricks are complete — not a vague early warning.
 */
export function playersAtBourreRisk(
  tricksByPlayer: Record<string, number>,
  participantIds: string[],
  phase: string | null | undefined,
): string[] {
  if (phase !== "play") return [];
  const participants = [...new Set(participantIds.filter(Boolean))];
  if (participants.length < 2) return [];

  const tricksPlayed = totalTricksPlayed(tricksByPlayer, participants);
  const tricksRemaining = MAX_TRICKS_PER_HAND - tricksPlayed;
  if (tricksRemaining !== 1) return [];

  return participants.filter((pid) => (tricksByPlayer[pid] ?? 0) === 0);
}

export function isPlayerAtBourreRisk(
  playerId: string,
  tricksByPlayer: Record<string, number>,
  participantIds: string[],
  phase: string | null | undefined,
): boolean {
  return playersAtBourreRisk(tricksByPlayer, participantIds, phase).includes(playerId);
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

/** Read-only ante/stake label — concise dollars or cents, no parenthetical duplicate. */
export function formatAnteStake(amount: number) {
  const n = Math.round(Number(amount) * 100) / 100;
  if (!Number.isFinite(n) || n <= 0) return "$0";
  if (n < 1) return `${Math.round(n * 100)}¢`;
  if (Math.round(n * 100) % 100 === 0) {
    return `$${Math.round(n).toLocaleString("en-US")}`;
  }
  return `$${n.toFixed(2)}`;
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

/** Live stack on seats — server bankroll is authoritative once ante is posted. */
export function displayLiveBankroll(
  bankroll: number | null | undefined,
  anteAmount: number,
  opts: { inHand: boolean; anteAnimActive: boolean; anteAlreadyPosted?: boolean },
): number | null | undefined {
  if (bankroll == null) return bankroll;
  if (opts.anteAlreadyPosted) return bankroll;
  if (!opts.inHand || !opts.anteAnimActive) return bankroll;
  return Math.max(0, bankroll - Math.max(0, anteAmount));
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
  switch (n) {
    case 2:
      return { rx: 44, ry: 42, outset: 8 };
    case 3:
      return { rx: 50, ry: 48, outset: 6 };
    case 4:
      return { rx: 48, ry: 46, outset: 6 };
    case 5:
      return { rx: 45, ry: 43, outset: 5 };
    case 6:
      return { rx: 43, ry: 41, outset: 4 };
    case 7:
      return { rx: 41, ry: 39, outset: 4 };
    case 8:
      return { rx: 40, ry: 38, outset: 3 };
    default:
      return { rx: RAIL_RX, ry: RAIL_RY, outset: SEAT_RAIL_OUTSET };
  }
}

export type SeatRegion = "bottom" | "top" | "left" | "right";

export function seatRegion(theta: number): SeatRegion {
  const nx = Math.cos(theta);
  const ny = Math.sin(theta);
  const absNx = Math.abs(nx);
  const absNy = Math.abs(ny);
  if (absNy >= absNx) {
    return ny > 0 ? "bottom" : "top";
  }
  return nx > 0 ? "right" : "left";
}

export interface SeatPlacement {
  x: number;
  y: number;
  region: SeatRegion;
}

import {
  DESKTOP_FIVE_BOT_SEAT_MAP,
  DESKTOP_SEVEN_BOT_SEAT_MAP,
  DESKTOP_SIX_BOT_SEAT_MAP,
} from "./layout/seatPresetAnchors";

/** 8-player preset (host + 7 bots): reuses 6-bot corners + top center; hero on bottom rail. */
const EIGHT_SEAT_PRESET = DESKTOP_SEVEN_BOT_SEAT_MAP;

/**
 * 7-player preset (hero + 6 bots): corner kiddie seats + mid-rail anchors.
 * Bot 4 is top-rail center; Bot 1 / Bot 6 bottom corners are locked.
 */
const SEVEN_SEAT_PRESET = DESKTOP_SIX_BOT_SEAT_MAP;

/** 6-player preset (hero + 5 bots): lowers seats 1 and 5 toward the hero rail. */
const SIX_SEAT_PRESET = DESKTOP_FIVE_BOT_SEAT_MAP;

function ellipseSeatPosition(index: number, n: number): SeatPlacement {
  const { rx, ry, outset } = seatRailAxes(n);
  // Positive angle step: bottom → left → top → right (clockwise around the felt).
  const theta = ((index / n) * Math.PI * 2) + Math.PI / 2;
  const nx = Math.cos(theta);
  const ny = Math.sin(theta);

  return {
    x: 50 + rx * nx + nx * outset,
    y: 50 + ry * ny + ny * outset,
    region: seatRegion(theta),
  };
}

/**
 * Evenly spaced seats on the outer rail oval (index 0 = bottom / hero, clockwise).
 * Equal angle steps; ellipse matches the visible table edge in all orientations.
 * On 7-seat tables, a fixed corner + mid-rail preset is used (kiddie corners and
 * brown-edge mid seats). On 8-seat tables (host + 7 bots), the same kiddie-corner
 * preset is used end-to-end.
 */
export function seatPosition(index: number, total: number): SeatPlacement {
  const n = Math.max(2, Math.min(8, total || 2));
  if (n <= 0) return { x: 50, y: 50, region: "bottom" };

  if (n === 6) {
    const preset = SIX_SEAT_PRESET[index as 0 | 1 | 2 | 3 | 4 | 5];
    if (preset) return preset;
  }

  if (n === 7) {
    const preset = SEVEN_SEAT_PRESET[index as 0 | 1 | 2 | 3 | 4 | 5 | 6];
    if (preset) return preset;
  }

  if (n >= 8) {
    const preset = EIGHT_SEAT_PRESET[index as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7];
    if (preset) return preset;
  }

  return ellipseSeatPosition(index, n);
}

/**
 * Table width:height — squarer / taller felt for 3–4 players so trump/upcard stays readable.
 * Wider racetrack as seat count grows.
 */
export function tableAspectForPlayers(total: number): number {
  const n = Math.max(2, Math.min(8, total || 2));
  if (n === 2) return 1.04;
  if (n === 3) return 0.94;
  if (n === 4) return 0.98;
  if (n === 5) return 1.08;
  if (n === 6) return 1.12;
  if (n === 7) return 1.16;
  return 1.2;
}
