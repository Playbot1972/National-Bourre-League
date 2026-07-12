/**
 * Centralized table audio — Howler singleton for /sounds/*.wav plus
 * event-driven card animation dispatch (deduped, non-blocking).
 */

import { Howl } from "howler";
import {
  ALL_SOUND_ASSET_IDS,
  SOUND_ASSET_FILES,
  resolveSoundAsset,
  type SoundAssetId,
  type SoundEventKey,
} from "../table/feedback/soundPacks";
import {
  type CardAudioEventPayload,
  type CardAudioEventType,
  cardAudioDedupeKey,
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
  Fahhh: 0.5,
};

function debugLog(...args: unknown[]): void {
  console.log("[nbl-audio]", ...args);
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
    debugLog("register", name, src);
    const howl = new Howl({
      src: [src],
      volume: DEFAULT_VOLUME[name] ?? 0.55,
      preload: true,
      onloaderror: (_id, err) => {
        console.error("sound load error", name, err);
      },
      onplayerror: (_id, err) => {
        console.error("sound play error", name, err);
        howl.once("unlock", () => {
          howl.play();
        });
      },
    });
    this.howls.set(name, howl);
  }

  unlock(): void {
    this.unlocked = true;
    debugLog("unlock");
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  play(name: SoundAssetId, options?: { volume?: number }): boolean {
    debugLog("play", name);
    const howl = this.howls.get(name);
    if (!howl) {
      console.error("[nbl-audio] missing sound", name);
      return false;
    }
    if (options?.volume != null) {
      howl.volume(options.volume);
    }
    howl.play();
    return true;
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
  if (!assetId) return;
  const base = EVENT_VOLUME[event] ?? 0.55;
  const volume = event === "trickWin" ? base * (ctx.volumeScale ?? 1) : base;
  AudioManager.get().play(assetId, { volume });
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
    case "trick:won":
      playFeedbackEvent("trickWin", {
        volumeScale: payload.isLocalPlayer ? 1.08 : 1,
        isLocalPlayer: payload.isLocalPlayer,
      });
      break;
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
