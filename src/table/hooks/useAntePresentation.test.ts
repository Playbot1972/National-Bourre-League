import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldRunAntePresentation } from "./useAntePresentation";
import { antePresentationDedupeKey } from "../animations/antePresentationMotion";

describe("useAntePresentation", () => {
  it("runs only during ante phase with positive ante", () => {
    assert.equal(shouldRunAntePresentation("ante", true, 5), true);
    assert.equal(shouldRunAntePresentation("trumpReveal", true, 5), false);
    assert.equal(shouldRunAntePresentation("ante", false, 5), false);
    assert.equal(shouldRunAntePresentation("ante", true, 0), false);
  });
});

describe("antePresentationDedupeKey", () => {
  it("includes session, hand, players, and ante amount", () => {
    const key = antePresentationDedupeKey("sess_a", 3, ["p1", "bot_b"], 5);
    assert.equal(key, "sess_a:3:p1,bot_b:5");
    assert.notEqual(
      antePresentationDedupeKey("sess_a", 3, ["p1", "bot_b"], 5),
      antePresentationDedupeKey("sess_a", 4, ["p1", "bot_b"], 5),
    );
  });
});
