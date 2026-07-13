import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  _resetBourrePrivateAudioForTests,
  bourrePrivateDedupeKey,
  pickBourrePrivatePunishmentAsset,
  tryConsumeBourrePrivatePunishment,
} from "./bourrePrivateAudio";
import { soundAssetUrl } from "./soundPacks";

describe("bourre private punishment audio", () => {
  it("picks fahhh below 0.5 and fahhhh at or above 0.5", () => {
    assert.equal(pickBourrePrivatePunishmentAsset(0), "fahhh");
    assert.equal(pickBourrePrivatePunishmentAsset(0.49), "fahhh");
    assert.equal(pickBourrePrivatePunishmentAsset(0.5), "fahhhh");
    assert.equal(pickBourrePrivatePunishmentAsset(0.99), "fahhhh");
  });

  it("maps punishment assets to /sounds/*.mp3", () => {
    assert.equal(soundAssetUrl("classic", "fahhh"), "/sounds/fahhh.mp3");
    assert.equal(soundAssetUrl("classic", "fahhhh"), "/sounds/fahhhh.mp3");
  });

  it("punishment mp3 files exist in public/sounds", () => {
    for (const file of ["fahhh.mp3", "fahhhh.mp3"]) {
      const path = join(process.cwd(), "public/sounds", file);
      assert.ok(existsSync(path), `missing ${path}`);
    }
  });

  it("dedupes one bourré event per session hand", () => {
    _resetBourrePrivateAudioForTests();
    const key = bourrePrivateDedupeKey("session-a", 3);
    assert.equal(key, "session-a:3:bourre-private");
    assert.deepEqual(tryConsumeBourrePrivatePunishment(key), { ok: true });
    assert.deepEqual(tryConsumeBourrePrivatePunishment(key), {
      ok: false,
      reason: "duplicate",
    });
  });

  it("uses distinct dedupe keys per hand", () => {
    assert.notEqual(
      bourrePrivateDedupeKey("session-a", 1),
      bourrePrivateDedupeKey("session-a", 2),
    );
  });
});
