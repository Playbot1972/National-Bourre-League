import { PlayingCard } from "../components/PlayingCard";
import { TrickPlaySlot } from "./TrickPlaySlot";
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
      <div
        className="btrick btrick--empty muted small"
        aria-hidden="true"
        data-testid="trick-row"
        data-trick-phase={presentationPhase}
        data-trick-card-count="0"
      >
        Trick
      </div>
    );
  }

  const winnerName = winnerPlayerId ? (playerNames[winnerPlayerId] ?? "Player") : null;

  const isHold =
    presentationPhase === "trickComplete" ||
    presentationPhase === "winnerReveal";
  const isSweep =
    presentationPhase === "collectTrick" ||
    presentationPhase === "nextLeadReady";

  return (
    <div
      className={[
        "btrick",
        isHold ? "btrick--hold" : "",
        isSweep ? "btrick--sweep" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Current trick"
      aria-live="polite"
      data-testid="trick-row"
      data-trick-phase={presentationPhase}
      data-trick-card-count={displayPlays.length}
    >
      {showWinnerTag && winnerName && (
        <div className="btrick__winner-tag" data-testid="trick-winner-tag">
          {winnerName} takes it
        </div>
      )}
      {displayPlays.map((play, i) => (
        <TrickPlaySlot
          key={`${play.playerId}-${play.card.rank}-${play.card.suit}-${i}`}
          play={play}
          index={i}
          presentationPhase={presentationPhase}
          displayCount={displayPlays.length}
          playerName={playerNames[play.playerId] ?? "Player"}
          winnerPlayerId={winnerPlayerId}
          showWinnerTag={showWinnerTag}
        />
      ))}
    </div>
  );
}
