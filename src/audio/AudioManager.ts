/**
 * Centralized card-table audio — event-driven, deduped, non-blocking.
 * Syncs to animation milestones via useCardAudio / TrickPlaySlot callbacks.
 */

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
import { getFeedbackPrefs, shouldPlaySoundEvent } from "../table/feedback/prefs";
import {
  playCardPlaceSound,
  playLeadChangeSound,
  playTrickCollectSound,
  playTrickWinSound,
} from "../table/feedback/audio";
import { triggerHaptic } from "../table/feedback/haptics";
import { shouldUseHaptics } from "../table/feedback/prefs";
import type { SoundEventKey } from "../table/feedback/soundPacks";

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

function playEventSound(payload: CardAudioEventPayload): void {
  const prefs = getFeedbackPrefs();
  const soundKey = soundKeyForEvent(payload.type);
  if (!shouldPlaySoundEvent(prefs.soundMode, soundKey)) return;

  switch (payload.type) {
    case "card:played":
      playCardPlaceSound(payload.intensityTier);
      break;
    case "card:lead-change":
      playLeadChangeSound(payload.intensityTier);
      break;
    case "trick:won":
      playTrickWinSound(payload.isLocalPlayer ? 1.08 : 1, Boolean(payload.isLocalPlayer));
      break;
    case "trick:collected":
      playTrickCollectSound();
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
