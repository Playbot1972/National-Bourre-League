import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  shouldStartPlayNowModeBanner,
} from "./usePlayNowModeBannerIntro.ts";

describe("usePlayNowModeBannerIntro", () => {
  it("starts only on hand 1 when cards are dealt", () => {
    assert.equal(
      shouldStartPlayNowModeBanner({
        playNowModeLabel: "Mixed table",
        watchOnly: false,
        handNumber: 1,
        phase: "reveal",
        currentPhase: "pending",
      }),
      true,
    );
    assert.equal(
      shouldStartPlayNowModeBanner({
        playNowModeLabel: "Bots only table",
        watchOnly: false,
        handNumber: 2,
        phase: "reveal",
        currentPhase: "pending",
      }),
      false,
    );
    assert.equal(
      shouldStartPlayNowModeBanner({
        playNowModeLabel: "Mixed table",
        watchOnly: false,
        handNumber: 1,
        phase: "waiting",
        currentPhase: "pending",
      }),
      false,
    );
  });

  it("does not restart after intro has begun or finished", () => {
    assert.equal(
      shouldStartPlayNowModeBanner({
        playNowModeLabel: "Mixed table",
        watchOnly: false,
        handNumber: 1,
        phase: "play",
        currentPhase: "flashing",
      }),
      false,
    );
    assert.equal(
      shouldStartPlayNowModeBanner({
        playNowModeLabel: "Mixed table",
        watchOnly: false,
        handNumber: 1,
        phase: "play",
        currentPhase: "done",
      }),
      false,
    );
  });

  it("skips watch-only and missing labels", () => {
    assert.equal(
      shouldStartPlayNowModeBanner({
        playNowModeLabel: undefined,
        watchOnly: false,
        handNumber: 1,
        phase: "reveal",
        currentPhase: "pending",
      }),
      false,
    );
    assert.equal(
      shouldStartPlayNowModeBanner({
        playNowModeLabel: "Mixed table",
        watchOnly: true,
        handNumber: 1,
        phase: "reveal",
        currentPhase: "pending",
      }),
      false,
    );
  });
});
