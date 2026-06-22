import type { SeatPlacement } from "../logic";
import type { MobileOrientation } from "./mobileSeatMap";
import type { ResolvedSeatLayout } from "./seatLayout";
import { resolveHandLane } from "./seatLayout";
import { mobileSixBotSeatMap } from "./seatPresetAnchors";

type SeatIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface SevenPlayerMobileAnchor extends SeatPlacement {
  seatIndex: SeatIndex;
}

function mapForOrientation(orientation: MobileOrientation): Record<SeatIndex, SevenPlayerMobileAnchor> {
  const preset = mobileSixBotSeatMap(orientation);
  return {
    0: { seatIndex: 0, ...preset[0] },
    1: { seatIndex: 1, ...preset[1] },
    2: { seatIndex: 2, ...preset[2] },
    3: { seatIndex: 3, ...preset[3] },
    4: { seatIndex: 4, ...preset[4] },
    5: { seatIndex: 5, ...preset[5] },
    6: { seatIndex: 6, ...preset[6] },
  };
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

/** Full 6-bot mobile ring for tests and debugging. */
export function buildSevenPlayerMobileSeatMap(
  orientation: MobileOrientation,
): ResolvedSeatLayout[] {
  return Array.from({ length: 7 }, (_, seatIndex) =>
    resolveSevenPlayerMobileSeat(seatIndex, orientation, { isSelf: seatIndex === 0 })!,
  );
}

/** Locked anchors — bottom corners and left mid-rail. */
export const SEVEN_PLAYER_MOBILE_LOCKED_SEATS = {
  1: { x: 8, y: 91, region: "bottom" as const },
  2: { x: 8, y: 40.4, region: "left" as const },
  6: { x: 92, y: 91, region: "bottom" as const },
} as const;
