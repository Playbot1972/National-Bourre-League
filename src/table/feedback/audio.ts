/**
 * Table feedback audio — asset-first with procedural fallback.
 *
 * Final assets (not yet checked in):
 *   docs/sounds/shuffle.mp3
 *   docs/sounds/trick-win.mp3
 *   docs/sounds/big-win.mp3
 *
 * TODO(sound): Drop art-directed MP3s into docs/sounds/ — the loader below will
 * pick them up automatically. Procedural synthesis remains the fallback until then.
 */

/** Relative to social app root (docs/ → /social/ after deploy). */
export const SOUND_ASSET_PATHS = {
  shuffle: "./sounds/shuffle.mp3",
  trickWin: "./sounds/trick-win.mp3",
  bigWin: "./sounds/big-win.mp3",
} as const;

export type SoundAssetKey = keyof typeof SOUND_ASSET_PATHS;

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let userGestureUnlocked = false;

const clipCache = new Map<string, HTMLAudioElement>();
const assetAvailability = new Map<string, boolean>();

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

export async function preloadSoundAssets(): Promise<void> {
  if (!userGestureUnlocked) return;
  await Promise.all(
    Object.values(SOUND_ASSET_PATHS).map(async (src) => {
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
  if (!(await probeAsset(src))) return false;
  const clip = getClip(src);
  if (!clip) return false;
  try {
    clip.volume = volume;
    clip.currentTime = 0;
    await clip.play();
    return true;
  } catch {
    return false;
  }
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
  filter.frequency.value = 1400;
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

function playProceduralShuffle(): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  const bursts = [0, 0.06, 0.12, 0.2, 0.28];
  for (const offset of bursts) {
    scheduleNoiseBurst(ctx, masterGain, t0 + offset, 0.05, 0.08 + Math.random() * 0.04);
  }
}

function playProceduralTrickWin(): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  scheduleTone(ctx, masterGain, 880, t0, 0.12, 0.09, "sine");
  scheduleTone(ctx, masterGain, 1174.66, t0 + 0.07, 0.16, 0.07, "triangle");
  scheduleTone(ctx, masterGain, 1760, t0 + 0.14, 0.1, 0.04, "sine");
}

function playProceduralBigWin(): void {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  scheduleTone(ctx, masterGain, 659.25, t0, 0.14, 0.08, "sine");
  scheduleTone(ctx, masterGain, 830.61, t0 + 0.1, 0.18, 0.09, "triangle");
  scheduleTone(ctx, masterGain, 987.77, t0 + 0.22, 0.22, 0.1, "sine");
  scheduleTone(ctx, masterGain, 1318.51, t0 + 0.34, 0.28, 0.06, "triangle");
}

async function playSound(
  assetSrc: string,
  procedural: () => void,
  playingFlag: { current: boolean },
  resetMs: number,
): Promise<void> {
  if (playingFlag.current) return;
  playingFlag.current = true;
  try {
    const played = await tryPlayAsset(assetSrc);
    if (!played) {
      if (userGestureUnlocked) procedural();
    }
  } catch {
    /* never block gameplay */
  } finally {
    window.setTimeout(() => {
      playingFlag.current = false;
    }, resetMs);
  }
}

const shuffleFlag = { current: false };
const trickWinFlag = { current: false };
const bigWinFlag = { current: false };

/** Short card-riffle — asset-first, procedural fallback (~320ms). */
export function playShuffleSound(): void {
  void playSound(SOUND_ASSET_PATHS.shuffle, playProceduralShuffle, shuffleFlag, 360);
}

/** Crisp slot-like chime — asset-first, procedural fallback (~280ms). */
export function playTrickWinSound(): void {
  void playSound(SOUND_ASSET_PATHS.trickWin, playProceduralTrickWin, trickWinFlag, 320);
}

/** Richer hand/pot win — asset-first, procedural fallback (~520ms). */
export function playBigWinSound(): void {
  void playSound(SOUND_ASSET_PATHS.bigWin, playProceduralBigWin, bigWinFlag, 580);
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
