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
    /* native bridge optional */
  }
  return false;
}

const PATTERNS: Record<HapticIntensity, number | number[]> = {
  light: 12,
  medium: [18, 40, 28],
  strong: [30, 50, 40, 50, 60],
};

export function triggerHaptic(intensity: HapticIntensity): boolean {
  if (nativeBridge(intensity)) return true;
  if (!canVibrate()) return false;
  try {
    return navigator.vibrate(PATTERNS[intensity]) ?? false;
  } catch {
    return false;
  }
}

export function hapticsSupported(): boolean {
  return canVibrate() || Boolean(typeof window !== "undefined" && window.BourreHaptics);
}
