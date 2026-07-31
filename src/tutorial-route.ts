export type Screen = "home" | "rules" | "tutorial" | "room";

const VALID_SCREENS = new Set<Screen>(["home", "rules", "tutorial", "room"]);

export type TutorialEnvTag = "desktop" | "mobile" | "ios" | "standalone";

export function describeTutorialEnv(): TutorialEnvTag {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error legacy iOS PWA
      window.navigator.standalone === true);
  const isMobile =
    isIOS ||
    /Android/i.test(ua) ||
    (typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches);

  if (isStandalone) return "standalone";
  if (isIOS) return "ios";
  if (isMobile) return "mobile";
  return "desktop";
}

export function screenFromLocation(search = typeof window !== "undefined" ? window.location.search : ""): Screen {
  const view = new URLSearchParams(search).get("view");
  if (view && VALID_SCREENS.has(view as Screen)) {
    return view as Screen;
  }
  return "home";
}

export function logTutorialRoute(phase: string, detail: Record<string, unknown> = {}) {
  if (typeof console === "undefined") return;
  console.info(`[tutorial-route] ${phase}`, {
    env: describeTutorialEnv(),
    view: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("view") : null,
    viewport:
      typeof window !== "undefined"
        ? { w: window.innerWidth, h: window.innerHeight }
        : null,
    ...detail,
  });
}

export function logTutorialRender(phase: string, detail: Record<string, unknown> = {}) {
  if (typeof console === "undefined") return;
  console.info(`[tutorial-render] ${phase}`, {
    env: describeTutorialEnv(),
    ...detail,
  });
}
