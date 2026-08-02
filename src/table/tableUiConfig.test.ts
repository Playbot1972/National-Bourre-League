import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ENABLE_TURN_TOASTS } from "./tableUiConfig";

describe("table UI config", () => {
  it("turn toasts are disabled (timer is the turn cue)", () => {
    assert.equal(ENABLE_TURN_TOASTS, false);
  });
});
