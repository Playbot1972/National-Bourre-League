import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatInactivityHelperText,
  INACTIVITY_HELPER_DELAY_MS,
  INACTIVITY_HELPER_FLASH_MS,
} from "./hooks/useInactivityHelper";

describe("formatInactivityHelperText", () => {
  it("returns draw and play guidance copy", () => {
    assert.equal(formatInactivityHelperText("draw"), "Choose discard and then tap");
    assert.equal(formatInactivityHelperText("play"), "Tap a card to play");
    assert.equal(formatInactivityHelperText("reveal"), null);
  });
});

describe("inactivity helper timing", () => {
  it("uses a 5 second idle delay and ~1 second flash cadence", () => {
    assert.equal(INACTIVITY_HELPER_DELAY_MS, 5_000);
    assert.equal(INACTIVITY_HELPER_FLASH_MS, 1_000);
  });
});
