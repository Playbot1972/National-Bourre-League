/**
 * Live-only Play Now debug preview + population gate tests.
 */
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canShowLiveOnly,
  canShowLiveOnlyProd,
  createLiveOnlyDebugGesture,
  getDebugForceShowLiveOnly,
  setDebugForceShowLiveOnly,
  setPlayNowPopulationMetrics,
} from "../docs/play-now-live-only.js";
import { PLAY_NOW_QUEUE_MODE, normalizePlayNowQueueMode } from "../docs/public-table-schema.js";
import { playNowQueueModeShortLabel } from "../docs/play-now-queue-mode.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexHtml = readFileSync(join(root, "docs/index.html"), "utf8");
const stylesCss = readFileSync(join(root, "docs/styles.css"), "utf8");
const appJs = readFileSync(join(root, "docs/app.js"), "utf8");

describe("Live Only population gate", () => {
  beforeEach(() => {
    setDebugForceShowLiveOnly(false);
    setPlayNowPopulationMetrics({
      onlineRealPlayersLast10min: 0,
      activeHumanOnlyRooms: 0,
    });
  });

  it("hides Live Only when debug is off and population is low", () => {
    assert.equal(getDebugForceShowLiveOnly(), false);
    assert.equal(canShowLiveOnlyProd({ onlineRealPlayersLast10min: 0, activeHumanOnlyRooms: 0 }), false);
    assert.equal(canShowLiveOnly({ onlineRealPlayersLast10min: 0, activeHumanOnlyRooms: 0 }), false);
  });

  it("shows Live Only when debug force flag is true regardless of metrics", () => {
    setDebugForceShowLiveOnly(true);
    assert.equal(canShowLiveOnly({ onlineRealPlayersLast10min: 0, activeHumanOnlyRooms: 0 }), true);
  });

  it("shows Live Only when production thresholds are met", () => {
    assert.equal(
      canShowLiveOnlyProd({ onlineRealPlayersLast10min: 30, activeHumanOnlyRooms: 5 }),
      true,
    );
    assert.equal(
      canShowLiveOnly({ onlineRealPlayersLast10min: 30, activeHumanOnlyRooms: 5 }),
      true,
    );
  });

  it("normalizes live_only queue mode", () => {
    assert.equal(normalizePlayNowQueueMode("live_only"), PLAY_NOW_QUEUE_MODE.LIVE_ONLY);
    assert.equal(playNowQueueModeShortLabel(PLAY_NOW_QUEUE_MODE.LIVE_ONLY), "Live only");
  });
});

describe("Live Only secret debug gesture", () => {
  beforeEach(() => {
    setDebugForceShowLiveOnly(false);
  });

  it("enables debug flag after triple Bourré tap then spade tap", () => {
    let enabled = false;
    const gesture = createLiveOnlyDebugGesture({
      isProduction: false,
      tapWindowMs: 2000,
      onEnabled: () => {
        enabled = true;
      },
    });
    const prevent = { preventDefault() {}, stopPropagation() {} };
    gesture.onBourreTap(prevent);
    gesture.onBourreTap(prevent);
    gesture.onBourreTap(prevent);
    assert.equal(gesture.isTripleTapPending(), true);
    assert.equal(getDebugForceShowLiveOnly(), false);
    gesture.onSpadeTap(prevent);
    assert.equal(getDebugForceShowLiveOnly(), true);
    assert.equal(enabled, true);
    assert.equal(gesture.isTripleTapPending(), false);
  });

  it("does not enable debug flag in production builds", () => {
    const gesture = createLiveOnlyDebugGesture({ isProduction: true });
    const prevent = { preventDefault() {}, stopPropagation() {} };
    gesture.onBourreTap(prevent);
    gesture.onBourreTap(prevent);
    gesture.onBourreTap(prevent);
    gesture.onSpadeTap(prevent);
    assert.equal(getDebugForceShowLiveOnly(), false);
  });

  it("ignores spade tap without prior triple Bourré tap", () => {
    const gesture = createLiveOnlyDebugGesture({ isProduction: false });
    gesture.onSpadeTap({ preventDefault() {}, stopPropagation() {} });
    assert.equal(getDebugForceShowLiveOnly(), false);
  });
});

describe("Live Only UI wiring", () => {
  it("includes hidden live_only option in Play Now selector", () => {
    assert.match(indexHtml, /data-play-now-mode-option="live_only"/);
    assert.match(indexHtml, /value="live_only"/);
    assert.match(indexHtml, /data-brand-bourre/);
    assert.match(indexHtml, /data-brand-spade/);
  });

  it("styles three-column layout when Live Only is visible", () => {
    assert.match(stylesCss, /\.play-now-mode__options--with-live-only/);
    assert.match(stylesCss, /\.play-now-mode__option:has\(input:checked\)::after/);
  });

  it("app syncs Live Only visibility and wires debug gesture", () => {
    assert.match(appJs, /syncPlayNowLiveOnlyVisibility/);
    assert.match(appJs, /initLiveOnlyDebugGesture/);
    assert.match(appJs, /createLiveOnlyDebugGesture/);
    assert.match(appJs, /isProductionBuild\(\)/);
  });
});
