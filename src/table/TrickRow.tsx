import { PlayingCard } from "../components/PlayingCard";
import { serializedToCard } from "./handUi";
import type { TrickPlay, TrickPresentationPhase } from "./trickTiming";

interface TrickRowProps {
  displayPlays: TrickPlay[];
  winnerPlayerId?: string | null;
  showWinnerTag?: boolean;
  presentationPhase?: TrickPresentationPhase;
  playerNames?: Record<string, string>;
}

/** Public trick cards only — never hole cards. */
export function TrickRow({
  displayPlays = [],
  winnerPlayerId = null,
  showWinnerTag = false,
  presentationPhase = "live",
  playerNames = {},
}: TrickRowProps) {
  if (displayPlays.length === 0) {
    return (
      <div className="btrick btrick--empty muted small" aria-hidden="true">
        Trick
      </div>
    );
  }

  const winnerName = winnerPlayerId ? (playerNames[winnerPlayerId] ?? "Player") : null;

  return (
    <div
      className={[
        "btrick",
        presentationPhase === "hold" ? "btrick--hold" : "",
        presentationPhase === "sweep" ? "btrick--sweep" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Current trick"
      aria-live="polite"
    >
      {showWinnerTag && winnerName && (
        <div className="btrick__winner-tag" data-testid="trick-winner-tag">
          {winnerName} takes it
        </div>
      )}
      {displayPlays.map((play, i) => {
        const isWinner = winnerPlayerId != null && play.playerId === winnerPlayerId;
        const isNewest = i === displayPlays.length - 1 && presentationPhase === "live";
        return (
          <div
            key={`${play.playerId}-${play.card.rank}-${play.card.suit}-${i}`}
            className={[
              "btrick__play",
              isNewest ? "btrick__play--land" : "",
              isWinner && presentationPhase !== "live" ? "btrick__play--winner" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <PlayingCard
              card={serializedToCard(play.card)}
              size="sm"
              state={isWinner && presentationPhase !== "live" ? "winner" : "default"}
            />
            <span className="btrick__name muted small">
              {playerNames[play.playerId] ?? "Player"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
