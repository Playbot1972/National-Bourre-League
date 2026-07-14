import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { antePresentationDurationMs } from "../handPresentationTiming";
import { ANTE_CHIP_TRAVEL_MS } from "../handPresentationTiming";
import { anteCoinStaggerMs, BOT_PLAY_STAGGER_MS } from "../trickTiming";
import { anteCoinTravelMs } from "./anteCoinPresentationMotion";

describe("anteCoinPresentationMotion timing", () => {
  it("staggers coins using bot play delay source", () => {
    assert.equal(anteCoinStaggerMs(false), BOT_PLAY_STAGGER_MS);
    assert.ok(anteCoinStaggerMs(true) < BOT_PLAY_STAGGER_MS);
  });

  it("scales total duration with participant count", () => {
    const two = antePresentationDurationMs(2, false);
    const four = antePresentationDurationMs(4, false);
    assert.ok(four > two);
    assert.ok(two >= anteCoinTravelMs(false));
  });

  it("uses ante chip travel for coin flight duration", () => {
    assert.equal(anteCoinTravelMs(false), ANTE_CHIP_TRAVEL_MS);
  });

  it("shortens under reduced motion", () => {
    assert.ok(antePresentationDurationMs(4, true) < antePresentationDurationMs(4, false));
  });
});
