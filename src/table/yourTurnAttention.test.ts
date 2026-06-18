import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { YOUR_TURN_ATTENTION_MS } from "./hooks/useYourTurnAttention";

describe("your turn attention", () => {
  it("uses a 15 second inactivity delay", () => {
    assert.equal(YOUR_TURN_ATTENTION_MS, 15_000);
  });
});
