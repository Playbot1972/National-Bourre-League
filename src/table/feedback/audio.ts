/**
 * Table feedback audio — pack-aware, asset-first with procedural fallback.
 *
 * Assets live under docs/sounds/ (classic WAV set) or docs/sounds/packs/{wood,arcade}/.
 * Procedural synthesis remains the fallback when files are missing.
 */

import { getFeedbackPrefs } from "./prefs";
import {
  allSoundAssetUrls,
  resolveSoundAsset,
  soundAssetUrl,
  type SoundAssetId,
  type SoundEventKey,
  type SoundPackId,
  type SoundResolveContext,
} from "./soundPacks";

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let userGestureUnlocked = false;

const clipCache = new Map<string, HTMLAudioElement>();
const assetAvailability = new Map<string, boolean>();

function getActivePackId(): SoundPackId {
  return getFeedbackPrefs().soundPackId;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctx =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) {
      audioCtx = new Ctx();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.55;
      masterGain.connect(audioCtx.destination);
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export async function unlockAudio(): Promise<void> {
  userGestureUnlocked = true;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      /* requires user gesture on some browsers */
    }
  }
  void preloadSoundAssets();
}

function getClip(src: string): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  try {
    let clip = clipCache.get(src);
    if (!clip) {
      clip = new Audio(src);
      clip.preload = "auto";
      clipCache.set(src, clip);
    }
    return clip;
  } catch {
    return null;
  }
}

async function probeAsset(src: string): Promise<boolean> {
  if (assetAvailability.has(src)) {
    return assetAvailability.get(src) === true;
  }
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch(src, { method: "HEAD" });
    const ok = res.ok;
    assetAvailability.set(src, ok);
    return ok;
  } catch {
    assetAvailability.set(src, false);
    return false;
  }
}

/** Resolve pack override, then fall back to classic assets. */
async function resolvePlayableAssetUrl(
  packId: SoundPackId,
  assetId: SoundAssetId,
): Promise<string | null> {
  const primary = soundAssetUrl(packId, assetId);
  if (await probeAsset(primary)) return primary;
  if (packId !== "classic") {
    const classic = soundAssetUrl("classic", assetId);
    if (await probeAsset(classic)) return classic;
  }
  return null;
}

export async function preloadSoundAssets(packId?: SoundPackId): Promise<void> {
  if (!userGestureUnlocked) return;
  const pack = packId ?? getActivePackId();
  await Promise.all(
    allSoundAssetUrls(pack).map(async (src) => {
      if (!(await probeAsset(src))) return;
      const clip = getClip(src);
      if (!clip) return;
      try {
        clip.load();
      } catch {
        /* optional preload */
      }
    }),
  );
}

async function tryPlayAsset(src: string, volume = 0.55): Promise<boolean> {
  if (!userGestureUnlocked) return false;
  const clip = getClip(src);
  if (!clip) return false;
  try {
    clip.volume = Math.min(1, Math.max(0, volume));
    clip.currentTime = 0;
    const playPromise = clip.play();
    if (playPromise) {
      void playPromise.catch(() => {
        /* autoplay policy — swallow */
      });
    }
    return true;
  } catch {
    return false;
  }
}

async function tryPlayAssetId(
  packId: SoundPackId,
  assetId: SoundAssetId,
  volume = 0.55,
): Promise<boolean> {
  const src = await resolvePlayableAssetUrl(packId, assetId);
  if (!src) return false;
  return tryPlayAsset(src, volume);
}

function scheduleTone(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  start: number,
  duration: number,
  gainPeak: number,
  type: OscillatorType = "sine",
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function scheduleNoiseBurst(
  ctx: AudioContext,
  dest: AudioNode,
  start: number,
  duration: number,
  gainPeak: number,
  centerFreq = 1400,
): void {
  const bufferSize = Math.max(256, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = centerFreq;
  filter.Q.value = 0.6;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainPeak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start(start);
  src.stop(start + duration + 0.01);
}

function playProceduralShuffle(packId: SoundPackId): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  const bursts = packId === "arcade" ? [0, 0.04, 0.08, 0.14] : [0, 0.06, 0.12, 0.2, 0.28];
  const freq = packId === "wood" ? 900 : 1400;
  for (const offset of bursts) {
    scheduleNoiseBurst(ctx, masterGain, t0 + offset, 0.05, 0.08 + Math.random() * 0.04, freq);
  }
}

function playProceduralDraw(packId: SoundPackId): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  scheduleNoiseBurst(ctx, masterGain, t0, 0.04, 0.06, packId === "wood" ? 700 : 1200);
  scheduleTone(ctx, masterGain, packId === "arcade" ? 660 : 520, t0 + 0.05, 0.08, 0.05, "triangle");
}

function playProceduralCardPlace(packId: SoundPackId, intensityTier: number): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  const depth = 1 + intensityTier * 0.06;
  const center = packId === "wood" ? 680 / depth : packId === "arcade" ? 1100 : 900;
  scheduleNoiseBurst(ctx, masterGain, t0, 0.035, 0.05, center);
  scheduleTone(ctx, masterGain, center * 0.55, t0 + 0.01, 0.04, 0.03, "triangle");
}

function playProceduralLeadChange(packId: SoundPackId, intensityTier: number): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  const tierScale = 1 - intensityTier * 0.04;
  if (packId === "arcade") {
    scheduleTone(ctx, masterGain, 880 * tierScale, t0, 0.07, 0.055, "square");
    scheduleTone(ctx, masterGain, 1174.66 * tierScale, t0 + 0.05, 0.1, 0.04, "square");
    return;
  }
  const base = (packId === "wood" ? 620 : 740) * tierScale;
  scheduleTone(ctx, masterGain, base, t0, 0.08, 0.045, "sine");
  scheduleTone(ctx, masterGain, base * 1.335, t0 + 0.05, 0.12, 0.035, "triangle");
}

function playProceduralTrickCollect(packId: SoundPackId): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  scheduleNoiseBurst(ctx, masterGain, t0, 0.08, 0.04, packId === "wood" ? 520 : 760);
  scheduleTone(ctx, masterGain, packId === "arcade" ? 440 : 330, t0 + 0.04, 0.14, 0.035, "sine");
}

function playProceduralTrickWin(packId: SoundPackId, volumeScale = 1): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  const gainScale = Math.min(1.2, volumeScale);
  if (packId === "arcade") {
    scheduleTone(ctx, masterGain, 1046.5, t0, 0.1, 0.1 * gainScale, "square");
    scheduleTone(ctx, masterGain, 1318.51, t0 + 0.08, 0.14, 0.08 * gainScale, "square");
    return;
  }
  const base = packId === "wood" ? 740 : 880;
  scheduleTone(ctx, masterGain, base, t0, 0.12, 0.09 * gainScale, "sine");
  scheduleTone(ctx, masterGain, base * 1.335, t0 + 0.07, 0.16, 0.07 * gainScale, "triangle");
  scheduleTone(ctx, masterGain, base * 2, t0 + 0.14, 0.1, 0.04 * gainScale, "sine");
}

function playProceduralBigWin(packId: SoundPackId): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  if (packId === "arcade") {
    scheduleTone(ctx, masterGain, 523.25, t0, 0.12, 0.09, "square");
    scheduleTone(ctx, masterGain, 659.25, t0 + 0.1, 0.16, 0.1, "square");
    scheduleTone(ctx, masterGain, 783.99, t0 + 0.22, 0.2, 0.1, "square");
    scheduleTone(ctx, masterGain, 1046.5, t0 + 0.34, 0.24, 0.07, "square");
    return;
  }
  const scale = packId === "wood" ? 0.92 : 1;
  scheduleTone(ctx, masterGain, 659.25 * scale, t0, 0.14, 0.08, "sine");
  scheduleTone(ctx, masterGain, 830.61 * scale, t0 + 0.1, 0.18, 0.09, "triangle");
  scheduleTone(ctx, masterGain, 987.77 * scale, t0 + 0.22, 0.22, 0.1, "sine");
  scheduleTone(ctx, masterGain, 1318.51 * scale, t0 + 0.34, 0.28, 0.06, "triangle");
}

function playProceduralBourre(packId: SoundPackId): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  const type: OscillatorType = packId === "arcade" ? "sawtooth" : "triangle";
  scheduleTone(ctx, masterGain, packId === "wood" ? 180 : 220, t0, 0.28, 0.1, type);
  scheduleTone(ctx, masterGain, packId === "wood" ? 140 : 165, t0 + 0.18, 0.32, 0.08, type);
}

function playProceduralGameStart(packId: SoundPackId): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  if (packId === "arcade") {
    scheduleTone(ctx, masterGain, 440, t0, 0.08, 0.07, "square");
    scheduleTone(ctx, masterGain, 554.37, t0 + 0.1, 0.12, 0.08, "square");
    return;
  }
  scheduleTone(ctx, masterGain, packId === "wood" ? 392 : 440, t0, 0.1, 0.07, "sine");
  scheduleTone(ctx, masterGain, packId === "wood" ? 523.25 : 554.37, t0 + 0.12, 0.16, 0.08, "triangle");
}

function playProceduralUiTap(packId: SoundPackId): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  scheduleTone(ctx, masterGain, packId === "arcade" ? 520 : 440, t0, 0.05, 0.04, "triangle");
}

function playProceduralCardSelect(packId: SoundPackId): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  scheduleTone(ctx, masterGain, packId === "wood" ? 560 : 640, t0, 0.06, 0.035, "sine");
}

function playProceduralCardIllegal(packId: SoundPackId): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  scheduleTone(ctx, masterGain, packId === "arcade" ? 180 : 220, t0, 0.1, 0.07, "square");
  scheduleNoiseBurst(ctx, masterGain, t0 + 0.04, 0.06, 0.05, 400);
}

const PROCEDURAL_BY_EVENT: Record<SoundEventKey, (packId: SoundPackId, ctx?: SoundResolveContext) => void> = {
  shuffle: (packId) => playProceduralShuffle(packId),
  shuffleFinal: (packId) => playProceduralShuffle(packId),
  draw: (packId) => playProceduralDraw(packId),
  cardPlace: (packId, ctx) => playProceduralCardPlace(packId, ctx?.intensityTier ?? 0),
  leadChange: (packId, ctx) => playProceduralLeadChange(packId, ctx?.intensityTier ?? 0),
  trickWin: (packId, ctx) => playProceduralTrickWin(packId, ctx?.volumeScale ?? 1),
  trickCollect: (packId) => playProceduralTrickCollect(packId),
  bigWin: (packId) => playProceduralBigWin(packId),
  bourre: (packId) => playProceduralBourre(packId),
  gameStart: (packId) => playProceduralGameStart(packId),
  cardSelect: (packId) => playProceduralCardSelect(packId),
  cardIllegal: (packId) => playProceduralCardIllegal(packId),
  uiButton: (packId) => playProceduralUiTap(packId),
};

const playingFlags: Record<SoundEventKey, { current: boolean }> = {
  shuffle: { current: false },
  shuffleFinal: { current: false },
  draw: { current: false },
  cardPlace: { current: false },
  leadChange: { current: false },
  trickWin: { current: false },
  trickCollect: { current: false },
  bigWin: { current: false },
  bourre: { current: false },
  gameStart: { current: false },
  cardSelect: { current: false },
  cardIllegal: { current: false },
  uiButton: { current: false },
};

const RESET_MS: Record<SoundEventKey, number> = {
  shuffle: 360,
  shuffleFinal: 420,
  draw: 280,
  cardPlace: 120,
  leadChange: 180,
  trickWin: 320,
  trickCollect: 280,
  bigWin: 580,
  bourre: 520,
  gameStart: 320,
  cardSelect: 100,
  cardIllegal: 200,
  uiButton: 120,
};

const VOLUME: Record<SoundEventKey, number> = {
  shuffle: 0.55,
  shuffleFinal: 0.58,
  draw: 0.45,
  cardPlace: 0.38,
  leadChange: 0.42,
  trickWin: 0.55,
  trickCollect: 0.4,
  bigWin: 0.6,
  bourre: 0.5,
  gameStart: 0.42,
  cardSelect: 0.32,
  cardIllegal: 0.4,
  uiButton: 0.36,
};

async function playSoundEvent(
  event: SoundEventKey,
  ctx: SoundResolveContext = {},
): Promise<void> {
  const flag = playingFlags[event];
  if (flag.current) return;
  flag.current = true;
  const packId = getActivePackId();
  const assetId = resolveSoundAsset(packId, event, ctx);
  try {
    let played = false;
    if (assetId) {
      const volume =
        event === "trickWin" ? VOLUME[event] * (ctx.volumeScale ?? 1) : VOLUME[event];
      played = await tryPlayAssetId(packId, assetId, volume);
    }
    if (!played && userGestureUnlocked) {
      PROCEDURAL_BY_EVENT[event](packId, ctx);
    }
  } catch {
    /* never block gameplay */
  } finally {
    window.setTimeout(() => {
      flag.current = false;
    }, RESET_MS[event]);
  }
}

export function playShuffleSound(variant: "normal" | "final" = "normal"): void {
  void playSoundEvent(variant === "final" ? "shuffleFinal" : "shuffle");
}

export function playDrawSound(): void {
  void playSoundEvent("draw");
}

export function playCardPlaceSound(intensityTier = 0): void {
  void playSoundEvent("cardPlace", { intensityTier });
}

export function playLeadChangeSound(intensityTier = 0): void {
  void playSoundEvent("leadChange", { intensityTier });
}

export function playTrickCollectSound(): void {
  void playSoundEvent("trickCollect");
}

export function playTrickWinSound(volumeScale = 1, isLocalPlayer = false): void {
  void playSoundEvent("trickWin", { volumeScale, isLocalPlayer });
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

export function playCardSelectSound(): void {
  void playSoundEvent("cardSelect");
}

export function playCardIllegalSound(): void {
  void playSoundEvent("cardIllegal");
}

export function playUiButtonSound(): void {
  void playSoundEvent("uiButton");
}

export function audioSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(
      window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ??
        typeof Audio !== "undefined",
    )
  );
}

export function isAudioUnlocked(): boolean {
  return userGestureUnlocked;
}

/** Clear asset probe cache when user switches sound packs. */
export function resetSoundAssetCache(): void {
  assetAvailability.clear();
}
