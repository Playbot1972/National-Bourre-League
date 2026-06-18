import type { SeatPlacement, SeatRegion } from "../logic";

export type MobileOrientation = "portrait" | "landscape";

/** Intentional mobile felt shape — taller in portrait for 3–4 player games. */
export function mobileTableAspect(opponentCount: number, orientation: MobileOrientation): number {
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

function regionFromAngle(deg: number): SeatRegion {
  const d = ((deg % 360) + 360) % 360;
  if (d >= 30 && d <= 150) return "top";
  if (d >= 210 && d <= 330) return "bottom";
  if (d >= 150 && d < 210) return "left";
  return "right";
}

/**
 * Opponent-only seat map for mobile — hero sits in the bottom dock, not on the felt.
 * Index 0 = leftmost opponent (portrait) or first clockwise from top-left (landscape).
 */
export function mobileOpponentSeatPosition(
  opponentIndex: number,
  opponentCount: number,
  orientation: MobileOrientation,
): SeatPlacement {
  const n = Math.max(1, Math.min(7, opponentCount || 1));
  const i = Math.max(0, Math.min(n - 1, opponentIndex));

  if (orientation === "portrait") {
    const startDeg = 205;
    const endDeg = 335;
    const t = n === 1 ? 0.5 : i / (n - 1);
    const deg = startDeg + (endDeg - startDeg) * t;
    const rad = (deg * Math.PI) / 180;
    const rx = n <= 2 ? 40 : 38;
    const ry = n <= 2 ? 26 : 28;
    const nx = Math.cos(rad);
    const ny = Math.sin(rad);
    return {
      x: 50 + rx * nx,
      y: 50 + ry * ny,
      region: regionFromAngle(deg),
    };
  }

  const startDeg = 160;
  const endDeg = 380;
  const t = n === 1 ? 0.5 : i / (n - 1);
  const deg = startDeg + (endDeg - startDeg) * t;
  const rad = (deg * Math.PI) / 180;
  const rx = 40;
  const ry = 36;
  const nx = Math.cos(rad);
  const ny = Math.sin(rad);
  return {
    x: 50 + rx * nx,
    y: 50 + ry * ny,
    region: regionFromAngle(deg),
  };
}
