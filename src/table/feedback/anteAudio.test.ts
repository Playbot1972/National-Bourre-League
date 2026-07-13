import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  _resetAnteAudioForTests,
  anteAudioDedupeKey,
  scheduleAnteChipSounds,
} from "./anteAudio";
import { resolveSoundAsset } from "./soundPacks";

describe("ante audio", () => {
  it("anteChip resolves to coin-chime-light", () => {
    assert.equal(resolveSoundAsset("classic", "anteChip"), "coin-chime-light");
  });

  it("schedules one play callback per player", () => {
    _resetAnteAudioForTests();
    const calls: number[] = [];
    const scheduled = scheduleAnteChipSounds(3, 4, (i) => calls.push(i), { staggerMs: 0 });
    assert.equal(scheduled, true);
    assert.deepEqual(calls, [0, 1, 2, 3]);
  });

  it("dedupes ante sequence for the same hand", () => {
    _resetAnteAudioForTests();
    let calls = 0;
    const play = () => {
      calls += 1;
    };
    assert.equal(scheduleAnteChipSounds(7, 2, play, { staggerMs: 0 }), true);
    assert.equal(scheduleAnteChipSounds(7, 2, play, { staggerMs: 0 }), false);
    assert.equal(calls, 2);
  });

  it("uses distinct dedupe keys per hand", () => {
    assert.notEqual(anteAudioDedupeKey(1), anteAudioDedupeKey(2));
  });
});
