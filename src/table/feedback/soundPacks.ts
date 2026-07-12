/**
 * Sound theme registry — maps gameplay events to art-directed WAV assets.
 * Assets live under public/sounds/ (served at /sounds/ on the site root).
 * Procedural fallbacks in audio.ts when asset load/play fails.
 */

export type SoundPackId = "classic" | "wood" | "arcade";

/** Canonical asset IDs — match on-disk basename without extension. */
export type SoundAssetId =
  | "card-place-normal"
  | "card-place-heavy"
  | "card-place-soft"
  | "lead-sweetener-light"
  | "lead-sweetener-strong"
  | "trick-win-normal"
  | "trick-win-big"
  | "hand-win-stinger"
  | "card-shuffle-normal"
  | "card-shuffle-final"
  | "card-select"
  | "card-illegal"
  | "ui-button-press"
  | "coin-chime-light"
  | "draw"
  | "Fahhh";

/** Event-driven keys used by AudioManager, feedback service, and prefs. */
export type SoundEventKey =
  | "shuffle"
  | "shuffleFinal"
  | "draw"
  | "cardPlace"
  | "leadChange"
  | "trickWin"
  | "trickCollect"
  | "handWin"
  | "potWin"
  | "bourre"
  | "gameStart"
  | "openRoom"
  | "deleteRoom"
  | "fold"
  | "cardSelect"
  | "cardIllegal"
  | "uiButton";

export const SOUND_PACK_LABELS: Record<SoundPackId, string> = {
  classic: "Classic",
  wood: "Wood & Felt",
  arcade: "Arcade",
};

export const DEFAULT_SOUND_PACK_ID: SoundPackId = "classic";

/** Every committed classic asset — used for preload after audio unlock. */
export const ALL_SOUND_ASSET_IDS: readonly SoundAssetId[] = [
  "card-place-normal",
  "card-place-heavy",
  "card-place-soft",
  "lead-sweetener-light",
  "lead-sweetener-strong",
  "trick-win-normal",
  "trick-win-big",
  "hand-win-stinger",
  "card-shuffle-normal",
  "card-shuffle-final",
  "card-select",
  "card-illegal",
  "ui-button-press",
  "coin-chime-light",
  "draw",
  "Fahhh",
] as const;

/** On-disk filenames for each asset ID (classic pack). */
export const SOUND_ASSET_FILES: Record<SoundAssetId, string> = {
  "card-place-normal": "card-place-normal.wav",
  "card-place-heavy": "card-place-heavy.wav",
  "card-place-soft": "card-place-soft.wav",
  "lead-sweetener-light": "lead-sweetener-light.wav",
  "lead-sweetener-strong": "lead-sweetener-strong.wav",
  "trick-win-normal": "trick-win-normal.wav",
  "trick-win-big": "trick-win-big.wav",
  "hand-win-stinger": "hand-win-stinger.wav",
  "card-shuffle-normal": "card-shuffle-normal.wav",
  "card-shuffle-final": "card-shuffle-final.wav",
  "card-select": "card-select.wav",
  "card-illegal": "card-illegal.wav",
  "ui-button-press": "ui-button-press.wav",
  "coin-chime-light": "coin-chime-light.wav",
  draw: "draw.wav",
  Fahhh: "Fahhh.wav",
};

/** Human-readable mapping for docs and QA. */
export const SOUND_EVENT_TO_ASSET: Record<SoundEventKey, SoundAssetId | SoundAssetId[]> = {
  shuffle: "card-shuffle-normal",
  shuffleFinal: "card-shuffle-final",
  draw: "draw",
  cardPlace: ["card-place-soft", "card-place-normal", "card-place-heavy"],
  leadChange: ["lead-sweetener-light", "lead-sweetener-strong"],
  trickWin: ["trick-win-normal", "trick-win-big"],
  trickCollect: "coin-chime-light",
  handWin: "coin-chime-light",
  potWin: "hand-win-stinger",
  bourre: "Fahhh",
  gameStart: "card-shuffle-normal",
  openRoom: "card-shuffle-final",
  deleteRoom: "card-illegal",
  fold: "card-place-heavy",
  cardSelect: "card-select",
  cardIllegal: "card-illegal",
  uiButton: "ui-button-press",
};

const PACK_SUBDIRS: Record<SoundPackId, string> = {
  classic: "",
  wood: "packs/wood/",
  arcade: "packs/arcade/",
};

export interface SoundResolveContext {
  /** 0 = normal, 1 = soft/light, 2 = heavy/strong — from deriveIntensityTier. */
  intensityTier?: number;
  /** Trick-win loudness boost for local player. */
  volumeScale?: number;
  isLocalPlayer?: boolean;
}

/** True when a fetch HEAD/GET response is an audio asset (not SPA HTML). */
export function isAudioContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  const ct = contentType.toLowerCase();
  return ct.includes("audio/") || ct.includes("application/octet-stream");
}

/** Site-root sounds path — always `/sounds/` (public/sounds after Vite/hosting build). */
export const SOUND_ASSETS_ROOT_PATH = "/sounds/";

/**
 * Absolute `/sounds/` root for the current origin.
 * WAVs are served from public/sounds → dist/sounds at deploy (not under /social/).
 */
export function resolveSoundAssetsRoot(pageHref: string): string {
  const page = new URL(pageHref);
  return `${page.origin}${SOUND_ASSETS_ROOT_PATH}`;
}

/** Absolute URL to a pack asset at site root `/sounds/{file}`. */
export function soundAssetUrl(packId: SoundPackId, assetId: SoundAssetId): string {
  const subdir = PACK_SUBDIRS[packId] ?? "";
  const root =
    typeof document !== "undefined"
      ? resolveSoundAssetsRoot(document.baseURI)
      : SOUND_ASSETS_ROOT_PATH;
  return `${root}${subdir}${SOUND_ASSET_FILES[assetId]}`;
}

/** @deprecated Use soundAssetUrl — kept for callers migrating from MP3 names. */
export function soundAssetPath(packId: SoundPackId, event: SoundEventKey): string {
  const assetId = resolveSoundAsset(packId, event, {});
  if (!assetId) return `./sounds/missing-${event}.wav`;
  return soundAssetUrl(packId, assetId);
}

export function allSoundAssetUrls(packId: SoundPackId = DEFAULT_SOUND_PACK_ID): string[] {
  return ALL_SOUND_ASSET_IDS.map((id) => soundAssetUrl(packId, id));
}

/** @deprecated Alias for allSoundAssetUrls */
export function allSoundAssetPaths(packId: SoundPackId): string[] {
  return allSoundAssetUrls(packId);
}

/**
 * Pick the art-directed asset for an event.
 */
export function resolveSoundAsset(
  _packId: SoundPackId,
  event: SoundEventKey,
  ctx: SoundResolveContext = {},
): SoundAssetId | null {
  const tier = ctx.intensityTier ?? 0;
  switch (event) {
    case "shuffle":
    case "gameStart":
      return "card-shuffle-normal";
    case "shuffleFinal":
    case "openRoom":
      return "card-shuffle-final";
    case "draw":
      return "draw";
    case "cardPlace":
      if (tier >= 2) return "card-place-heavy";
      if (tier === 1) return "card-place-soft";
      return "card-place-normal";
    case "leadChange":
      return tier >= 2 ? "lead-sweetener-strong" : "lead-sweetener-light";
    case "trickWin":
      if (ctx.isLocalPlayer || (ctx.volumeScale ?? 1) > 1.02) return "trick-win-big";
      return "trick-win-normal";
    case "trickCollect":
    case "handWin":
      return "coin-chime-light";
    case "potWin":
      return "hand-win-stinger";
    case "bourre":
      return "Fahhh";
    case "uiButton":
      return "ui-button-press";
    case "cardSelect":
      return "card-select";
    case "cardIllegal":
    case "deleteRoom":
      return "card-illegal";
    case "fold":
      return "card-place-heavy";
  }
}

export function normalizeSoundPackId(value: unknown): SoundPackId {
  if (value === "wood" || value === "arcade") return value;
  return DEFAULT_SOUND_PACK_ID;
}

/** Whether an event is action-, animation-, or outcome-driven. */
export type SoundTriggerType = "action" | "animation" | "outcome";

export const SOUND_EVENT_TRIGGER_TYPE: Record<SoundEventKey, SoundTriggerType> = {
  shuffle: "animation",
  shuffleFinal: "animation",
  draw: "action",
  cardPlace: "animation",
  leadChange: "animation",
  trickWin: "animation",
  trickCollect: "animation",
  handWin: "outcome",
  potWin: "outcome",
  bourre: "outcome",
  gameStart: "action",
  openRoom: "action",
  deleteRoom: "action",
  fold: "action",
  cardSelect: "action",
  cardIllegal: "action",
  uiButton: "action",
};

/** Events that intentionally use UI placeholder WAVs — not gameplay card audio. */
export const SOUND_UI_ONLY_EVENTS: readonly SoundEventKey[] = ["uiButton", "deleteRoom"] as const;

/** Gameplay events that must never use procedural fallback in normal play. */
export const SOUND_GAMEPLAY_EVENTS: readonly SoundEventKey[] = [
  "shuffle",
  "shuffleFinal",
  "draw",
  "cardPlace",
  "leadChange",
  "trickWin",
  "trickCollect",
  "handWin",
  "potWin",
  "bourre",
  "gameStart",
  "openRoom",
  "fold",
  "cardSelect",
  "cardIllegal",
] as const;
