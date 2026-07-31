export type Screen = "home" | "rules" | "tutorial" | "room";

const VALID_SCREENS = new Set<Screen>(["home", "rules", "tutorial", "room"]);

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
