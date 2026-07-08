/**
 * Capacitor native bridge — optional light haptics + native-only nav guards.
 * Loaded in the packaged app; no-op in browser/PWA.
 */
(function installCapacitorNativeBridge() {
  const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
  if (!cap?.isNativePlatform?.()) return;

  function patchNativeHostingAssumptions() {
    for (const anchor of document.querySelectorAll('a[href="/"]')) {
      // Hosting uses "/" for the React tutorial; native webDir is dist/social root.
      anchor.hidden = true;
      anchor.setAttribute("aria-hidden", "true");
      anchor.tabIndex = -1;
    }

    const passwordHint = document.getElementById("password-manager-hint");
    if (passwordHint) passwordHint.hidden = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchNativeHostingAssumptions, { once: true });
  } else {
    patchNativeHostingAssumptions();
  }

  const haptics = cap.Plugins?.Haptics;
  if (!haptics?.impact) return;

  /** Light impact only — tap, select, confirm (see src/table/feedback/haptics.ts). */
  window.BourreHaptics = {
    impact(style) {
      if (style !== "light") return;
      try {
        void haptics.impact({ style: "LIGHT" });
      } catch {
        /* never block gameplay */
      }
    },
  };
})();
