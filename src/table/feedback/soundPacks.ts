/** Sound theme registry — asset paths per pack, procedural fallbacks in audio.ts. */
export type SoundPackId = "classic" | "wood" | "arcade";

export type SoundEventKey =
  | "shuffle"
  | "draw"
  | "trickWin"
  | "bigWin"
  | "bourre"
  | "gameStart";

export const SOUND_PACK_LABELS: Record<SoundPackId, string> = {
  classic: "Classic",
  wood: "Wood & Felt",
  arcade: "Arcade",
};

export const DEFAULT_SOUND_PACK_ID: SoundPackId = "classic";

const PACK_SUBDIRS: Record<SoundPackId, string> = {
  classic: "",
  wood: "packs/wood/",
  arcade: "packs/arcade/",
};

const SOUND_FILENAMES: Record<SoundEventKey, string> = {
  shuffle: "shuffle.mp3",
  draw: "draw.mp3",
  trickWin: "trick-win.mp3",
  bigWin: "big-win.mp3",
  bourre: "bourre.mp3",
  gameStart: "game-start.mp3",
};

/** Relative to social app root (docs/ → /social/ after deploy). */
export function soundAssetPath(packId: SoundPackId, event: SoundEventKey): string {
  const subdir = PACK_SUBDIRS[packId] ?? "";
  return `./sounds/${subdir}${SOUND_FILENAMES[event]}`;
}

export function allSoundAssetPaths(packId: SoundPackId): string[] {
  return (Object.keys(SOUND_FILENAMES) as SoundEventKey[]).map((event) =>
    soundAssetPath(packId, event),
  );
}

export function normalizeSoundPackId(value: unknown): SoundPackId {
  if (value === "wood" || value === "arcade") return value;
  return DEFAULT_SOUND_PACK_ID;
}
