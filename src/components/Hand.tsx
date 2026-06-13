import { PlayingCard, type CardState } from "./PlayingCard";
import type { Card } from "../types";
import "./Hand.css";

interface HandProps {
  cards: Card[];
  size?: "sm" | "md" | "lg";
  stateFor?: (card: Card, index: number) => CardState;
  badgeFor?: (card: Card, index: number) => string | undefined;
  onCardClick?: (card: Card, index: number) => void;
  fan?: boolean;
}

const keyFor = (c: Card, i: number) => `${c.rank}-${c.suit}-${i}`;

export function Hand({
  cards,
  size = "md",
  stateFor,
  badgeFor,
  onCardClick,
  fan = false,
}: HandProps) {
  return (
    <div className={`hand ${fan ? "hand--fan" : ""}`}>
      {cards.map((c, i) => (
        <div className="hand__slot" key={keyFor(c, i)}>
          <PlayingCard
            card={c}
            size={size}
            state={stateFor?.(c, i) ?? "default"}
            badge={badgeFor?.(c, i)}
            onClick={onCardClick ? () => onCardClick(c, i) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
