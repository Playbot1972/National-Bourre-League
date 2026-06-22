import type { SeatPlacement } from "../logic";
import type { MobileOrientation } from "./mobileSeatMap";
import type { ResolvedSeatLayout } from "./seatLayout";
import { resolveHandLane } from "./seatLayout";

type SeatIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface SevenPlayerMobileAnchor extends SeatPlacement {
  seatIndex: SeatIndex;
}

/**
 * Explicit 7-player mobile seat anchors (portrait + landscape).
 * Single source of truth — no desktop ellipse, clamp fallback, or CSS nudge.
 *
 * Top corners (3, 5) define the mirror for bottom corners (1, 6).
 * Hero (0) is bottom-rail center; Bot 4 is top-rail center (unchanged).
 * Bot 2 left mid-rail unchanged.
 */
const SEVEN_PLAYER_MOBILE_PORTRAIT: Record<SeatIndex, SevenPlayerMobileAnchor> = {
  0: { seatIndex: 0, x: 50, y: 88, region: "bottom" },
  1: { seatIndex: 1, x: 8, y: 91, region: "bottom" },
  2: { seatIndex: 2, x: 8, y: 40.4, region: "left" },
  3: { seatIndex: 3, x: 8, y: 9, region: "top" },
  4: { seatIndex: 4, x: 69.5, y: 11.3, region: "top" },
  5: { seatIndex: 5, x: 92, y: 9, region: "top" },
  6: { seatIndex: 6, x: 92, y: 91, region: "bottom" },
};

const SEVEN_PLAYER_MOBILE_LANDSCAPE: Record<SeatIndex, SevenPlayerMobileAnchor> = {
  0: { seatIndex: 0, x: 50, y: 86, region: "bottom" },
  1: { seatIndex: 1, x: 8, y: 89, region: "bottom" },
  2: { seatIndex: 2, x: 8, y: 40.4, region: "left" },
  3: { seatIndex: 3, x: 8, y: 9, region: "top" },
  4: { seatIndex: 4, x: 69.5, y: 11.3, region: "top" },
  5: { seatIndex: 5, x: 92, y: 9, region: "top" },
  6: { seatIndex: 6, x: 92, y: 89, region: "bottom" },
};

function mapForOrientation(orientation: MobileOrientation): Record<SeatIndex, SevenPlayerMobileAnchor> {
  return orientation === "landscape"
    ? SEVEN_PLAYER_MOBILE_LANDSCAPE
    : SEVEN_PLAYER_MOBILE_PORTRAIT;
}

export function isSevenPlayerMobile(totalPlayers: number): boolean {
  return totalPlayers === 7;
}

export function sevenPlayerMobileAnchor(
  seatIndex: number,
  orientation: MobileOrientation,
): SevenPlayerMobileAnchor | null {
  if (seatIndex < 0 || seatIndex > 6) return null;
  return mapForOrientation(orientation)[seatIndex as SeatIndex] ?? null;
}

export function resolveSevenPlayerMobileSeat(
  seatIndex: number,
  orientation: MobileOrientation,
  opts: { isSelf: boolean },
): ResolvedSeatLayout | null {
  const anchor = sevenPlayerMobileAnchor(seatIndex, orientation);
  if (!anchor) return null;
  return {
    x: anchor.x,
    y: anchor.y,
    region: anchor.region,
    seatIndex,
    handLane: resolveHandLane(anchor, {
      isMobile: true,
      isSelf: opts.isSelf,
      total: 7,
    }),
  };
}

/** Full 7-player mobile ring for tests and debugging. */
export function buildSevenPlayerMobileSeatMap(
  orientation: MobileOrientation,
): ResolvedSeatLayout[] {
  return Array.from({ length: 7 }, (_, seatIndex) =>
    resolveSevenPlayerMobileSeat(seatIndex, orientation, { isSelf: seatIndex === 0 })!,
  );
}

/** Locked mid-arc seats — must match prior mobile map exactly. */
export const SEVEN_PLAYER_MOBILE_LOCKED_SEATS = {
  2: { x: 8, y: 40.4, region: "left" as const },
  4: { x: 69.5, y: 11.3, region: "top" as const },
} as const;
