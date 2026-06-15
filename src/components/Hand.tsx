import { PlayingCard, type CardState } from "./PlayingCard";
import type { Card } from "../types";
import "./Hand.css";

interface HandProps {
  cards: Card[];
  size?: "sm" | "md" | "lg";
  stateFor?: (card: Card, index: number) => CardState;
  badgeFor?: (card: Card, index: number) => string | undefined;
  onCardClick?: (card: Card, index: number) => void;
  onCardPeek?: (index: number | null) => void;
  peekIndex?: number | null;
  fan?: boolean;
  /** Applied to each card button when set (e.g. play phase smoke tests). */
  cardTestId?: string;
}

const keyFor = (c: Card, i: number) => `${c.rank}-${c.suit}-${i}`;

export function Hand({
  cards,
  size = "md",
  stateFor,
  badgeFor,
  onCardClick,
  onCardPeek,
  peekIndex = null,
  fan = false,
  cardTestId,
}: HandProps) {
  return (
    <div className={`hand ${fan ? "hand--fan" : ""}`}>
      {cards.map((c, i) => (
        <div
          className={[
            "hand__slot",
            peekIndex === i ? "hand__slot--peek" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          key={keyFor(c, i)}
          onPointerDown={onCardPeek ? () => onCardPeek(i) : undefined}
          onPointerUp={onCardPeek ? () => onCardPeek(null) : undefined}
          onPointerLeave={onCardPeek ? () => onCardPeek(null) : undefined}
        >
          <PlayingCard
            card={c}
            size={size}
            state={stateFor?.(c, i) ?? "default"}
            badge={badgeFor?.(c, i)}
            onClick={onCardClick ? () => onCardClick(c, i) : undefined}
            data-testid={cardTestId}
          />
        </div>
      ))}
    </div>
  );
}
