import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ENABLE_HERO_TURN_REMINDER,
  ENABLE_TURN_LABEL_BANNERS,
} from "./tableUiConfig";

describe("table UI config", () => {
  it("per-player turn label banners stay disabled", () => {
    assert.equal(ENABLE_TURN_LABEL_BANNERS, false);
  });

  it("hero late turn reminder stays enabled", () => {
    assert.equal(ENABLE_HERO_TURN_REMINDER, true);
  });
});
