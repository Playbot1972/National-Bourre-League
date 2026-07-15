import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  BOT_PLAY_DELAY_MAX_MS,
  BOT_PLAY_DELAY_MIN_MS,
  clearAntePlanCacheForTests,
} from "../../session/botActionTiming";
import { antePresentationDurationMs } from "../handPresentationTiming";
import { anteCoinTravelMs } from "./anteCoinPresentationMotion";

describe("anteCoinPresentationMotion timing", () => {
  beforeEach(() => {
    clearAntePlanCacheForTests();
  });

  it("uses bot play think policy per seat instead of fixed stagger", () => {
    const playerIds = ["bot_1", "bot_2", "bot_3"];
    const duration = antePresentationDurationMs(7, playerIds, false);
    const minThink = playerIds.length * BOT_PLAY_DELAY_MIN_MS;
    const maxThink = playerIds.length * BOT_PLAY_DELAY_MAX_MS;
    assert.ok(duration >= minThink + playerIds.length * anteCoinTravelMs(false));
    assert.ok(duration <= maxThink + playerIds.length * anteCoinTravelMs(false) + 100);
  });

  it("scales total duration with participant count", () => {
    const two = antePresentationDurationMs(1, ["a", "b"], false);
    const four = antePresentationDurationMs(1, ["a", "b", "c", "d"], false);
    assert.ok(four > two);
    assert.ok(two >= anteCoinTravelMs(false));
  });

  it("shortens under reduced motion", () => {
    const playerIds = ["a", "b", "c", "d"];
    assert.ok(
      antePresentationDurationMs(4, playerIds, true) <
        antePresentationDurationMs(4, playerIds, false),
    );
  });
});
