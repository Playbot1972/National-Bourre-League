/** Gesture thresholds for hero card play (touch + mouse via Pointer Events). */
export const CARD_GESTURE = {
  /** Hold longer than this fires play (ms). */
  HOLD_MS: 220,
  /** Max movement (px) to count as a tap. */
  TAP_MOVE_PX: 12,
  /** Minimum upward movement (px) for swipe-up play. */
  SWIPE_UP_PX: 28,
  /** Downward drag beyond this cancels play (scroll gesture). */
  SCROLL_CANCEL_PX: 48,
} as const;

export type CardGestureKind = "tap" | "hold" | "swipe-up";

export function isTapMovement(dx: number, dy: number): boolean {
  return Math.hypot(dx, dy) <= CARD_GESTURE.TAP_MOVE_PX;
}

export function isSwipeUpPlay(dx: number, dy: number): boolean {
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  return dy <= -CARD_GESTURE.SWIPE_UP_PX && absDy > absDx;
}

export function isScrollCancel(dx: number, dy: number): boolean {
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  return dy > 0 && absDy > CARD_GESTURE.SCROLL_CANCEL_PX && absDy > absDx;
}

export interface CardGestureSession {
  pointerId: number;
  startX: number;
  startY: number;
  fired: boolean;
}

export function createCardGestureSession(
  pointerId: number,
  startX: number,
  startY: number,
): CardGestureSession {
  return { pointerId, startX, startY, fired: false };
}
