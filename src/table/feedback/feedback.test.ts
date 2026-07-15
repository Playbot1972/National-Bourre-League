import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getFeedbackPrefs, shouldPlaySoundEvent, shouldUseHaptics } from "./prefs";
import { normalizeCardPackId } from "../theme/cardPacks";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  normalizeSoundPackId,
  BATCH1_WAV_ASSET_IDS,
  BATCH1_WAV_URLS,
  resolveDrawCountAsset,
  resolveSoundAsset,
  soundAssetUrl,
  drawCountAssetUrl,
  DEFAULT_SOUND_PACK_ID,
  isBatch1WavAsset,
  SOUND_ASSET_FILES,
  SOUND_EVENT_TO_ASSET,
} from "./soundPacks";
import { loadTableSettings, DEFAULT_TABLE_SETTINGS } from "../theme/settings";

describe("feedback prefs", () => {
  it("defaults to sound on and haptics on", () => {
    const prefs = getFeedbackPrefs();
    assert.equal(prefs.soundMode, "on");
    assert.equal(prefs.hapticsMode, "on");
    assert.equal(prefs.soundPackId, "classic");
  });

  it("minimal sound skips ambient cues", () => {
    assert.equal(shouldPlaySoundEvent("minimal", "shuffle"), false);
    assert.equal(shouldPlaySoundEvent("minimal", "draw"), false);
    assert.equal(shouldPlaySoundEvent("minimal", "gameStart"), false);
    assert.equal(shouldPlaySoundEvent("minimal", "trickWin"), true);
    assert.equal(shouldPlaySoundEvent("minimal", "bigWin"), true);
    assert.equal(shouldPlaySoundEvent("minimal", "bourre"), true);
  });

  it("off sound disables all events", () => {
    assert.equal(shouldPlaySoundEvent("off", "trickWin"), false);
    assert.equal(shouldPlaySoundEvent("off", "bourre"), false);
  });

  it("minimal haptics skips light intensity", () => {
    assert.equal(shouldUseHaptics("minimal", "light"), false);
    assert.equal(shouldUseHaptics("minimal", "medium"), true);
  });

  it("off haptics disables all intensities", () => {
    assert.equal(shouldUseHaptics("off", "light"), false);
    assert.equal(shouldUseHaptics("off", "strong"), false);
  });
});

describe("sound pack registry", () => {
  it("normalizes unknown pack to classic", () => {
    assert.equal(normalizeSoundPackId("unknown"), "classic");
    assert.equal(normalizeSoundPackId("wood"), "wood");
    assert.equal(normalizeSoundPackId("arcade"), "arcade");
  });

  it("batch-1 assets resolve to /sounds/* (MP3 where on disk, no /public prefix)", () => {
    for (const id of BATCH1_WAV_ASSET_IDS) {
      assert.equal(isBatch1WavAsset(id), true);
      const url = soundAssetUrl(DEFAULT_SOUND_PACK_ID, id);
      assert.equal(url, BATCH1_WAV_URLS[id]);
      assert.match(url, /^\/sounds\/[\w-]+\.(mp3|wav)$/);
      assert.doesNotMatch(url, /^\/public\//);
    }
    assert.equal(soundAssetUrl("classic", "card-select"), "/sounds/card-select.mp3");
    assert.equal(soundAssetUrl("classic", "draw"), "/sounds/draw.mp3");
    assert.equal(soundAssetUrl("classic", "ui-button-press"), "/sounds/ui-button-press.mp3");
    assert.equal(soundAssetUrl("classic", "card-shuffle-normal"), "/sounds/card-shuffle-normal.mp3");
  });

  it("batch-1 trickWin always resolves to trick-win-normal (trick-win-big deferred)", () => {
    assert.equal(
      resolveSoundAsset("classic", "trickWin", { isLocalPlayer: true, volumeScale: 1.5 }),
      "trick-win-normal",
    );
  });

  it("batch-1 cardPlace tier 1 aliases to card-place-normal (soft deferred)", () => {
    assert.equal(resolveSoundAsset("classic", "cardPlace", { intensityTier: 1 }), "card-place-normal");
    assert.equal(resolveSoundAsset("classic", "cardPlace", { intensityTier: 2 }), "card-place-heavy");
  });

  it("draw count 1–5 resolves to /sounds/drawN.mp3", () => {
    for (let n = 1; n <= 5; n++) {
      assert.equal(resolveDrawCountAsset(n), `draw${n}`);
      assert.equal(drawCountAssetUrl(n), `/sounds/draw${n}.mp3`);
    }
  });

  it("draw count outside 1–5 falls back to generic draw.mp3", () => {
    assert.equal(resolveDrawCountAsset(0), "draw");
    assert.equal(resolveDrawCountAsset(6), "draw");
    assert.equal(drawCountAssetUrl(0), "/sounds/draw.mp3");
  });

  it("draw count mp3 files exist in public/sounds", () => {
    for (let n = 1; n <= 5; n++) {
      const file = join(process.cwd(), "public/sounds", `draw${n}.mp3`);
      assert.ok(existsSync(file), `missing ${file}`);
    }
  });

  it("registry asset files exist in public/sounds", () => {
    for (const id of BATCH1_WAV_ASSET_IDS) {
      const file = join(process.cwd(), "public/sounds", SOUND_ASSET_FILES[id]);
      assert.ok(existsSync(file), `missing ${file}`);
    }
  });

  it("deleteRoom maps to close.mp3", () => {
    assert.equal(SOUND_EVENT_TO_ASSET.deleteRoom, "close");
    assert.equal(resolveSoundAsset("classic", "deleteRoom"), "close");
    assert.equal(soundAssetUrl("classic", "close"), "/sounds/close.mp3");
    const file = join(process.cwd(), "public/sounds", "close.mp3");
    assert.ok(existsSync(file), `missing ${file}`);
  });

  it("botHandWin maps to moneygone.mp3", () => {
    assert.equal(SOUND_EVENT_TO_ASSET.botHandWin, "moneygone");
    assert.equal(resolveSoundAsset("classic", "botHandWin"), "moneygone");
    assert.equal(soundAssetUrl("classic", "moneygone"), "/sounds/moneygone.mp3");
    const file = join(process.cwd(), "public/sounds", "moneygone.mp3");
    assert.ok(existsSync(file), `missing ${file}`);
  });

  it("human bigWin still maps to hand-win-stinger.mp3", () => {
    assert.equal(SOUND_EVENT_TO_ASSET.bigWin, "hand-win-stinger");
    assert.equal(resolveSoundAsset("classic", "bigWin"), "hand-win-stinger");
  });

  it("turnTimer maps to timer.mp3", () => {
    assert.equal(SOUND_EVENT_TO_ASSET.turnTimer, "timer");
    assert.equal(resolveSoundAsset("classic", "turnTimer"), "timer");
    const file = join(process.cwd(), "public/sounds", "timer.mp3");
    assert.ok(existsSync(file), `missing ${file}`);
  });
});

describe("card pack registry", () => {
  it("normalizes unknown pack to classic", () => {
    assert.equal(normalizeCardPackId("unknown"), "classic");
    assert.equal(normalizeCardPackId("elegant"), "elegant");
    assert.equal(normalizeCardPackId("casino"), "casino");
    assert.equal(normalizeCardPackId("midnight"), "midnight");
  });
});

describe("table settings", () => {
  it("defaults card pack to classic", () => {
    assert.equal(DEFAULT_TABLE_SETTINGS.cardPackId, "classic");
    const loaded = loadTableSettings();
    assert.equal(loaded.cardPackId, "classic");
  });
});

describe("haptics graceful fallback", () => {
  it("triggerHaptic does not throw without navigator.vibrate", async () => {
    const { triggerHaptic } = await import("./haptics");
    const original = globalThis.navigator;
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      configurable: true,
    });
    try {
      assert.equal(triggerHaptic("light"), false);
      assert.equal(triggerHaptic("medium"), false);
      assert.equal(triggerHaptic("strong"), false);
    } finally {
      Object.defineProperty(globalThis, "navigator", {
        value: original,
        configurable: true,
      });
    }
  });
});
