import type { SeatPlacement } from "../logic";
import { seatPosition } from "../logic";
import type { MobileOrientation } from "./mobileSeatMap";
import type { ResolvedSeatLayout } from "./seatLayout";
import { resolveHandLane } from "./seatLayout";
import { mobileSixBotSeatMap } from "./seatPresetAnchors";

type SeatIndex = 0 | 1 | 2 | 3 | 4 | 5;

const MOBILE_X_BOUNDS = { min: 8, max: 92 } as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampMobilePlacement(
  placement: SeatPlacement,
  orientation: MobileOrientation,
): SeatPlacement {
  const yMax = orientation === "landscape" ? 54 : 56;
  return {
    ...placement,
    x: clamp(placement.x, MOBILE_X_BOUNDS.min, MOBILE_X_BOUNDS.max),
    y: clamp(placement.y, 8, yMax),
  };
}

export function isFivePlayerMobile(totalPlayers: number): boolean {
  return totalPlayers === 6;
}

function mapForOrientation(orientation: MobileOrientation): Record<SeatIndex, SeatPlacement> {
  const sixBot = mobileSixBotSeatMap(orientation);
  const desktopInterior = [2, 3, 4].map((i) =>
    clampMobilePlacement(seatPosition(i, 6), orientation),
  );
  return {
    0: sixBot[0],
    1: sixBot[1],
    2: desktopInterior[0]!,
    3: desktopInterior[1]!,
    4: desktopInterior[2]!,
    5: sixBot[6],
  };
}

export function resolveFivePlayerMobileSeat(
  seatIndex: number,
  orientation: MobileOrientation,
  opts: { isSelf: boolean },
): ResolvedSeatLayout | null {
  if (seatIndex < 0 || seatIndex > 5) return null;
  const placement = mapForOrientation(orientation)[seatIndex as SeatIndex];
  if (!placement) return null;
  return {
    ...placement,
    seatIndex,
    handLane: resolveHandLane(placement, {
      isMobile: true,
      isSelf: opts.isSelf,
      total: 6,
    }),
  };
}
