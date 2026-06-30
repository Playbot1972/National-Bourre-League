import type { SeatPlacement } from "../logic";
import type { MobileOrientation } from "./mobileSeatMap";
import type { ResolvedSeatLayout } from "./seatLayout";
import { resolveHandLane } from "./seatLayout";
import { mobileSixBotSeatMap } from "./seatPresetAnchors";

type SeatIndex = 0 | 1 | 2 | 3 | 4;

export function isFourPlayerMobile(totalPlayers: number): boolean {
  return totalPlayers === 5;
}

function mapForOrientation(orientation: MobileOrientation): Record<SeatIndex, SeatPlacement> {
  const sixBot = mobileSixBotSeatMap(orientation);
  return {
    0: sixBot[0],
    1: sixBot[1],
    2: sixBot[3],
    3: sixBot[5],
    4: sixBot[6],
  };
}

export function resolveFourPlayerMobileSeat(
  seatIndex: number,
  orientation: MobileOrientation,
  opts: { isSelf: boolean },
): ResolvedSeatLayout | null {
  if (seatIndex < 0 || seatIndex > 4) return null;
  const placement = mapForOrientation(orientation)[seatIndex as SeatIndex];
  if (!placement) return null;
  return {
    ...placement,
    seatIndex,
    handLane: resolveHandLane(placement, {
      isMobile: true,
      isSelf: opts.isSelf,
      total: 5,
    }),
  };
}
