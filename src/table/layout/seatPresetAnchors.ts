import type { MobileOrientation } from "./mobileSeatMap";

type SeatRegion = "bottom" | "top" | "left" | "right";

interface SeatPlacement {
  x: number;
  y: number;
  region: SeatRegion;
}

type SeatMap<T extends number> = Record<T, SeatPlacement>;

/** Desktop 6-bot table (hero + 6 bots, totalPlayers = 7). */
export const DESKTOP_SIX_BOT_SEAT_MAP: SeatMap<0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  0: { x: 50, y: 99, region: "bottom" },
  1: { x: 4, y: 99, region: "bottom" },
  2: { x: 2, y: 46.5, region: "left" },
  3: { x: 8, y: 9, region: "top" },
  4: { x: 50, y: 9, region: "top" },
  5: { x: 92, y: 9, region: "top" },
  6: { x: 96, y: 99, region: "bottom" },
};

/**
 * Desktop 5-bot table (hero + 5 bots, totalPlayers = 6).
 * Seats 1 and 5 mirror the 6-bot bottom-corner anchors for side symmetry.
 */
export const DESKTOP_FIVE_BOT_SEAT_MAP: SeatMap<0 | 1 | 2 | 3 | 4 | 5> = {
  0: { x: 50, y: 99, region: "bottom" },
  1: DESKTOP_SIX_BOT_SEAT_MAP[1],
  2: { x: 9.3, y: 27.5, region: "left" },
  3: { x: 50, y: 5, region: "top" },
  4: { x: 90.7, y: 27.5, region: "right" },
  5: DESKTOP_SIX_BOT_SEAT_MAP[6],
};

/**
 * Desktop 7-bot table (hero + 7 bots, totalPlayers = 8).
 * Bot 1 and Bot 7 reuse the 6-bot bottom-corner anchors exactly.
 */
export const DESKTOP_SEVEN_BOT_SEAT_MAP: SeatMap<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
  0: { x: 50, y: 99, region: "bottom" },
  1: DESKTOP_SIX_BOT_SEAT_MAP[1],
  2: DESKTOP_SIX_BOT_SEAT_MAP[2],
  3: DESKTOP_SIX_BOT_SEAT_MAP[3],
  4: DESKTOP_SIX_BOT_SEAT_MAP[4],
  5: DESKTOP_SIX_BOT_SEAT_MAP[5],
  6: { x: 98, y: 46.5, region: "right" },
  7: DESKTOP_SIX_BOT_SEAT_MAP[6],
};

/** Shared anchors reused across 6-bot and 7-bot layouts. */
export const SHARED_DESKTOP_ANCHORS = {
  sixBotBottomLeft: DESKTOP_SIX_BOT_SEAT_MAP[1],
  sixBotBottomRight: DESKTOP_SIX_BOT_SEAT_MAP[6],
  sixBotTopCenter: DESKTOP_SIX_BOT_SEAT_MAP[4],
} as const;

const MOBILE_SIX_BOT_PORTRAIT: SeatMap<0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  0: { x: 50, y: 91, region: "bottom" },
  1: { x: 8, y: 91, region: "bottom" },
  2: { x: 8, y: 46.5, region: "left" },
  3: { x: 8, y: 9, region: "top" },
  4: { x: 50, y: 9, region: "top" },
  5: { x: 92, y: 9, region: "top" },
  6: { x: 92, y: 91, region: "bottom" },
};

const MOBILE_SIX_BOT_LANDSCAPE: SeatMap<0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  0: { x: 50, y: 90, region: "bottom" },
  1: { x: 8, y: 91, region: "bottom" },
  2: { x: 8, y: 46.5, region: "left" },
  3: { x: 8, y: 9, region: "top" },
  4: { x: 50, y: 9, region: "top" },
  5: { x: 92, y: 9, region: "top" },
  6: { x: 92, y: 91, region: "bottom" },
};

const MOBILE_SEVEN_BOT_PORTRAIT: SeatMap<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
  0: { x: 50, y: 91, region: "bottom" },
  1: MOBILE_SIX_BOT_PORTRAIT[1],
  2: MOBILE_SIX_BOT_PORTRAIT[2],
  3: MOBILE_SIX_BOT_PORTRAIT[3],
  4: MOBILE_SIX_BOT_PORTRAIT[4],
  5: MOBILE_SIX_BOT_PORTRAIT[5],
  6: { x: 92, y: 46.5, region: "right" },
  7: MOBILE_SIX_BOT_PORTRAIT[6],
};

const MOBILE_SEVEN_BOT_LANDSCAPE: SeatMap<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
  0: { x: 50, y: 91, region: "bottom" },
  1: MOBILE_SIX_BOT_LANDSCAPE[1],
  2: MOBILE_SIX_BOT_LANDSCAPE[2],
  3: MOBILE_SIX_BOT_LANDSCAPE[3],
  4: MOBILE_SIX_BOT_LANDSCAPE[4],
  5: MOBILE_SIX_BOT_LANDSCAPE[5],
  6: { x: 92, y: 46.5, region: "right" },
  7: MOBILE_SIX_BOT_LANDSCAPE[6],
};

export const SHARED_MOBILE_ANCHORS = {
  sixBotBottomLeftPortrait: MOBILE_SIX_BOT_PORTRAIT[1],
  sixBotBottomRightPortrait: MOBILE_SIX_BOT_PORTRAIT[6],
  sixBotTopCenterPortrait: MOBILE_SIX_BOT_PORTRAIT[4],
} as const;

export function mobileSixBotSeatMap(
  orientation: MobileOrientation,
): SeatMap<0 | 1 | 2 | 3 | 4 | 5 | 6> {
  return orientation === "landscape" ? MOBILE_SIX_BOT_LANDSCAPE : MOBILE_SIX_BOT_PORTRAIT;
}

export function mobileSevenBotSeatMap(
  orientation: MobileOrientation,
): SeatMap<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7> {
  return orientation === "landscape" ? MOBILE_SEVEN_BOT_LANDSCAPE : MOBILE_SEVEN_BOT_PORTRAIT;
}

export function placementMatches(
  actual: SeatPlacement,
  expected: SeatPlacement,
  tolerance = 0.05,
): boolean {
  return (
    actual.region === expected.region &&
    Math.abs(actual.x - expected.x) < tolerance &&
    Math.abs(actual.y - expected.y) < tolerance
  );
}
