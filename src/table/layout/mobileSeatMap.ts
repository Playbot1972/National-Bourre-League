import type { SeatPlacement } from "../logic";
import {
  resolveMobileOpponentLayout,
  resolveMobileSelfLayout,
} from "./seatLayout";

export type MobileOrientation = "portrait" | "landscape";

export {
  buildSevenPlayerMobileSeatMap,
  sevenPlayerMobileAnchor,
} from "./sevenPlayerMobileSeatMap";

/** Intentional mobile felt shape — taller in portrait for 3–4 player games. */
export function mobileTableAspect(
  opponentCount: number,
  orientation: MobileOrientation,
): number {
  const n = Math.max(1, Math.min(7, opponentCount || 1));
  if (orientation === "portrait") {
    if (n <= 1) return 0.8;
    if (n <= 2) return 0.82;
    if (n <= 3) return 0.86;
    if (n <= 4) return 0.9;
    return 0.94;
  }
  if (n <= 1) return 1.02;
  if (n <= 2) return 0.98;
  if (n <= 3) return 1.02;
  if (n <= 5) return 1.16;
  return 1.26;
}

/** Local player on the bottom rail. */
export function mobileSelfSeatPosition(
  total: number,
  orientation: MobileOrientation = "portrait",
): SeatPlacement {
  const layout = resolveMobileSelfLayout(total, orientation);
  return { x: layout.x, y: layout.y, region: layout.region };
}

/**
 * Opponent arc for mobile — local player is rendered separately on the bottom rail.
 * Uses the same clockwise seat ring as desktop (hero = index 0).
 */
export function mobileOpponentSeatPosition(
  opponentIndex: number,
  opponentCount: number,
  orientation: MobileOrientation,
): SeatPlacement {
  const totalPlayers = Math.max(2, opponentCount + 1);
  const layout = resolveMobileOpponentLayout(
    opponentIndex,
    totalPlayers,
    orientation,
  );
  return { x: layout.x, y: layout.y, region: layout.region };
}
