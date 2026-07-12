import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getFeedbackPrefs, shouldPlaySoundEvent, shouldUseHaptics } from "./prefs";
import { normalizeCardPackId } from "../theme/cardPacks";
import { normalizeSoundPackId } from "./soundPacks";
import { loadTableSettings, DEFAULT_TABLE_SETTINGS } from "../theme/settings";

describe("feedback prefs", () => {
  it("defaults to sound on and haptics on", () => {
    const prefs = getFeedbackPrefs();
    assert.equal(prefs.soundMode, "on");
    assert.equal(prefs.hapticsMode, "on");
    assert.equal(prefs.soundPackId, "classic");
  });

  it("minimal sound skips ambient cues", () => {
    assert.equal(shouldPlaySoundEvent("minimal", "shuffle"), false);
    assert.equal(shouldPlaySoundEvent("minimal", "draw"), false);
    assert.equal(shouldPlaySoundEvent("minimal", "gameStart"), false);
    assert.equal(shouldPlaySoundEvent("minimal", "trickWin"), true);
    assert.equal(shouldPlaySoundEvent("minimal", "bigWin"), true);
    assert.equal(shouldPlaySoundEvent("minimal", "bourre"), true);
  });

  it("off sound disables all events", () => {
    assert.equal(shouldPlaySoundEvent("off", "trickWin"), false);
    assert.equal(shouldPlaySoundEvent("off", "bourre"), false);
  });

  it("minimal haptics skips light intensity", () => {
    assert.equal(shouldUseHaptics("minimal", "light"), false);
    assert.equal(shouldUseHaptics("minimal", "medium"), true);
  });

  it("off haptics disables all intensities", () => {
    assert.equal(shouldUseHaptics("off", "light"), false);
    assert.equal(shouldUseHaptics("off", "strong"), false);
  });
});

describe("sound pack registry", () => {
  it("normalizes unknown pack to classic", () => {
    assert.equal(normalizeSoundPackId("unknown"), "classic");
    assert.equal(normalizeSoundPackId("wood"), "wood");
    assert.equal(normalizeSoundPackId("arcade"), "arcade");
  });
});

describe("card pack registry", () => {
  it("normalizes unknown pack to classic", () => {
    assert.equal(normalizeCardPackId("unknown"), "classic");
    assert.equal(normalizeCardPackId("elegant"), "elegant");
    assert.equal(normalizeCardPackId("casino"), "casino");
    assert.equal(normalizeCardPackId("midnight"), "midnight");
  });
});

describe("table settings", () => {
  it("defaults card pack to classic", () => {
    assert.equal(DEFAULT_TABLE_SETTINGS.cardPackId, "classic");
    const loaded = loadTableSettings();
    assert.equal(loaded.cardPackId, "classic");
  });
});

describe("haptics graceful fallback", () => {
  it("triggerHaptic does not throw without navigator.vibrate", async () => {
    const { triggerHaptic } = await import("./haptics");
    const original = globalThis.navigator;
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      configurable: true,
    });
    try {
      assert.equal(triggerHaptic("light"), false);
      assert.equal(triggerHaptic("medium"), false);
      assert.equal(triggerHaptic("strong"), false);
    } finally {
      Object.defineProperty(globalThis, "navigator", {
        value: original,
        configurable: true,
      });
    }
  });
});
