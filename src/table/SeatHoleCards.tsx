import { memo } from "react";
import { PlayingCard } from "../components/PlayingCard";
import type { Rank, Suit } from "../types";
import type { SerializedCard } from "./types";

export interface SeatHoleCardsProps {
  playerId: string;
  cardsHeld: number;
  revealedTrumpIndex?: number | null;
  revealedTrumpUpcard?: SerializedCard | null;
  seatTrumpMergeActive?: boolean;
}

function SeatHoleCardsInner({
  playerId,
  cardsHeld,
  revealedTrumpIndex = null,
  revealedTrumpUpcard = null,
  seatTrumpMergeActive = false,
}: SeatHoleCardsProps) {
  return (
    <div
      className="bseat__hole-cards bseat__hole-cards--crown"
      aria-label={`${cardsHeld} cards in hand`}
      data-trick-play-origin={playerId}
    >
      {Array.from({ length: cardsHeld }, (_, i) => {
        const isTrumpSlot = revealedTrumpIndex === i && revealedTrumpUpcard;
        return (
          <div
            key={i}
            className={[
              "bseat__hole-card",
              isTrumpSlot ? "bseat__hole-card--trump-revealed" : "",
              isTrumpSlot && seatTrumpMergeActive ? "bseat__hole-card--trump-merge" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ ["--hole-i" as string]: i }}
          >
            {isTrumpSlot ? (
              <PlayingCard
                card={{
                  rank: revealedTrumpUpcard!.rank as Rank,
                  suit: revealedTrumpUpcard!.suit as Suit,
                }}
                size="xs"
                state="trump"
              />
            ) : (
              <PlayingCard faceDown size="xs" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export const SeatHoleCards = memo(SeatHoleCardsInner);
