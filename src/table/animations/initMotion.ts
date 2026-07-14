let initialized = false;

export function initCardMotion(root?: ParentNode | null): void {
  if (typeof window === "undefined") return;
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
