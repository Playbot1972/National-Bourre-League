import { PlayingCard } from "../components/PlayingCard";
import { serializedToCard } from "./handUi";
import type { CurrentTrickState, PlayedCardEntry } from "./types";

interface TrickRowProps {
  currentTrick?: CurrentTrickState | null;
  playedCards?: PlayedCardEntry[];
  playerNames?: Record<string, string>;
}

/** Public trick cards only — never hole cards. */
export function TrickRow({ currentTrick, playedCards = [], playerNames = {} }: TrickRowProps) {
  const plays =
    currentTrick?.plays?.length
      ? currentTrick.plays
      : playedCards.length
        ? playedCards
            .filter((p) => p.trickNumber === (currentTrick?.trickNumber ?? 1))
            .map((p) => ({ playerId: p.playerId, card: p.card }))
        : [];

  if (plays.length === 0) {
    return (
      <div className="btrick btrick--empty muted small" aria-hidden="true">
        Trick
      </div>
    );
  }

  return (
    <div className="btrick" aria-label="Current trick">
      {plays.map((play, i) => (
        <div key={`${play.playerId}-${i}`} className="btrick__play">
          <PlayingCard card={serializedToCard(play.card)} size="sm" />
          <span className="btrick__name muted small">
            {playerNames[play.playerId] ?? "Player"}
          </span>
        </div>
      ))}
    </div>
  );
}
