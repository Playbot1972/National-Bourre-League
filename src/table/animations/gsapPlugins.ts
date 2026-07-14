import gsap from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";

let registered = false;

/** Register GSAP plugins once before any motionPath tween runs. */
export function ensureGsapPlugins(): void {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(MotionPathPlugin);
  registered = true;
}

/** @internal test helper */
export function _resetGsapPluginsForTests(): void {
  registered = false;
}
