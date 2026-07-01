import { memo } from "react";
import { PlayingCard } from "../components/PlayingCard";

export interface SeatWonTrickPileProps {
  playerId: string;
  trickCount: number;
}

function SeatWonTrickPileInner({ playerId, trickCount }: SeatWonTrickPileProps) {
  const visibleCount = Math.min(trickCount, 5);
  return (
    <div
      className="bseat__won-trick-pile"
      data-won-trick-pile-anchor={playerId}
      aria-hidden={false}
      data-trick-count={trickCount}
    >
      {Array.from({ length: visibleCount }, (_, i) => (
        <div key={i} className="bseat__won-trick-pile-card" style={{ ["--book-i" as string]: i }}>
          <PlayingCard faceDown size="xs" />
        </div>
      ))}
    </div>
  );
}

export const SeatWonTrickPile = memo(SeatWonTrickPileInner);
