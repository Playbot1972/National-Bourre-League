import type { SeatPlacement } from "../logic";
import type { MobileOrientation } from "./mobileSeatMap";
import type { ResolvedSeatLayout } from "./seatLayout";
import { resolveHandLane } from "./seatLayout";
import { mobileSevenBotSeatMap } from "./seatPresetAnchors";

type SeatIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface EightPlayerMobileAnchor extends SeatPlacement {
  seatIndex: SeatIndex;
}

function mapForOrientation(orientation: MobileOrientation): Record<SeatIndex, EightPlayerMobileAnchor> {
  const preset = mobileSevenBotSeatMap(orientation);
  return {
    0: { seatIndex: 0, ...preset[0] },
    1: { seatIndex: 1, ...preset[1] },
    2: { seatIndex: 2, ...preset[2] },
    3: { seatIndex: 3, ...preset[3] },
    4: { seatIndex: 4, ...preset[4] },
    5: { seatIndex: 5, ...preset[5] },
    6: { seatIndex: 6, ...preset[6] },
    7: { seatIndex: 7, ...preset[7] },
  };
}

export function isEightPlayerMobile(totalPlayers: number): boolean {
  return totalPlayers >= 8;
}

export function eightPlayerMobileAnchor(
  seatIndex: number,
  orientation: MobileOrientation,
): EightPlayerMobileAnchor | null {
  if (seatIndex < 0 || seatIndex > 7) return null;
  return mapForOrientation(orientation)[seatIndex as SeatIndex] ?? null;
}

export function resolveEightPlayerMobileSeat(
  seatIndex: number,
  orientation: MobileOrientation,
  opts: { isSelf: boolean },
): ResolvedSeatLayout | null {
  const anchor = eightPlayerMobileAnchor(seatIndex, orientation);
  if (!anchor) return null;
  return {
    x: anchor.x,
    y: anchor.y,
    region: anchor.region,
    seatIndex,
    handLane: resolveHandLane(anchor, {
      isMobile: true,
      isSelf: opts.isSelf,
      total: 8,
    }),
  };
}

/** Full 7-bot mobile ring for tests and debugging. */
export function buildEightPlayerMobileSeatMap(
  orientation: MobileOrientation,
): ResolvedSeatLayout[] {
  return Array.from({ length: 8 }, (_, seatIndex) =>
    resolveEightPlayerMobileSeat(seatIndex, orientation, { isSelf: seatIndex === 0 })!,
  );
}
