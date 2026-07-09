/**
 * Capacitor native bridge — splash hide, haptics, native-only nav guards, startup logs.
 * Loaded in the packaged app; no-op in browser/PWA.
 */
(function installCapacitorNativeBridge() {
  const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
  if (!cap?.isNativePlatform?.()) return;

  console.info("[nbl-native] bridge loading", {
    platform: typeof cap.getPlatform === "function" ? cap.getPlatform() : "unknown",
  });

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

  function hideSplash() {
    const splash = cap.Plugins?.SplashScreen;
    if (!splash?.hide) {
      console.warn("[nbl-native] SplashScreen.hide unavailable");
      return;
    }
    void splash
      .hide({ fadeOutDuration: 200 })
      .then(() => console.info("[nbl-native] splash hidden"))
      .catch((err) => {
        console.warn("[nbl-native] splash hide failed", err?.message ?? String(err));
      });
  }

  window.__nblNative = { hideSplash };

  const firebaseAuthAvailable =
    typeof cap.isPluginAvailable === "function"
      ? cap.isPluginAvailable("FirebaseAuthentication")
      : Boolean(cap.Plugins?.FirebaseAuthentication);
  console.info("[nbl-native]", "plugin-check", {
    FirebaseAuthentication: firebaseAuthAvailable,
  });

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        patchNativeHostingAssumptions();
        console.info("[nbl-native] DOMContentLoaded");
      },
      { once: true },
    );
  } else {
    patchNativeHostingAssumptions();
    console.info("[nbl-native] DOM already ready");
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
