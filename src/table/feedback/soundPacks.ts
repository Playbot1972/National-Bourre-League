/**
 * Sound registry — maps gameplay events to assets in public/sounds/.
 * Vite serves them at site root: /sounds/{file}.mp3 (or .wav when no MP3 on disk).
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
  | "moneygone"
  | "draw"
  | "draw1"
  | "draw2"
  | "draw3"
  | "draw4"
  | "draw5"
  | "Fahhh"
  | "fahhh"
  | "fahhhh"
  | "timer";

/** Event-driven keys used by feedback service and prefs. */
export type SoundEventKey =
  | "shuffle"
  | "shuffleFinal"
  | "draw"
  | "cardPlace"
  | "leadChange"
  | "trickWin"
  | "trickCollect"
  | "trickCollectOther"
  | "handWin"
  | "potWin"
  | "bigWin"
  | "bourre"
  | "gameStart"
  | "openRoom"
  | "deleteRoom"
  | "fold"
  | "cardSelect"
  | "cardIllegal"
  | "uiButton"
  | "turnTimer";

export const SOUND_PACK_LABELS: Record<SoundPackId, string> = {
  classic: "Classic",
  wood: "Wood & Felt",
  arcade: "Arcade",
};

export const DEFAULT_SOUND_PACK_ID: SoundPackId = "classic";

/**
 * Batch 1 — migrated cues served from public/sounds via Howler (/sounds/*).
 */
export const BATCH1_WAV_ASSET_IDS = [
  "card-place-normal",
  "card-place-heavy",
  "lead-sweetener-light",
  "lead-sweetener-strong",
  "trick-win-normal",
  "card-shuffle-normal",
  "card-select",
  "ui-button-press",
] as const satisfies readonly SoundAssetId[];

export type Batch1WavAssetId = (typeof BATCH1_WAV_ASSET_IDS)[number];

export function isBatch1WavAsset(assetId: SoundAssetId): assetId is Batch1WavAssetId {
  return (BATCH1_WAV_ASSET_IDS as readonly string[]).includes(assetId);
}

/** Grep-friendly batch-1 key → site-root asset URL. */
export const BATCH1_WAV_URLS: Record<Batch1WavAssetId, string> = {
  "card-place-normal": "/sounds/card-place-normal.mp3",
  "card-place-heavy": "/sounds/card-place-heavy.mp3",
  "lead-sweetener-light": "/sounds/lead-sweetener-light.mp3",
  "lead-sweetener-strong": "/sounds/lead-sweetener-strong.mp3",
  "trick-win-normal": "/sounds/trick-win-normal.mp3",
  "card-shuffle-normal": "/sounds/card-shuffle-normal.mp3",
  "card-select": "/sounds/card-select.mp3",
  "ui-button-press": "/sounds/ui-button-press.mp3",
};

/** Every committed classic asset — registered once in AudioManager. */
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
  "moneygone",
  "draw",
  "draw1",
  "draw2",
  "draw3",
  "draw4",
  "draw5",
  "Fahhh",
  "fahhh",
  "fahhhh",
  "timer",
] as const;

/** On-disk filenames for each asset ID (classic pack). */
export const SOUND_ASSET_FILES: Record<SoundAssetId, string> = {
  "card-place-normal": "card-place-normal.mp3",
  "card-place-heavy": "card-place-heavy.mp3",
  "card-place-soft": "card-place-soft.mp3",
  "lead-sweetener-light": "lead-sweetener-light.mp3",
  "lead-sweetener-strong": "lead-sweetener-strong.mp3",
  "trick-win-normal": "trick-win-normal.mp3",
  "trick-win-big": "trick-win-big.mp3",
  "hand-win-stinger": "hand-win-stinger.mp3",
  "card-shuffle-normal": "card-shuffle-normal.mp3",
  "card-shuffle-final": "card-shuffle-final.mp3",
  "card-select": "card-select.mp3",
  "card-illegal": "card-illegal.mp3",
  "ui-button-press": "ui-button-press.mp3",
  "coin-chime-light": "coin-chime-light.mp3",
  moneygone: "moneygone.mp3",
  draw: "draw.mp3",
  draw1: "draw1.mp3",
  draw2: "draw2.mp3",
  draw3: "draw3.mp3",
  draw4: "draw4.mp3",
  draw5: "draw5.mp3",
  Fahhh: "Fahhh.mp3",
  fahhh: "fahhh.mp3",
  fahhhh: "fahhhh.mp3",
  timer: "timer.mp3",
};

/** Count-based draw confirm cues — 1–5 cards map to draw1.mp3 … draw5.mp3. */
const DRAW_COUNT_ASSET_BY_COUNT: Record<1 | 2 | 3 | 4 | 5, SoundAssetId> = {
  1: "draw1",
  2: "draw2",
  3: "draw3",
  4: "draw4",
  5: "draw5",
};

export function resolveDrawCountAsset(cardCount: number): SoundAssetId {
  if (cardCount >= 1 && cardCount <= 5) {
    return DRAW_COUNT_ASSET_BY_COUNT[cardCount as 1 | 2 | 3 | 4 | 5];
  }
  return "draw";
}

export function drawCountAssetUrl(
  cardCount: number,
  packId: SoundPackId = DEFAULT_SOUND_PACK_ID,
): string {
  return soundAssetUrl(packId, resolveDrawCountAsset(cardCount));
}

/** Human-readable mapping for docs and QA. */
export const SOUND_EVENT_TO_ASSET: Record<SoundEventKey, SoundAssetId | SoundAssetId[]> = {
  shuffle: "card-shuffle-normal",
  shuffleFinal: "card-shuffle-final",
  draw: "draw",
  cardPlace: ["card-place-soft", "card-place-normal", "card-place-heavy"],
  leadChange: ["lead-sweetener-light", "lead-sweetener-strong"],
  trickWin: ["trick-win-normal", "trick-win-big"],
  trickCollect: "coin-chime-light",
  trickCollectOther: "moneygone",
  handWin: "coin-chime-light",
  potWin: "hand-win-stinger",
  bigWin: "hand-win-stinger",
  bourre: "Fahhh",
  gameStart: "card-shuffle-normal",
  openRoom: "card-shuffle-final",
  deleteRoom: "card-illegal",
  fold: "card-place-heavy",
  cardSelect: "card-select",
  cardIllegal: "card-illegal",
  uiButton: "ui-button-press",
  turnTimer: "timer",
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

/** Site-root sounds path — Vite public/sounds → /sounds/ */
export const SOUND_ASSETS_ROOT_PATH = "/sounds/";

/** Root-based URL for a pack asset, e.g. /sounds/card-select.mp3 */
export function soundAssetUrl(packId: SoundPackId, assetId: SoundAssetId): string {
  const subdir = PACK_SUBDIRS[packId] ?? "";
  return `${SOUND_ASSETS_ROOT_PATH}${subdir}${SOUND_ASSET_FILES[assetId]}`;
}

export function allSoundAssetUrls(packId: SoundPackId = DEFAULT_SOUND_PACK_ID): string[] {
  return ALL_SOUND_ASSET_IDS.map((id) => soundAssetUrl(packId, id));
}

/** @deprecated Use allSoundAssetUrls */
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
      // Batch 1: tier 1 (soft) deferred — alias to normal.
      return "card-place-normal";
    case "leadChange":
      return tier >= 2 ? "lead-sweetener-strong" : "lead-sweetener-light";
    case "trickWin":
      // Batch 1: trick-win-big deferred — always normal for now.
      return "trick-win-normal";
    case "trickCollect":
    case "handWin":
      return "coin-chime-light";
    case "trickCollectOther":
      return "moneygone";
    case "potWin":
    case "bigWin":
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
    case "turnTimer":
      return "timer";
  }
}

export function normalizeSoundPackId(value: unknown): SoundPackId {
  if (value === "wood" || value === "arcade") return value;
  return DEFAULT_SOUND_PACK_ID;
}

/** Whether an event is action-, animation-, or outcome-driven (see docs/audio-recon.md). */
export type SoundTriggerType = "action" | "animation" | "outcome";

export const SOUND_EVENT_TRIGGER_TYPE: Record<SoundEventKey, SoundTriggerType> = {
  shuffle: "animation",
  shuffleFinal: "animation",
  draw: "action",
  cardPlace: "animation",
  leadChange: "animation",
  trickWin: "animation",
  trickCollect: "animation",
  trickCollectOther: "animation",
  handWin: "outcome",
  potWin: "outcome",
  bigWin: "outcome",
  bourre: "outcome",
  gameStart: "action",
  openRoom: "action",
  deleteRoom: "action",
  fold: "action",
  cardSelect: "action",
  cardIllegal: "action",
  uiButton: "action",
  turnTimer: "outcome",
};
