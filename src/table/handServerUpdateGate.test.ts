import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildHandPresentationKey,
  hasValidHandNumber,
  hasValidSessionId,
  resolveHandPresentationKey,
} from "./handServerUpdateGate";

describe("handServerUpdateGate", () => {
  it("validates hand identity explicitly", () => {
    assert.equal(hasValidSessionId("s1"), true);
    assert.equal(hasValidSessionId(""), false);
    assert.equal(hasValidHandNumber(3), true);
    assert.equal(hasValidHandNumber(NaN), false);
    assert.equal(hasValidHandNumber(undefined), false);
  });

  it("builds presentation key only for valid session + hand", () => {
    assert.equal(resolveHandPresentationKey("s1", 4), "s1-hand-4");
    assert.equal(resolveHandPresentationKey("", 4), null);
    assert.equal(resolveHandPresentationKey("s1", NaN), null);
    assert.equal(buildHandPresentationKey("s1", 1), "s1-hand-1");
  });
});
