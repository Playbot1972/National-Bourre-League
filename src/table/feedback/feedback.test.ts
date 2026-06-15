import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getFeedbackPrefs, shouldUseHaptics } from "./prefs";

describe("feedback prefs", () => {
  it("defaults to sound on and haptics on", () => {
    const prefs = getFeedbackPrefs();
    assert.equal(prefs.soundEnabled, true);
    assert.equal(prefs.hapticsMode, "on");
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
