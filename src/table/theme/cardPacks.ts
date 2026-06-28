/** Visual card face/back presets — CSS-driven, no image assets required. */
export type CardPackId = "classic" | "elegant" | "casino" | "midnight";

export const CARD_PACK_LABELS: Record<CardPackId, string> = {
  classic: "Classic",
  elegant: "Elegant",
  casino: "Casino",
  midnight: "Midnight",
};

export const DEFAULT_CARD_PACK_ID: CardPackId = "classic";

export function normalizeCardPackId(value: unknown): CardPackId {
  if (value === "elegant" || value === "casino" || value === "midnight") return value;
  return DEFAULT_CARD_PACK_ID;
}
