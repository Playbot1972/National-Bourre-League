import type { SeatPlacement } from "../logic";

/** Center play cluster footprint (percent of table stage). */
export const CENTER_PLAY_BBOX = {
  xMin: 42,
  xMax: 58,
  yMin: 36,
  yMax: 52,
} as const;

export function pointInCenterPlayBbox(x: number, y: number): boolean {
  return (
    x >= CENTER_PLAY_BBOX.xMin &&
    x <= CENTER_PLAY_BBOX.xMax &&
    y >= CENTER_PLAY_BBOX.yMin &&
    y <= CENTER_PLAY_BBOX.yMax
  );
}

/** Top trump rail (y < 24) may sit above center play — intentional real estate. */
export function isTopTrumpRailExempt(placement: SeatPlacement): boolean {
  return placement.region === "top" && placement.y < 24;
}

/** Bottom hero rail stays fixed for seated promotion preview. */
export function isBottomHeroRailExempt(placement: SeatPlacement): boolean {
  return placement.region === "bottom" && placement.y > 85;
}

function isSpectatorLayoutExempt(placement: SeatPlacement): boolean {
  return isTopTrumpRailExempt(placement) || isBottomHeroRailExempt(placement);
}

/**
 * Side-rail seats whose anchor sits in the vertical center-play band (y ≈ 44–52%)
 * can visually overlap trick/trump when hole-card crowns extend inward.
 */
export function appliesSpectatorMidRailGuard(placement: SeatPlacement): boolean {
  if (isSpectatorLayoutExempt(placement)) return false;
  const sideRail = placement.region === "left" || placement.region === "right";
  if (!sideRail) return false;
  const midRailY = placement.y >= 44 && placement.y <= 52;
  const inCenterBand =
    placement.y >= CENTER_PLAY_BBOX.yMin && placement.y <= CENTER_PLAY_BBOX.yMax;
  return midRailY || inCenterBand || pointInCenterPlayBbox(placement.x, placement.y);
}

/**
 * Presentation-only nudge for watch-only / spectator views — keeps canonical seat ring.
 */
export function applySpectatorSeatLayoutGuard(placement: SeatPlacement): SeatPlacement {
  if (appliesSpectatorMidRailGuard(placement)) {
    const y = placement.y <= 49 ? 33 : 56;
    let x = placement.x;
    if (placement.region === "left") {
      x = Math.min(x, 4);
    } else if (placement.region === "right") {
      x = Math.max(x, 96);
    }
    return { ...placement, x, y };
  }

  if (
    !isSpectatorLayoutExempt(placement) &&
    pointInCenterPlayBbox(placement.x, placement.y)
  ) {
    const y = placement.y <= 49 ? CENTER_PLAY_BBOX.yMin - 3 : CENTER_PLAY_BBOX.yMax + 4;
    return { ...placement, y };
  }

  return placement;
}
