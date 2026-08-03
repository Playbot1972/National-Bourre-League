export type Screen = "home" | "rules" | "tutorial" | "room";

const VALID_SCREENS = new Set<Screen>(["home", "rules", "tutorial", "room"]);

export type TutorialEnvTag = "desktop" | "mobile" | "ios" | "standalone";

export function describeTutorialEnv(): TutorialEnvTag {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
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

export function screenFromLocation(
  search = typeof window !== "undefined" ? window.location.search : "",
): Screen {
  const view = new URLSearchParams(search).get("view");
  if (view && VALID_SCREENS.has(view as Screen)) {
    return view as Screen;
  }
  return "home";
}

/** Nav highlight follows the URL view param when it names a non-home screen. */
export function resolveActiveNavScreen(
  screen: Screen,
  search = typeof window !== "undefined" ? window.location.search : "",
): Screen {
  const fromUrl = screenFromLocation(search);
  if (fromUrl !== "home") return fromUrl;
  return screen;
}

export function writeScreenToLocation(
  screen: Screen,
  { replace = false }: { replace?: boolean } = {},
): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  if (screen === "home") {
    params.delete("view");
  } else {
    params.set("view", screen);
  }

  const qs = params.toString();
  const next = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
  const current = `${window.location.pathname}${window.location.search}`;

  if (next === current) return;

  if (replace) {
    window.history.replaceState(null, "", next);
  } else {
    window.history.pushState(null, "", next);
  }
}

export function logTutorialRoute(phase: string, detail: Record<string, unknown> = {}) {
  if (typeof console === "undefined") return;
  console.info(`[tutorial-route] ${phase}`, {
    env: describeTutorialEnv(),
    view:
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("view")
        : null,
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
