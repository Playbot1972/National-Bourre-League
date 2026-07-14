import gsap from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";

let pluginsRegistered = false;

/** Register GSAP plugins once before any motionPath tween runs. */
export function ensureGsapPlugins(): void {
  if (pluginsRegistered) return;
  if (typeof gsap.registerPlugin === "function") {
    gsap.registerPlugin(MotionPathPlugin);
  }
  pluginsRegistered = true;
}

export { gsap };

/** @internal test helper */
export function _resetGsapPluginsForTests(): void {
  pluginsRegistered = false;
}
