import type { SerializedCard } from "./types";

/** True when the hero hand dock has no active cards to show (preferred big-pot region). */
export function isHeroCardAreaEmpty(cards: readonly SerializedCard[] | undefined): boolean {
  return (cards?.length ?? 0) === 0;
}
