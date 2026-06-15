/**
 * Haptic feedback — web vibrate + native wrapper bridge.
 *
 * ## Web (PWA / browser)
 * - **Android Chrome:** `navigator.vibrate()` when available.
 * - **iOS Safari:** No web vibration API — haptics are silently skipped (sound still works).
 * - **Desktop:** Usually no vibration; no-op.
 *
 * ## Native wrapper (Capacitor / React Native WebView)
 * Inject before the table bundle loads:
 *
 * ```js
 * window.BourreHaptics = {
 *   impact(style) {
 *     // Capacitor: Haptics.impact({ style: ImpactStyle[style] })
 *     // RN: ReactNativeHapticFeedback.trigger(style)
 *   },
 *   notification(type) {
 *     // Capacitor: Haptics.notification({ type: NotificationType[type] })
 *   },
 * };
 * ```
 *
 * iOS haptics **require** a native wrapper — web-only iPhone/iPad builds get sound
 * but not vibration. See `docs/sounds/README.md` and AGENTS.md § Table feedback.
 *
 * All paths fail gracefully; gameplay is never blocked.
 */

export type HapticIntensity = "light" | "medium" | "strong";

declare global {
  interface Window {
    BourreHaptics?: {
      impact?: (style: "light" | "medium" | "heavy") => void;
      notification?: (type: "success" | "warning" | "error") => void;
    };
  }
}

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function nativeBridge(intensity: HapticIntensity): boolean {
  const bridge = typeof window !== "undefined" ? window.BourreHaptics : undefined;
  if (!bridge) return false;
  try {
    if (bridge.notification && intensity === "strong") {
      bridge.notification("success");
      return true;
    }
    if (bridge.impact) {
      const style = intensity === "light" ? "light" : intensity === "medium" ? "medium" : "heavy";
      bridge.impact(style);
      return true;
    }
  } catch {
    /* native bridge optional — never throw */
  }
  return false;
}

const PATTERNS: Record<HapticIntensity, number | number[]> = {
  light: 12,
  medium: [18, 40, 28],
  strong: [30, 50, 40, 50, 60],
};

/** Fire haptic feedback. Returns false when unsupported; never throws. */
export function triggerHaptic(intensity: HapticIntensity): boolean {
  try {
    if (nativeBridge(intensity)) return true;
    if (!canVibrate()) return false;
    return navigator.vibrate(PATTERNS[intensity]) ?? false;
  } catch {
    return false;
  }
}

export function hapticsSupported(): boolean {
  return canVibrate() || Boolean(typeof window !== "undefined" && window.BourreHaptics);
}

/** True when only a native wrapper can provide haptics (typical iOS Safari). */
export function needsNativeHapticsBridge(): boolean {
  return !canVibrate() && typeof window !== "undefined";
}
