/**
 * Capacitor native bridge — optional light haptics for tap / select / confirm.
 * Loaded only in the packaged app; no-op in browser/PWA.
 * Respects existing nbl-feedback prefs via table feedback service (hapticsMode).
 */
(function installCapacitorNativeBridge() {
  const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
  if (!cap?.isNativePlatform?.()) return;

  const haptics = cap.Plugins?.Haptics;
  if (!haptics?.impact) return;

  /** Light impact only — tap, select, confirm (see src/table/feedback/haptics.ts). */
  window.BourreHaptics = {
    impact(style) {
      // Tap, card select, and action confirm use light intensity only.
      if (style !== "light") return;
      try {
        void haptics.impact({ style: "LIGHT" });
      } catch {
        /* never block gameplay */
      }
    },
  };
})();
