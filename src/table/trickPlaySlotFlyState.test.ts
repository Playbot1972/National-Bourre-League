import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  trickSlotAwaitingFly,
  trickSlotHeroHandoffClass,
} from "./trickPlaySlotFlyState";

describe("trickPlaySlotFlyState", () => {
  it("keeps hero hidden during pending priming with fly vars applied", () => {
    assert.equal(
      trickSlotAwaitingFly({ isLivePhase: true, hasLanded: false, flyMode: "pending" }),
      true,
    );
    assert.equal(
      trickSlotHeroHandoffClass({ isLocalHeroPlay: true, flyMode: "pending" }),
      false,
    );
  });

  it("shows hero travel and handoff only after travel mode begins", () => {
    assert.equal(
      trickSlotAwaitingFly({ isLivePhase: true, hasLanded: false, flyMode: "travel" }),
      false,
    );
    assert.equal(
      trickSlotHeroHandoffClass({ isLocalHeroPlay: true, flyMode: "travel" }),
      true,
    );
  });

  it("does not apply hero handoff class to opponents", () => {
    assert.equal(
      trickSlotHeroHandoffClass({ isLocalHeroPlay: false, flyMode: "travel" }),
      false,
    );
  });
});
