/**
 * Table feedback audio — Howler WAV assets at /sounds/ only.
 * Migrated cues do not use procedural synthesis; failures log loudly.
 */

import { AudioManager } from "../../audio/AudioManager";
import { getFeedbackPrefs } from "./prefs";
import {
  isBatch1WavAsset,
  resolveSoundAsset,
  soundAssetUrl,
  type SoundAssetId,
  type SoundEventKey,
  type SoundPackId,
  type SoundResolveContext,
} from "./soundPacks";

let userGestureUnlocked = false;

function getActivePackId(): SoundPackId {
  return getFeedbackPrefs().soundPackId;
}

function audioTrace(
  phase: string,
  event: SoundEventKey,
  detail: Record<string, unknown>,
): void {
  console.log("[nbl-audio]", phase, { event, ...detail });
}

function audioFail(
  event: SoundEventKey,
  reason: string,
  detail: Record<string, unknown> = {},
): void {
  console.error("[nbl-audio] FAIL", { event, reason, fallback: false, ...detail });
}

export async function unlockAudio(): Promise<void> {
  userGestureUnlocked = true;
  AudioManager.get().unlock();
  audioTrace("unlock", "shuffle", { unlocked: true });
}

export async function preloadSoundAssets(packId?: SoundPackId): Promise<void> {
  if (!userGestureUnlocked) return;
  AudioManager.get().unlock();
  const pack = packId ?? getActivePackId();
  audioTrace("preload", "shuffle", { packId: pack });
}

const playingFlags: Record<SoundEventKey, { current: boolean }> = {
  shuffle: { current: false },
  shuffleFinal: { current: false },
  draw: { current: false },
  cardPlace: { current: false },
  leadChange: { current: false },
  trickWin: { current: false },
  trickCollect: { current: false },
  handWin: { current: false },
  potWin: { current: false },
  bigWin: { current: false },
  bourre: { current: false },
  gameStart: { current: false },
  openRoom: { current: false },
  deleteRoom: { current: false },
  fold: { current: false },
  cardSelect: { current: false },
  cardIllegal: { current: false },
  uiButton: { current: false },
};

const RESET_MS: Record<SoundEventKey, number> = {
  shuffle: 360,
  shuffleFinal: 360,
  draw: 280,
  cardPlace: 120,
  leadChange: 180,
  trickWin: 320,
  trickCollect: 280,
  handWin: 280,
  potWin: 580,
  bigWin: 580,
  bourre: 520,
  gameStart: 320,
  openRoom: 360,
  deleteRoom: 280,
  fold: 280,
  cardSelect: 200,
  cardIllegal: 280,
  uiButton: 200,
};

const VOLUME: Record<SoundEventKey, number> = {
  shuffle: 0.55,
  shuffleFinal: 0.55,
  draw: 0.45,
  cardPlace: 0.38,
  leadChange: 0.42,
  trickWin: 0.55,
  trickCollect: 0.4,
  handWin: 0.4,
  potWin: 0.6,
  bigWin: 0.6,
  bourre: 0.5,
  gameStart: 0.42,
  openRoom: 0.55,
  deleteRoom: 0.5,
  fold: 0.42,
  cardSelect: 0.45,
  cardIllegal: 0.5,
  uiButton: 0.4,
};

function playResolvedAsset(
  event: SoundEventKey,
  assetId: SoundAssetId,
  volume: number,
  packId: SoundPackId,
): boolean {
  const path = soundAssetUrl(packId, assetId);
  const batch1 = isBatch1WavAsset(assetId);
  audioTrace("request", event, {
    key: assetId,
    resolvedUrl: path,
    fallback: false,
    batch1,
    volume,
    packId,
    unlocked: userGestureUnlocked,
  });

  if (!userGestureUnlocked) {
    audioFail(event, "audio-not-unlocked", { key: assetId, resolvedUrl: path, batch1 });
    return false;
  }

  if (batch1 && path !== `/sounds/${assetId}.wav`) {
    audioFail(event, "batch1-url-mismatch", { key: assetId, resolvedUrl: path });
    return false;
  }

  const played = AudioManager.get().play(assetId, { volume, event, path });
  if (!played) {
    audioFail(event, "howler-play-failed", { key: assetId, resolvedUrl: path, batch1 });
  }
  return played;
}

async function playSoundEvent(event: SoundEventKey, ctx: SoundResolveContext = {}): Promise<void> {
  const flag = playingFlags[event];
  if (flag.current) return;
  flag.current = true;
  const packId = getActivePackId();
  const assetId = resolveSoundAsset(packId, event, ctx);
  try {
    if (!assetId) {
      audioFail(event, "no-asset-mapping", { packId, ctx });
      return;
    }
    playResolvedAsset(event, assetId, VOLUME[event], packId);
  } catch (err) {
    audioFail(event, "play-threw", { error: String(err) });
  } finally {
    window.setTimeout(() => {
      flag.current = false;
    }, RESET_MS[event]);
  }
}

export function playShuffleSound(): void {
  void playSoundEvent("shuffle");
}

export function playDrawSound(): void {
  void playSoundEvent("draw");
}

export function playCardPlaceSound(intensityTier = 0): void {
  void playCardAudioEvent("cardPlace", { intensityTier });
}

export function playLeadChangeSound(intensityTier = 0): void {
  void playCardAudioEvent("leadChange", { intensityTier });
}

export function playTrickCollectSound(): void {
  void playSoundEvent("trickCollect");
}

export function playTrickWinSound(volumeScale = 1): void {
  void playTrickWinEvent(volumeScale);
}

async function playCardAudioEvent(
  event: "cardPlace" | "leadChange",
  ctx: SoundResolveContext,
): Promise<void> {
  const flag = playingFlags[event];
  if (flag.current) return;
  flag.current = true;
  const packId = getActivePackId();
  const assetId = resolveSoundAsset(packId, event, ctx);
  try {
    if (!assetId) {
      audioFail(event, "no-asset-mapping", { packId, ctx });
      return;
    }
    playResolvedAsset(event, assetId, VOLUME[event], packId);
  } catch (err) {
    audioFail(event, "play-threw", { error: String(err) });
  } finally {
    window.setTimeout(() => {
      flag.current = false;
    }, RESET_MS[event]);
  }
}

async function playTrickWinEvent(volumeScale: number): Promise<void> {
  const event: SoundEventKey = "trickWin";
  const flag = playingFlags[event];
  if (flag.current) return;
  flag.current = true;
  const packId = getActivePackId();
  const assetId = resolveSoundAsset(packId, event, { volumeScale });
  try {
    if (!assetId) {
      audioFail(event, "no-asset-mapping", { packId, volumeScale });
      return;
    }
    playResolvedAsset(event, assetId, VOLUME[event] * volumeScale, packId);
  } catch (err) {
    audioFail(event, "play-threw", { error: String(err) });
  } finally {
    window.setTimeout(() => {
      flag.current = false;
    }, RESET_MS[event]);
  }
}

export function playBigWinSound(): void {
  void playSoundEvent("bigWin");
}

export function playBourreSound(): void {
  void playSoundEvent("bourre");
}

export function playGameStartSound(): void {
  void playSoundEvent("gameStart");
}

export function playOpenRoomSound(): void {
  void playSoundEvent("openRoom");
}

export function playDeleteRoomSound(): void {
  void playSoundEvent("deleteRoom");
}

export function playCardSelectSound(): void {
  void playSoundEvent("cardSelect");
}

export function playCardIllegalSound(): void {
  void playSoundEvent("cardIllegal");
}

export function playUiButtonSound(): void {
  void playSoundEvent("uiButton");
}

export function playFoldSound(): void {
  void playSoundEvent("fold");
}

export function audioSupported(): boolean {
  return typeof window !== "undefined";
}

export function isAudioUnlocked(): boolean {
  return userGestureUnlocked;
}

/** No-op — Howler caches sounds in AudioManager. */
export function resetSoundAssetCache(): void {
  /* Howler singleton retains loaded clips */
}
