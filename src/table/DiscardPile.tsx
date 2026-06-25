import { PlayingCard } from "../components/PlayingCard";
import type { DiscardPileCard } from "./discardPileModel";

interface DiscardPileProps {
  cards: DiscardPileCard[];
}

/** Messy center-table discard pile — anchor for flying card animations. */
export function DiscardPile({ cards }: DiscardPileProps) {
  return (
    <div
      className="discard-pile"
      data-discard-pile-anchor
      data-testid="discard-pile"
      aria-label={`Discard pile, ${cards.length} card${cards.length === 1 ? "" : "s"}`}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className="discard-pile__card"
          style={{
            ["--pile-x" as string]: `${card.offsetX}px`,
            ["--pile-y" as string]: `${card.offsetY}px`,
            ["--pile-rot" as string]: `${card.rotation}deg`,
            ["--pile-scale" as string]: String(card.scale),
            zIndex: card.zIndex,
          }}
        >
          <PlayingCard faceDown size="sm" />
        </div>
      ))}
    </div>
  );
}
