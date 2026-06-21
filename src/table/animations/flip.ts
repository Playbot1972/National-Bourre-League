/** FLIP helpers — First, Last, Invert, Play (layout-safe motion). */

export interface MotionRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function rectFromElement(el: Element): MotionRect {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

export function rectCenter(rect: MotionRect): { x: number; y: number } {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

/** Delta from `from` center to `to` center (invert offset for FLIP play). */
export function flipDelta(from: MotionRect, to: MotionRect): { x: number; y: number } {
  const a = rectCenter(from);
  const b = rectCenter(to);
  return { x: a.x - b.x, y: a.y - b.y };
}

/** Invert offset when element already sits at `last` and should appear at `first`. */
export function invertFromFirst(last: MotionRect, first: MotionRect): { x: number; y: number } {
  const d = flipDelta(first, last);
  return { x: d.x, y: d.y };
}
