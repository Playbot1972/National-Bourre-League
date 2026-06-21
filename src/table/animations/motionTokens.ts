/** Shared motion design tokens — GSAP + CSS fallbacks. */

export const PREMIUM_EASE = "power3.out";
export const PREMIUM_EASE_IN_OUT = "power2.inOut";
export const PREMIUM_EASE_BOUNCE = "back.out(1.35)";

export const GSAP_DURATIONS = {
  deal: 0.62,
  dealStagger: 0.11,
  playToTable: 0.58,
  drawDiscard: 0.56,
  drawReceive: 0.6,
  drawReceiveStagger: 0.085,
  trumpReveal: 0.64,
  trumpMerge: 0.62,
  standPat: 0.68,
  foldOut: 0.56,
  hoverLift: 0.38,
} as const;

export function motionScale(reducedMotion = prefersReducedMotion()): number {
  return reducedMotion ? 0.35 : 1;
}

export function scaledDuration(
  seconds: number,
  reducedMotion = prefersReducedMotion(),
): number {
  return Math.max(0.12, seconds * motionScale(reducedMotion));
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
