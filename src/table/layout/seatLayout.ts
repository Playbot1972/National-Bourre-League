import type { SeatPlacement, SeatRegion } from "../logic";
import { seatPosition } from "../logic";
import type { MobileOrientation } from "./mobileSeatMap";

export type HandLane = "below" | "side";

export interface ResolvedSeatLayout extends SeatPlacement {
  handLane: HandLane;
  seatIndex: number;
}

const MOBILE_X_BOUNDS = { min: 8, max: 92 } as const;
const MOBILE_PORTRAIT_Y_MAX = 56;
const MOBILE_LANDSCAPE_Y_MAX = 54;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Opponent hole cards default below buy-in / seat info.
 * Side placement only on far left/right rails when horizontal space is tight.
 */
export function resolveHandLane(
  placement: SeatPlacement,
  opts: { isMobile: boolean; isSelf: boolean; total: number },
): HandLane {
  if (opts.isSelf) return "below";
  if (opts.isMobile) return "below";
  if (opts.total >= 6 && placement.region === "left" && placement.x < 14) {
    return "side";
  }
  if (opts.total >= 6 && placement.region === "right" && placement.x > 86) {
    return "side";
  }
  return "below";
}

function clampMobilePlacement(
  placement: SeatPlacement,
  orientation: MobileOrientation,
): SeatPlacement {
  const x = clamp(placement.x, MOBILE_X_BOUNDS.min, MOBILE_X_BOUNDS.max);
  const yMax =
    orientation === "portrait" ? MOBILE_PORTRAIT_Y_MAX : MOBILE_LANDSCAPE_Y_MAX;
  const y = clamp(placement.y, 8, yMax);
  return { ...placement, x, y };
}

/** Desktop / full-ring seat slot (index 0 = bottom / hero). */
export function resolveSeatLayout(
  seatIndex: number,
  total: number,
  opts: { isMobile: boolean; isSelf: boolean; orientation?: MobileOrientation },
): ResolvedSeatLayout {
  const placement = seatPosition(seatIndex, total);
  const bounded =
    opts.isMobile && opts.orientation
      ? clampMobilePlacement(placement, opts.orientation)
      : placement;
  return {
    ...bounded,
    seatIndex,
    handLane: resolveHandLane(bounded, {
      isMobile: opts.isMobile,
      isSelf: opts.isSelf,
      total,
    }),
  };
}

/** Mobile opponent slot — index 0 is the first seat clockwise from hero. */
export function resolveMobileOpponentLayout(
  opponentIndex: number,
  totalPlayers: number,
  orientation: MobileOrientation,
): ResolvedSeatLayout {
  const seatIndex = opponentIndex + 1;
  return resolveSeatLayout(seatIndex, totalPlayers, {
    isMobile: true,
    isSelf: false,
    orientation,
  });
}

/** Mobile hero rail — always bottom center. */
export function resolveMobileSelfLayout(totalPlayers: number): ResolvedSeatLayout {
  const base = seatPosition(0, Math.max(2, totalPlayers));
  const placement: SeatPlacement = {
    x: base.x,
    y: Math.min(base.y, 88),
    region: "bottom",
  };
  return {
    ...placement,
    seatIndex: 0,
    handLane: "below",
  };
}

/** Deterministic seat map for regression tests (player count = total seats). */
export function buildSeatLayoutMap(
  total: number,
  opts: { isMobile: boolean; orientation?: MobileOrientation } = { isMobile: false },
): ResolvedSeatLayout[] {
  const n = Math.max(2, Math.min(8, total));
  return Array.from({ length: n }, (_, seatIndex) =>
    resolveSeatLayout(seatIndex, n, {
      isMobile: opts.isMobile,
      isSelf: seatIndex === 0,
      orientation: opts.orientation,
    }),
  );
}

/** True when seat indices increase clockwise around the felt (bottom → left → top → right). */
export function isClockwiseOnScreen(layouts: ResolvedSeatLayout[]): boolean {
  if (layouts.length < 3) return true;

  const angles = layouts.map((layout) =>
    Math.atan2(layout.y - 50, layout.x - 50),
  );

  let sweep = 0;
  for (let i = 0; i < angles.length; i++) {
    const current = angles[i]!;
    const next = angles[(i + 1) % angles.length]!;
    let delta = next - current;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;
    sweep += delta;
  }

  return sweep > 0.5;
}

export function regionAtIndex(seatIndex: number, total: number): SeatRegion {
  return seatPosition(seatIndex, total).region;
}
