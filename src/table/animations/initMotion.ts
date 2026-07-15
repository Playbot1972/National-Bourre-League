import gsap from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";

let initialized = false;
let pluginsRegistered = false;

/** Register GSAP plugins once before any motionPath tween (table-session bundle). */
export function ensureGsapMotionPlugins(): void {
  if (typeof window === "undefined" || pluginsRegistered) return;
  gsap.registerPlugin(MotionPathPlugin);
  pluginsRegistered = true;
}

export function isMotionPathAvailable(): boolean {
  ensureGsapMotionPlugins();
  const plugins = (gsap as unknown as { plugins?: Record<string, unknown> }).plugins;
  return Boolean(plugins?.motionPath);
}

export function initCardMotion(root?: ParentNode | null): void {
  if (typeof window === "undefined") return;
  ensureGsapMotionPlugins();
  initialized = true;
  const scope =
    (root instanceof HTMLElement ? root : null) ??
    document.querySelector(".btable-wrap") ??
    document.querySelector(".btable-session");
  scope?.setAttribute("data-gsap-motion", "true");
}

export function isCardMotionReady(): boolean {
  return initialized;
}
