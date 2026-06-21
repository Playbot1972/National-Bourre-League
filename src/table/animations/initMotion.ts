import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

let initialized = false;

/** Register GSAP plugins once and flag the table for motion overrides. */
export function initCardMotion(root?: ParentNode | null): void {
  if (typeof window === "undefined") return;
  if (!initialized) {
    gsap.registerPlugin(MotionPathPlugin);
    initialized = true;
  }
  const scope =
    (root instanceof HTMLElement ? root : null) ??
    document.querySelector(".btable-wrap") ??
    document.querySelector(".btable-session");
  scope?.setAttribute("data-gsap-motion", "true");
}

export function isCardMotionReady(): boolean {
  return initialized;
}
