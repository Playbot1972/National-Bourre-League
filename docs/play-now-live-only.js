/**
 * Live-only Play Now visibility gate + secret debug gesture (pure, testable).
 */

import { BUILD_CHANNEL } from "./version.js";

export const LIVE_ONLY_POPULATION_THRESHOLDS = Object.freeze({
  onlineRealPlayersLast10min: 30,
  activeHumanOnlyRooms: 5,
});

/** @type {{ onlineRealPlayersLast10min: number; activeHumanOnlyRooms: number }} */
let populationMetrics = {
  onlineRealPlayersLast10min: 0,
  activeHumanOnlyRooms: 0,
};

let debugForceShowLiveOnly = false;

/** True when hosting build is production — disables secret gesture. */
export function isProductionBuild(channel = BUILD_CHANNEL) {
  return channel === "production";
}

export function getDebugForceShowLiveOnly() {
  return debugForceShowLiveOnly;
}

export function setDebugForceShowLiveOnly(value) {
  debugForceShowLiveOnly = Boolean(value);
}

/** @returns {{ onlineRealPlayersLast10min: number; activeHumanOnlyRooms: number }} */
export function getPlayNowPopulationMetrics() {
  return { ...populationMetrics };
}

/** @param {{ onlineRealPlayersLast10min?: number; activeHumanOnlyRooms?: number }} metrics */
export function setPlayNowPopulationMetrics(metrics) {
  populationMetrics = {
    onlineRealPlayersLast10min: Number(metrics?.onlineRealPlayersLast10min) || 0,
    activeHumanOnlyRooms: Number(metrics?.activeHumanOnlyRooms) || 0,
  };
}

/**
 * Production population gate for Live Only visibility.
 * @param {{ onlineRealPlayersLast10min?: number; activeHumanOnlyRooms?: number }} metrics
 */
export function canShowLiveOnlyProd(metrics) {
  return (
    Number(metrics?.onlineRealPlayersLast10min) >=
      LIVE_ONLY_POPULATION_THRESHOLDS.onlineRealPlayersLast10min &&
    Number(metrics?.activeHumanOnlyRooms) >= LIVE_ONLY_POPULATION_THRESHOLDS.activeHumanOnlyRooms
  );
}

/**
 * Whether Live Only should appear in Play Now mode selector.
 * @param {{ onlineRealPlayersLast10min?: number; activeHumanOnlyRooms?: number }} [metrics]
 * @param {{ debugForce?: boolean }} [opts]
 */
export function canShowLiveOnly(metrics = populationMetrics, { debugForce = debugForceShowLiveOnly } = {}) {
  return Boolean(debugForce) || canShowLiveOnlyProd(metrics);
}

const DEFAULT_TAP_WINDOW_MS = 1500;

/**
 * Secret gesture: triple-tap Bourré, then tap spade (non-production builds only).
 * @param {{ onEnabled?: () => void; isProduction?: boolean; tapWindowMs?: number }} [opts]
 */
export function createLiveOnlyDebugGesture({
  onEnabled,
  isProduction = isProductionBuild(),
  tapWindowMs = DEFAULT_TAP_WINDOW_MS,
} = {}) {
  let bourreTapCount = 0;
  let bourreTripleTapDetected = false;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let bourreTapTimer = null;

  function resetBourreTaps() {
    bourreTapCount = 0;
    bourreTripleTapDetected = false;
    if (bourreTapTimer) {
      clearTimeout(bourreTapTimer);
      bourreTapTimer = null;
    }
  }

  function onBourreTap(event, { navigateHome } = {}) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    bourreTapCount += 1;
    if (bourreTapCount === 3) {
      bourreTripleTapDetected = true;
      bourreTapCount = 0;
      if (bourreTapTimer) {
        clearTimeout(bourreTapTimer);
        bourreTapTimer = null;
      }
      return;
    }
    if (bourreTapTimer) clearTimeout(bourreTapTimer);
    bourreTapTimer = setTimeout(() => {
      if (bourreTapCount === 1 && typeof navigateHome === "function") {
        navigateHome();
      }
      resetBourreTaps();
    }, tapWindowMs);
  }

  function onSpadeTap(event) {
    if (isProduction || !bourreTripleTapDetected) return;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setDebugForceShowLiveOnly(true);
    bourreTripleTapDetected = false;
    onEnabled?.();
  }

  return {
    onBourreTap,
    onSpadeTap,
    resetBourreTaps,
    isTripleTapPending: () => bourreTripleTapDetected,
  };
}
