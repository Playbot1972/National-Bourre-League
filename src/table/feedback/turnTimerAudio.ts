/**
 * Looping turn timer warning — isolated Howler instance with tracked play ID.
 */

import { Howl } from "howler";
import { AudioManager } from "../../audio/AudioManager";
import { ensureAudioUnlockedSync } from "./audio";
import { getFeedbackPrefs, shouldPlaySoundEvent } from "./prefs";
import { SOUND_ASSET_FILES } from "./soundPacks";
import type { TurnTimerWarningStopReason } from "../turnTimerWarning";

const TIMER_VOLUME = 0.48;
const FADE_OUT_MS = 90;

let timerHowl: Howl | null = null;
let activePlayId: number | null = null;
let activeTurnKey: string | null = null;

function devLog(message: string, detail: Record<string, unknown>): void {
  try {
    if (import.meta.env?.DEV) {
      console.log("[nbl-timer-audio]", message, detail);
    }
  } catch {
    /* non-Vite */
  }
}

function getTimerHowl(): Howl {
  if (!timerHowl) {
    timerHowl = new Howl({
      src: [`/sounds/${SOUND_ASSET_FILES.timer}`],
      loop: true,
      volume: TIMER_VOLUME,
      preload: true,
    });
  }
  return timerHowl;
}

export function isTurnTimerWarningPlaying(): boolean {
  return activePlayId != null;
}

export function stopTurnTimerWarning(
  reason: TurnTimerWarningStopReason,
  options: { fadeMs?: number } = {},
): void {
  if (activePlayId == null) return;

  const howl = timerHowl;
  const playId = activePlayId;
  const turnKey = activeTurnKey;
  activePlayId = null;
  activeTurnKey = null;

  devLog("timer-warning-stopped", { reason, turnKey, playId });

  if (!howl) return;

  const fadeMs = options.fadeMs ?? (reason === "playerAction" ? FADE_OUT_MS : FADE_OUT_MS);
  if (fadeMs > 0 && reason !== "overlap") {
    howl.fade(TIMER_VOLUME, 0, fadeMs, playId);
    window.setTimeout(() => {
      howl.stop(playId);
    }, fadeMs + 20);
    return;
  }
  howl.stop(playId);
}

export interface StartTurnTimerWarningContext {
  turnKey: string;
  actorId: string;
  ringStartedAtMs: number;
  elapsedMs: number;
}

/** Start looping timer warning once per turn after elapsed threshold. */
export function startTurnTimerWarning(ctx: StartTurnTimerWarningContext): boolean {
  const prefs = getFeedbackPrefs();
  if (!shouldPlaySoundEvent(prefs.soundMode, "turnTimer")) return false;

  if (activePlayId != null) {
    stopTurnTimerWarning("overlap", { fadeMs: 0 });
  }

  ensureAudioUnlockedSync("turn-timer-warning");
  AudioManager.get().unlock();

  const howl = getTimerHowl();
  const playId = howl.play();
  if (typeof playId !== "number") return false;

  activePlayId = playId;
  activeTurnKey = ctx.turnKey;

  devLog("timer-warning-started", {
    turnKey: ctx.turnKey,
    actorId: ctx.actorId,
    ringStartedAtMs: ctx.ringStartedAtMs,
    elapsedMs: ctx.elapsedMs,
    playId,
  });

  return true;
}

/** @internal test helper */
export function _resetTurnTimerAudioForTests(): void {
  if (timerHowl && activePlayId != null) {
    timerHowl.stop(activePlayId);
  }
  activePlayId = null;
  activeTurnKey = null;
}
