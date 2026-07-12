/**
 * Centralized table audio — Howler singleton for /sounds/* plus
 * event-driven card animation dispatch (deduped, non-blocking).
 */

import { Howl, Howler } from "howler";
import {
  ALL_SOUND_ASSET_IDS,
  isBatch1WavAsset,
  SOUND_ASSET_FILES,
  resolveSoundAsset,
  soundAssetUrl,
  type SoundAssetId,
  type SoundEventKey,
} from "../table/feedback/soundPacks";
import {
  type CardAudioEventPayload,
  type CardAudioEventType,
  cardAudioDedupeKey,
  shouldPlayTrickWinNormal,
} from "./audioEvents";
import {
  AUDIO_DEDUPE_TTL_MS,
  CARD_PLAYED_OFFSET_MS,
  LEAD_CHANGE_OFFSET_MS,
  TRICK_COLLECTED_OFFSET_MS,
  TRICK_WON_OFFSET_MS,
} from "./audioTiming";
import {
  getFeedbackPrefs,
  shouldPlaySoundEvent,
  shouldUseHaptics,
} from "../table/feedback/prefs";
import { triggerHaptic } from "../table/feedback/haptics";

const DEFAULT_VOLUME: Partial<Record<SoundAssetId, number>> = {
  "card-place-normal": 0.38,
  "card-place-soft": 0.34,
  "card-place-heavy": 0.42,
  "lead-sweetener-light": 0.42,
  "lead-sweetener-strong": 0.46,
  "trick-win-normal": 0.55,
  "trick-win-big": 0.6,
  "coin-chime-light": 0.4,
  "hand-win-stinger": 0.6,
  "card-shuffle-normal": 0.55,
  "card-shuffle-final": 0.55,
  "card-select": 0.45,
  "card-illegal": 0.5,
  "ui-button-press": 0.4,
  draw: 0.45,
  draw1: 0.45,
  draw2: 0.45,
  draw3: 0.45,
  draw4: 0.45,
  draw5: 0.45,
  Fahhh: 0.5,
};

function debugLog(...args: unknown[]): void {
  console.log("[nbl-audio]", ...args);
}

/** Dev server or `localStorage.setItem('nbl-audio-debug','1')` — never on by default in production. */
function isAudioDebugEnabled(): boolean {
  try {
    if (import.meta.env?.DEV) return true;
  } catch {
    /* non-Vite (e.g. node tests) */
  }
  try {
    return localStorage.getItem("nbl-audio-debug") === "1";
  } catch {
    return false;
  }
}

export class AudioManager {
  private static instance: AudioManager | null = null;

  private readonly howls = new Map<SoundAssetId, Howl>();
  private unlocked = false;

  static get(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private constructor() {
    for (const name of ALL_SOUND_ASSET_IDS) {
      this.register(name);
    }
  }

  private register(name: SoundAssetId): void {
    const src = `/sounds/${SOUND_ASSET_FILES[name]}`;
    const batch1 = isBatch1WavAsset(name);
    debugLog("register", { key: name, resolvedUrl: src, fallback: false, batch1 });
    const howl = new Howl({
      src: [src],
      volume: DEFAULT_VOLUME[name] ?? 0.55,
      preload: true,
      onload: isAudioDebugEnabled()
        ? () => {
            debugLog("loaded", { key: name, resolvedUrl: src, state: "loaded" });
          }
        : undefined,
      onloaderror: (_id, err) => {
        console.error("[nbl-audio] sound load error", {
          key: name,
          path: src,
          error: err,
          fallback: false,
        });
      },
      onplay: isAudioDebugEnabled()
        ? () => {
            debugLog("playing", { key: name, resolvedUrl: src });
          }
        : undefined,
      onplayerror: (_id, err) => {
        console.error("[nbl-audio] sound play error", {
          key: name,
          path: src,
          error: err,
          fallback: false,
        });
      },
    });
    this.howls.set(name, howl);
  }

  unlock(): boolean {
    this.unlocked = true;
    let resumeAttempted = false;
    let resumeOk: boolean | null = null;
    try {
      const ctx = Howler.ctx;
      if (ctx && typeof ctx.resume === "function" && ctx.state === "suspended") {
        resumeAttempted = true;
        void ctx.resume().then(
          () => {
            resumeOk = true;
            debugLog("unlock-resume", { state: ctx.state, ok: true });
          },
          (err) => {
            resumeOk = false;
            console.error("[nbl-audio] unlock-resume-failed", {
              state: ctx.state,
              error: String(err),
              fallback: false,
            });
          },
        );
      }
      debugLog("unlock", {
        ctxState: ctx?.state ?? "none",
        resumeAttempted,
      });
    } catch (err) {
      console.error("[nbl-audio] unlock-failed", { error: String(err), fallback: false });
      return false;
    }
    return this.unlocked;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  getContextState(): string {
    return Howler.ctx?.state ?? "none";
  }

  play(
    name: SoundAssetId,
    options?: { volume?: number; event?: SoundEventKey; path?: string },
  ): boolean {
    const path = options?.path ?? `/sounds/${SOUND_ASSET_FILES[name]}`;
    const batch1 = isBatch1WavAsset(name);
    debugLog("play", {
      key: name,
      resolvedUrl: path,
      fallback: false,
      batch1,
      event: options?.event,
      volume: options?.volume,
    });
    const howl = this.howls.get(name);
    if (!howl) {
      console.error("[nbl-audio] missing sound registration", {
        key: name,
        path,
        event: options?.event,
        fallback: false,
      });
      return false;
    }
    const state = howl.state();
    if (state === "unloaded") {
      console.error("[nbl-audio] sound not loaded", {
        key: name,
        path,
        event: options?.event,
        state,
        fallback: false,
      });
      return false;
    }
    if (options?.volume != null) {
      howl.volume(options.volume);
    }
    try {
      howl.play();
      if (isAudioDebugEnabled()) {
        debugLog("play-started", {
          key: name,
          resolvedUrl: path,
          event: options?.event,
          howlState: howl.state(),
        });
      }
      return true;
    } catch (err) {
      console.error("[nbl-audio] play threw", {
        key: name,
        path,
        event: options?.event,
        error: String(err),
        fallback: false,
      });
      return false;
    }
  }
}

const playedKeys = new Map<string, number>();
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

function soundKeyForEvent(type: CardAudioEventType): SoundEventKey {
  switch (type) {
    case "card:played":
      return "cardPlace";
    case "card:lead-change":
      return "leadChange";
    case "trick:won":
      return "trickWin";
    case "trick:collected":
      return "trickCollect";
  }
}

function offsetForEvent(type: CardAudioEventType): number {
  switch (type) {
    case "card:played":
      return CARD_PLAYED_OFFSET_MS;
    case "card:lead-change":
      return LEAD_CHANGE_OFFSET_MS;
    case "trick:won":
      return TRICK_WON_OFFSET_MS;
    case "trick:collected":
      return TRICK_COLLECTED_OFFSET_MS;
  }
}

function dedupeSuffix(payload: CardAudioEventPayload): string {
  switch (payload.type) {
    case "card:played":
    case "card:lead-change":
      return payload.cardId ?? "unknown";
    case "trick:won":
    case "trick:collected":
      return `${payload.winningSeat ?? "unknown"}:${payload.type}`;
  }
}

export function hasCardAudioPlayed(key: string): boolean {
  const at = playedKeys.get(key);
  if (at == null) return false;
  if (Date.now() - at > AUDIO_DEDUPE_TTL_MS) {
    playedKeys.delete(key);
    return false;
  }
  return true;
}

export function markCardAudioPlayed(key: string): void {
  playedKeys.set(key, Date.now());
}

export function clearCardAudioDedupe(): void {
  playedKeys.clear();
  for (const timer of pendingTimers.values()) {
    clearTimeout(timer);
  }
  pendingTimers.clear();
}

const EVENT_VOLUME: Partial<Record<SoundEventKey, number>> = {
  cardPlace: 0.38,
  leadChange: 0.42,
  trickWin: 0.55,
  trickCollect: 0.4,
};

function playFeedbackEvent(
  event: SoundEventKey,
  ctx: { intensityTier?: number; volumeScale?: number; isLocalPlayer?: boolean } = {},
): void {
  const packId = getFeedbackPrefs().soundPackId;
  const assetId = resolveSoundAsset(packId, event, ctx);
  if (!assetId) {
    console.error("[nbl-audio] FAIL", {
      event,
      reason: "no-asset-mapping",
      packId,
      ctx,
      fallback: false,
    });
    return;
  }
  const path = soundAssetUrl(packId, assetId);
  const batch1 = isBatch1WavAsset(assetId);
  console.log("[nbl-audio] request", {
    event,
    key: assetId,
    resolvedUrl: path,
    fallback: false,
    batch1,
    packId,
    ctx,
  });
  const base = EVENT_VOLUME[event] ?? 0.55;
  const volume = event === "trickWin" ? base * (ctx.volumeScale ?? 1) : base;
  const played = AudioManager.get().play(assetId, { volume, event, path });
  if (!played) {
    console.error("[nbl-audio] FAIL", {
      event,
      reason: "howler-play-failed",
      assetId,
      path,
      fallback: false,
    });
  }
}

function playEventSound(payload: CardAudioEventPayload): void {
  const prefs = getFeedbackPrefs();
  const soundKey = soundKeyForEvent(payload.type);
  if (!shouldPlaySoundEvent(prefs.soundMode, soundKey)) return;

  switch (payload.type) {
    case "card:played":
      playFeedbackEvent("cardPlace", { intensityTier: payload.intensityTier });
      break;
    case "card:lead-change":
      playFeedbackEvent("leadChange", { intensityTier: payload.intensityTier });
      break;
    case "trick:won": {
      const allowed = shouldPlayTrickWinNormal(payload);
      console.log("[nbl-audio] trick-win-gate", {
        event: "trickWin",
        key: "trick-win-normal",
        allowed,
        isLocalPlayer: payload.isLocalPlayer ?? false,
      });
      if (!allowed) break;
      playFeedbackEvent("trickWin", {
        volumeScale: 1.08,
        isLocalPlayer: true,
      });
      break;
    }
    case "trick:collected":
      playFeedbackEvent("trickCollect");
      break;
  }
}

function maybeFireHaptic(payload: CardAudioEventPayload): void {
  const prefs = getFeedbackPrefs();
  if (payload.type === "trick:won" && payload.isLocalPlayer) {
    if (shouldUseHaptics(prefs.hapticsMode, "medium")) {
      triggerHaptic("medium");
    }
    return;
  }
  if (payload.type === "card:lead-change" && payload.isLocalPlayer) {
    if (shouldUseHaptics(prefs.hapticsMode, "light")) {
      triggerHaptic("light");
    }
  }
}

/**
 * Dispatch a card audio event with dedupe and optional timing offset.
 * Safe to call from animation callbacks — never throws.
 */
export function dispatchCardAudio(payload: CardAudioEventPayload): void {
  try {
    const key = cardAudioDedupeKey(payload.type, payload.trickId, dedupeSuffix(payload));
    if (hasCardAudioPlayed(key)) return;

    const offsetMs = offsetForEvent(payload.type);
    const fire = () => {
      if (hasCardAudioPlayed(key)) return;
      markCardAudioPlayed(key);
      playEventSound(payload);
      maybeFireHaptic(payload);
    };

    if (offsetMs <= 0) {
      fire();
      return;
    }

    const timerKey = key;
    const existing = pendingTimers.get(timerKey);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      pendingTimers.delete(timerKey);
      fire();
    }, offsetMs);
    pendingTimers.set(timerKey, timer);
  } catch {
    /* never block gameplay */
  }
}
