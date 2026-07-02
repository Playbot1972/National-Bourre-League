import { gsap } from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin.js";

let initialized = false;
let pluginsRegistered = false;

/** Register GSAP plugins required by table motion (arc flies, deal paths). Idempotent. */
export function registerGsapMotionPlugins(): void {
  if (pluginsRegistered) return;
  gsap.registerPlugin(MotionPathPlugin);
  pluginsRegistered = true;
}

export function isMotionPathPluginRegistered(): boolean {
  return pluginsRegistered;
}

export function initCardMotion(root?: ParentNode | null): void {
  if (typeof window === "undefined") return;
  registerGsapMotionPlugins();
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
