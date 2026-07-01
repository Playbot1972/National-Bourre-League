/** Gesture thresholds for hero card play (touch + mouse via Pointer Events). */
export const CARD_GESTURE = {
  /** Hold longer than this fires play (ms). */
  HOLD_MS: 220,
  /** Max movement (px) to count as a tap. */
  TAP_MOVE_PX: 12,
  /** Minimum upward movement (px) for swipe-up play. */
  SWIPE_UP_PX: 28,
  /** Minimum flick distance (px) for swipe-to-play in any direction. */
  SWIPE_FLICK_PX: 36,
  /** Downward drag beyond this cancels play (scroll gesture). */
  SCROLL_CANCEL_PX: 48,
} as const;

export type CardGestureKind = "tap" | "hold" | "swipe-up" | "swipe-flick";

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

/** Swipe-up or outward flick — premium table “throw the card” gesture. */
export function isSwipeFlickPlay(dx: number, dy: number): boolean {
  if (isScrollCancel(dx, dy)) return false;
  if (isSwipeUpPlay(dx, dy)) return true;
  return Math.hypot(dx, dy) >= CARD_GESTURE.SWIPE_FLICK_PX;
}

export interface CardGestureSession {
  pointerId: number;
  startX: number;
  startY: number;
  fired: boolean;
  /** Set once pointer move exceeds swipe threshold — resolved on release. */
  swipeIntent: boolean;
  /** Downward scroll-like drag — suppresses play on release. */
  scrollCancelled: boolean;
}

export function createCardGestureSession(
  pointerId: number,
  startX: number,
  startY: number,
): CardGestureSession {
  return { pointerId, startX, startY, fired: false, swipeIntent: false, scrollCancelled: false };
}

export type PlayReleaseAction = "tap" | "swipe-up" | "swipe-flick" | "cancel" | "none";

/** Classify pointer move during play — marks intent only; does not fire play. */
export function classifyPlayPointerMove(
  dx: number,
  dy: number,
): "none" | "scroll-cancel" | "swipe" {
  if (isScrollCancel(dx, dy)) return "scroll-cancel";
  if (isSwipeUpPlay(dx, dy) || Math.hypot(dx, dy) >= CARD_GESTURE.SWIPE_FLICK_PX) {
    return "swipe";
  }
  return "none";
}

/** Resolve play action on pointer release — tap is default unless swipe/cancel. */
export function resolvePlayReleaseAction(
  dx: number,
  dy: number,
  session: Pick<CardGestureSession, "fired" | "swipeIntent" | "scrollCancelled">,
): PlayReleaseAction {
  if (session.fired) return "none";
  if (session.scrollCancelled || isScrollCancel(dx, dy)) return "cancel";
  if (session.swipeIntent || isSwipeUpPlay(dx, dy)) return "swipe-up";
  if (Math.hypot(dx, dy) >= CARD_GESTURE.SWIPE_FLICK_PX) return "swipe-flick";
  return "tap";
}
