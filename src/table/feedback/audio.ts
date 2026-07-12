/**
 * Table feedback audio — pack-aware, asset-first with procedural fallback.
 *
 * Entry points:
 * - playActionSound — user/game intent (tap, button, session milestone)
 * - playAnimationSound — visual impact (card land, trick resolve, deal shuffle)
 */

import { getFeedbackPrefs } from "./prefs";
import {
  filenameFromAudioUrl,
  installTableAudioAuditHelpers,
  logTableAudio,
  recordAudioPlayMonitor,
  recordTableAudioAudit,
  type AudioAuditResult,
  type AudioAuditTriggerType,
  type TableAudioFallbackReason,
} from "./audioAudit";
import {
  allSoundAssetUrls,
  isAudioContentType,
  resolveSoundAsset,
  SOUND_EVENT_TRIGGER_TYPE,
  soundAssetUrl,
  type SoundAssetId,
  type SoundEventKey,
  type SoundPackId,
  type SoundResolveContext,
} from "./soundPacks";

export interface PlaySoundMeta {
  action?: string;
  source?: string;
  variant?: string;
}

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let userGestureUnlocked = false;
let auditHelpersInstalled = false;

function ensureAuditHelpers(): void {
  if (auditHelpersInstalled || typeof window === "undefined") return;
  installTableAudioAuditHelpers();
  auditHelpersInstalled = true;
}

/** Template clips — warmed on unlock so delayed callbacks can still play(). */
const clipCache = new Map<string, HTMLAudioElement>();
const assetAvailability = new Map<string, boolean>();
const warmedClips = new Set<string>();
const wiredClipDiagnostics = new WeakSet<HTMLAudioElement>();

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

function wireClipDiagnostics(
  clip: HTMLAudioElement,
  src: string,
  meta: { event?: SoundEventKey; key?: string } = {},
): void {
  if (wiredClipDiagnostics.has(clip)) return;
  wiredClipDiagnostics.add(clip);
  clip.addEventListener("loadeddata", () => {
    logTableAudio("onload", { src, key: meta.key, event: meta.event });
  });
  clip.addEventListener("error", () => {
    logTableAudio("onloaderror", {
      src,
      key: meta.key,
      event: meta.event,
      mediaError: clip.error?.code,
    });
  });
  clip.addEventListener("playing", () => {
    logTableAudio("onplay", { src, key: meta.key, event: meta.event });
  });
}

function getClip(
  src: string,
  meta: { event?: SoundEventKey; key?: string } = {},
): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  try {
    let clip = clipCache.get(src);
    if (!clip) {
      logTableAudio("resolve-src", { src, key: meta.key, event: meta.event });
      clip = new Audio(src);
      clip.preload = "auto";
      wireClipDiagnostics(clip, src, meta);
      clipCache.set(src, clip);
    }
    return clip;
  } catch {
    return null;
  }
}

function borrowClip(
  src: string,
  meta: { event?: SoundEventKey; key?: string } = {},
): HTMLAudioElement | null {
  const template = getClip(src, meta);
  if (!template) return null;
  if (template.paused && template.currentTime < 0.01) {
    return template;
  }
  try {
    logTableAudio("resolve-src", { src, key: meta.key, event: meta.event, clone: true });
    const clone = new Audio(src);
    clone.preload = "auto";
    wireClipDiagnostics(clone, src, meta);
    return clone;
  } catch {
    return null;
  }
}

export async function unlockAudio(): Promise<void> {
  ensureAuditHelpers();
  userGestureUnlocked = true;
  // Drop stale probe results (e.g. pre-deploy 404s) so play path retries hosted WAVs.
  assetAvailability.clear();
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

function waitForCanPlay(clip: HTMLAudioElement, timeoutMs = 2500): Promise<void> {
  if (clip.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("canplay-timeout"));
    }, timeoutMs);
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("media-error"));
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      clip.removeEventListener("canplaythrough", onReady);
      clip.removeEventListener("error", onError);
    };
    clip.addEventListener("canplaythrough", onReady, { once: true });
    clip.addEventListener("error", onError, { once: true });
    try {
      clip.load();
    } catch {
      cleanup();
      reject(new Error("load-failed"));
    }
  });
}

async function warmupClip(src: string): Promise<boolean> {
  if (warmedClips.has(src)) return true;
  const clip = getClip(src);
  if (!clip) return false;
  try {
    await waitForCanPlay(clip);
    const prevVol = clip.volume;
    clip.volume = 0.001;
    clip.currentTime = 0;
    await clip.play();
    clip.pause();
    clip.currentTime = 0;
    clip.volume = prevVol;
    warmedClips.add(src);
    logTableAudio("warmed", { src });
    return true;
  } catch (err) {
    logTableAudio("warmup-failed", { src, err: String(err) });
    return false;
  }
}

async function probeAsset(src: string): Promise<{ ok: boolean; reason?: TableAudioFallbackReason }> {
  // Only cache confirmed-good URLs — failed probes must not block later play attempts.
  if (assetAvailability.get(src) === true) {
    return { ok: true };
  }
  if (typeof window === "undefined") return { ok: false, reason: "probe-failed" };

  try {
    const head = await fetch(src, { method: "HEAD", cache: "no-store" });
    const headCt = head.headers.get("content-type");
    if (head.ok && isAudioContentType(headCt)) {
      assetAvailability.set(src, true);
      return { ok: true };
    }

    // Some static hosts omit Content-Type on HEAD — confirm with a tiny ranged GET.
    const ranged = await fetch(src, {
      headers: { Range: "bytes=0-15" },
      cache: "no-store",
    });
    const rangedCt = ranged.headers.get("content-type");
    if (ranged.ok && isAudioContentType(rangedCt)) {
      logTableAudio("probe-get-ok", { src, contentType: rangedCt });
      assetAvailability.set(src, true);
      return { ok: true };
    }
    if (ranged.ok && src.toLowerCase().endsWith(".wav") && !rangedCt?.toLowerCase().includes("text/html")) {
      logTableAudio("probe-wav-extension-ok", { src, contentType: rangedCt });
      assetAvailability.set(src, true);
      return { ok: true };
    }

    logTableAudio("probe-failed", {
      src,
      headStatus: head.status,
      headContentType: headCt,
      getStatus: ranged.status,
      getContentType: rangedCt,
    });
    if (!head.ok && !ranged.ok) {
      return { ok: false, reason: "probe-failed" };
    }
    return { ok: false, reason: "bad-content-type" };
  } catch (err) {
    logTableAudio("probe-network-error", { src, err: String(err) });
    return { ok: false, reason: "probe-failed" };
  }
}

/** Play path — try hosted WAV(s) directly; probe is preload-only. */
async function resolvePlayUrls(
  packId: SoundPackId,
  assetId: SoundAssetId,
): Promise<string[]> {
  const urls = [soundAssetUrl(packId, assetId)];
  if (packId !== "classic") {
    urls.push(soundAssetUrl("classic", assetId));
  }
  return urls;
}

export async function preloadSoundAssets(packId?: SoundPackId): Promise<void> {
  if (!userGestureUnlocked) return;
  const pack = packId ?? getActivePackId();
  await Promise.all(
    allSoundAssetUrls(pack).map(async (src) => {
      const probe = await probeAsset(src);
      if (!probe.ok) return;
      const clip = getClip(src);
      if (!clip) return;
      try {
        clip.load();
      } catch {
        /* optional preload */
      }
      await warmupClip(src);
    }),
  );
}

async function tryPlayAsset(
  src: string,
  volume = 0.55,
  meta: { event?: SoundEventKey; key?: string } = {},
): Promise<{ ok: boolean; reason?: TableAudioFallbackReason }> {
  const key = meta.key ?? meta.event;
  logTableAudio("requested", { key, src, event: meta.event });
  if (!userGestureUnlocked) {
    logTableAudio("play-blocked", { key, src, reason: "audio-locked" });
    return { ok: false, reason: "audio-locked" };
  }
  const clip = borrowClip(src, meta);
  if (!clip) {
    logTableAudio("play-blocked", { key, src, reason: "no-clip" });
    return { ok: false, reason: "media-error" };
  }
  try {
    if (clip.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await waitForCanPlay(clip);
    }
    clip.volume = Math.min(1, Math.max(0, volume));
    clip.currentTime = 0;
    await clip.play();
    const filename = filenameFromAudioUrl(src);
    logTableAudio("played-asset", { key, src, volume, filename });
    recordAudioPlayMonitor({ src, filename, volume });
    return { ok: true };
  } catch (err) {
    logTableAudio("onplayerror", { key, src, event: meta.event, err: String(err) });
    logTableAudio("play-rejected", { key, src, err: String(err) });
    return { ok: false, reason: "play-rejected" };
  }
}

async function tryPlayAssetId(
  packId: SoundPackId,
  assetId: SoundAssetId,
  volume = 0.55,
  event?: SoundEventKey,
): Promise<{ ok: boolean; reason?: TableAudioFallbackReason; src?: string }> {
  const playMeta = { key: event, event };
  const urls = await resolvePlayUrls(packId, assetId);
  let lastReason: TableAudioFallbackReason | undefined;
  for (const url of urls) {
    const playResult = await tryPlayAsset(url, volume, playMeta);
    if (playResult.ok) {
      assetAvailability.set(url, true);
      return { ok: true, src: url };
    }
    lastReason = playResult.reason ?? "play-rejected";
    logTableAudio("play-attempt-failed", { url, event, reason: lastReason });
  }
  return { ok: false, reason: lastReason ?? "play-rejected", src: urls[0] };
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
  handWin: (packId) => playProceduralTrickCollect(packId),
  potWin: (packId) => playProceduralBigWin(packId),
  bourre: (packId) => playProceduralBourre(packId),
  gameStart: (packId) => playProceduralShuffle(packId),
  openRoom: (packId) => playProceduralShuffle(packId),
  deleteRoom: (packId) => playProceduralCardIllegal(packId),
  fold: (packId) => playProceduralCardPlace(packId, 2),
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
  handWin: { current: false },
  potWin: { current: false },
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
  shuffleFinal: 420,
  draw: 280,
  cardPlace: 120,
  leadChange: 180,
  trickWin: 320,
  trickCollect: 280,
  handWin: 320,
  potWin: 580,
  bourre: 520,
  gameStart: 320,
  openRoom: 400,
  deleteRoom: 200,
  fold: 200,
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
  handWin: 0.4,
  potWin: 0.6,
  bourre: 0.5,
  gameStart: 0.42,
  openRoom: 0.5,
  deleteRoom: 0.4,
  fold: 0.42,
  cardSelect: 0.32,
  cardIllegal: 0.4,
  uiButton: 0.36,
};

function recordPlayAudit(
  triggerType: AudioAuditTriggerType,
  event: SoundEventKey,
  meta: PlaySoundMeta,
  result: AudioAuditResult,
  extra: {
    url?: string;
    filename?: string;
    fallbackReason?: string;
    tier?: number;
  } = {},
): void {
  recordTableAudioAudit({
    triggerType,
    action: meta.action,
    source: meta.source,
    event,
    result,
    url: extra.url,
    filename: extra.filename ?? filenameFromAudioUrl(extra.url),
    fallbackReason: extra.fallbackReason,
    tier: extra.tier,
    variant: meta.variant,
  });
}

async function playSoundEvent(
  event: SoundEventKey,
  triggerType: AudioAuditTriggerType,
  ctx: SoundResolveContext = {},
  meta: PlaySoundMeta = {},
): Promise<void> {
  ensureAuditHelpers();
  const flag = playingFlags[event];
  if (flag.current) {
    recordPlayAudit(triggerType, event, meta, "deduped", {
      fallbackReason: "deduped",
      tier: ctx.intensityTier,
    });
    return;
  }
  flag.current = true;
  const packId = getActivePackId();
  const assetId = resolveSoundAsset(packId, event, ctx);
  let fallbackReason: TableAudioFallbackReason | null = null;

  if (!userGestureUnlocked) {
    logTableAudio("skip-locked", { event });
    recordPlayAudit(triggerType, event, meta, "skipped-muted", {
      fallbackReason: "audio-locked",
      tier: ctx.intensityTier,
    });
    window.setTimeout(() => {
      flag.current = false;
    }, RESET_MS[event]);
    return;
  }

  try {
    let played = false;
    let playedUrl: string | undefined;
    let playedFilename: string | undefined;

    if (!assetId) {
      fallbackReason = "procedural-only";
      logTableAudio("resolve", { event, assetId: null, reason: fallbackReason, triggerType, ...meta });
    } else {
      const volume =
        event === "trickWin" ? VOLUME[event] * (ctx.volumeScale ?? 1) : VOLUME[event];
      const src = soundAssetUrl(packId, assetId);
      playedFilename = filenameFromAudioUrl(src);
      logTableAudio("requested", { key: event, event, assetId, src, triggerType, ...meta });
      logTableAudio("resolve", { key: event, event, assetId, src, triggerType, ...meta });
      const result = await tryPlayAssetId(packId, assetId, volume, event);
      played = result.ok;
      playedUrl = result.src;
      if (result.ok) {
        playedFilename = filenameFromAudioUrl(playedUrl) ?? playedFilename;
      } else {
        fallbackReason = result.reason ?? "play-rejected";
      }
    }

    if (played) {
      recordPlayAudit(triggerType, event, meta, "asset-played", {
        url: playedUrl,
        filename: playedFilename,
        tier: ctx.intensityTier,
      });
      return;
    }

    if (fallbackReason === "audio-locked") {
      return;
    }

    const auditResult =
      fallbackReason === "procedural-only" ? "procedural-only" : "procedural-fallback";

    logTableAudio("fallback-procedural", {
      event,
      reason: fallbackReason ?? "play-rejected",
      assetId,
      triggerType,
      ...meta,
    });

    recordPlayAudit(triggerType, event, meta, auditResult, {
      url: playedUrl,
      filename: playedFilename,
      fallbackReason: fallbackReason ?? undefined,
      tier: ctx.intensityTier,
    });

    PROCEDURAL_BY_EVENT[event](packId, ctx);
  } catch (err) {
    logTableAudio("play-error", { event, err: String(err) });
    recordPlayAudit(triggerType, event, meta, "procedural-fallback", {
      fallbackReason: String(err),
      tier: ctx.intensityTier,
    });
    if (userGestureUnlocked) {
      PROCEDURAL_BY_EVENT[event](packId, ctx);
    }
  } finally {
    window.setTimeout(() => {
      flag.current = false;
    }, RESET_MS[event]);
  }
}

/** User/game intent — tap, button, room/session actions. */
export function playActionSound(
  event: SoundEventKey,
  ctx: SoundResolveContext = {},
  meta: PlaySoundMeta = {},
): void {
  const expected = SOUND_EVENT_TRIGGER_TYPE[event];
  if (expected !== "action") {
    logTableAudio("trigger-mismatch", { event, expected, got: "action", ...meta });
  }
  void playSoundEvent(event, "action", ctx, meta);
}

/** Visual impact — card land, trick resolve, deal shuffle. */
export function playAnimationSound(
  event: SoundEventKey,
  ctx: SoundResolveContext = {},
  meta: PlaySoundMeta = {},
): void {
  const expected = SOUND_EVENT_TRIGGER_TYPE[event];
  if (expected !== "animation") {
    logTableAudio("trigger-mismatch", { event, expected, got: "animation", ...meta });
  }
  void playSoundEvent(event, "animation", ctx, meta);
}

/** Hand/session outcome — pot win, hand win, bourré. */
export function playOutcomeSound(
  event: SoundEventKey,
  ctx: SoundResolveContext = {},
  meta: PlaySoundMeta = {},
): void {
  const expected = SOUND_EVENT_TRIGGER_TYPE[event];
  if (expected !== "outcome") {
    logTableAudio("trigger-mismatch", { event, expected, got: "outcome", ...meta });
  }
  void playSoundEvent(event, "outcome", ctx, meta);
}

export function playShuffleSound(
  variant: "normal" | "final" = "normal",
  meta: PlaySoundMeta = {},
): void {
  playAnimationSound(variant === "final" ? "shuffleFinal" : "shuffle", {}, {
    ...meta,
    variant,
    action: meta.action ?? "deal-shuffle",
  });
}

export function playDrawSound(meta: PlaySoundMeta = {}): void {
  playActionSound("draw", {}, { ...meta, action: meta.action ?? "draw-replace" });
}

export function playCardPlaceSound(intensityTier = 0, meta: PlaySoundMeta = {}): void {
  playAnimationSound("cardPlace", { intensityTier }, {
    ...meta,
    action: meta.action ?? "card-land",
  });
}

export function playLeadChangeSound(intensityTier = 0, meta: PlaySoundMeta = {}): void {
  playAnimationSound("leadChange", { intensityTier }, {
    ...meta,
    action: meta.action ?? "take-lead",
  });
}

export function playTrickCollectSound(meta: PlaySoundMeta = {}): void {
  playAnimationSound("trickCollect", {}, { ...meta, action: meta.action ?? "trick-collect" });
}

export function playTrickWinSound(
  volumeScale = 1,
  isLocalPlayer = false,
  meta: PlaySoundMeta = {},
): void {
  playAnimationSound(
    "trickWin",
    { volumeScale, isLocalPlayer },
    { ...meta, action: meta.action ?? "trick-won" },
  );
}

export function playPotWinSound(meta: PlaySoundMeta = {}): void {
  playOutcomeSound("potWin", {}, { ...meta, action: meta.action ?? "pot-win" });
}

/** @deprecated Use playPotWinSound */
export function playBigWinSound(meta: PlaySoundMeta = {}): void {
  playPotWinSound(meta);
}

export function playHandWinSound(meta: PlaySoundMeta = {}): void {
  playOutcomeSound("handWin", {}, { ...meta, action: meta.action ?? "hand-win" });
}

export function playBourreSound(meta: PlaySoundMeta = {}): void {
  playOutcomeSound("bourre", {}, { ...meta, action: meta.action ?? "bourre" });
}

export function playGameStartSound(meta: PlaySoundMeta = {}): void {
  playActionSound("gameStart", {}, { ...meta, action: meta.action ?? "game-start" });
}

export function playOpenRoomSound(meta: PlaySoundMeta = {}): void {
  playActionSound("openRoom", {}, { ...meta, action: meta.action ?? "open-room" });
}

export function playDeleteRoomSound(meta: PlaySoundMeta = {}): void {
  playActionSound("deleteRoom", {}, { ...meta, action: meta.action ?? "delete-room" });
}

export function playFoldSound(meta: PlaySoundMeta = {}): void {
  playActionSound("fold", {}, { ...meta, action: meta.action ?? "fold" });
}

export function playCardSelectSound(meta: PlaySoundMeta = {}): void {
  playActionSound("cardSelect", {}, { ...meta, action: meta.action ?? "card-select" });
}

export function playCardIllegalSound(meta: PlaySoundMeta = {}): void {
  playActionSound("cardIllegal", {}, { ...meta, action: meta.action ?? "card-illegal" });
}

export function playUiButtonSound(meta: PlaySoundMeta = {}): void {
  playActionSound("uiButton", {}, { ...meta, action: meta.action ?? "ui-button" });
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

/** Clear asset probe + clip caches when user switches sound packs. */
export function resetSoundAssetCache(): void {
  assetAvailability.clear();
  warmedClips.clear();
  clipCache.clear();
}

export { isTableAudioDebugEnabled, logTableAudio } from "./audioAudit";
export {
  resetTableAudioAudit,
  getTableAudioAudit,
  printTableAudioAuditSummary,
  installTableAudioAuditHelpers,
  resetAudioPlayMonitor,
  getAudioPlayMonitor,
} from "./audioAudit";
