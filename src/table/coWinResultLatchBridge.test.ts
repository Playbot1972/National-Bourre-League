import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isCoWinResultLatched,
  resetCoWinResultLatchBridge,
  setCoWinResultLatched,
} from "./coWinResultLatchBridge";

describe("coWinResultLatchBridge", () => {
  it("tracks tie latch independently for app.js next-hand gating", () => {
    resetCoWinResultLatchBridge();
    assert.equal(isCoWinResultLatched(), false);
    setCoWinResultLatched(true);
    assert.equal(isCoWinResultLatched(), true);
    resetCoWinResultLatchBridge();
    assert.equal(isCoWinResultLatched(), false);
  });
});
