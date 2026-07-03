import { memo, useEffect } from "react";
import { TrickPlaySlot } from "./TrickPlaySlot";
import { isGameFlowDebugEnabled, logGameFlow } from "./gameFlowDebug";
import { resolveTrickRowPresentationClasses } from "./trickRowPresentation";
import type { TrickPlay, TrickPresentationPhase } from "./trickTiming";

interface TrickRowProps {
  displayPlays: TrickPlay[];
  leaderPlayerId?: string | null;
  winnerPlayerId?: string | null;
  showWinnerTag?: boolean;
  presentationPhase?: TrickPresentationPhase;
  playerNames?: Record<string, string>;
  /** Presentation-only: CSS-driven final-trick echo when the live row clears early. */
  variant?: "live" | "echo";
  instantTrickPlays?: boolean;
  /** Peak play count — reserves trick row width so the center cluster does not reflow mid-trick. */
  peakCardCount?: number;
}

/** Public trick cards only — never hole cards. */
function TrickRowInner({
  displayPlays = [],
  leaderPlayerId = null,
  winnerPlayerId = null,
  showWinnerTag = false,
  presentationPhase = "live",
  playerNames = {},
  variant = "live",
  instantTrickPlays = false,
  peakCardCount = 0,
}: TrickRowProps) {
  useEffect(() => {
    if (!isGameFlowDebugEnabled()) return;
    logGameFlow("TrickRow", displayPlays.length === 0 ? "trick-empty" : "trick-cards", {
      count: displayPlays.length,
      phase: presentationPhase,
    });
  }, [displayPlays.length, presentationPhase]);

  const layoutCardCount = Math.max(displayPlays.length, peakCardCount, 1);

  if (displayPlays.length === 0) {
    return (
      <div
        className="btrick btrick--empty muted small"
        aria-hidden="true"
        data-testid="trick-row"
        data-trick-phase={presentationPhase}
        data-trick-card-count="0"
        data-trick-variant={variant}
      >
        <div className="btrick__surface">
          <span className="btrick__placeholder">Trick</span>
        </div>
      </div>
    );
  }

  const winnerName = winnerPlayerId ? (playerNames[winnerPlayerId] ?? "Player") : null;

  const { isHold, isRake, isEcho } = resolveTrickRowPresentationClasses(
    presentationPhase,
    variant,
  );

  return (
    <div
      className={[
        "btrick",
        isEcho ? "btrick--echo-pipeline" : "",
        isHold ? "btrick--hold" : "",
        isRake ? "btrick--rake" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={isEcho ? undefined : "Current trick"}
      aria-hidden={isEcho ? true : undefined}
      aria-live={isEcho ? undefined : "polite"}
      data-testid={isEcho ? "trick-row-echo" : "trick-row"}
      data-trick-phase={presentationPhase}
      data-trick-card-count={displayPlays.length}
      data-trick-variant={variant}
    >
      <div className="btrick__surface">
        {showWinnerTag && winnerName && (
          <div className="btrick__winner-tag" data-testid="trick-winner-tag">
            {winnerName} takes it
          </div>
        )}
        <div
          className="btrick__cards"
          role="list"
          aria-label="Cards in trick"
          style={{ ["--trick-card-count" as string]: layoutCardCount }}
        >
          {displayPlays.map((play, i) => (
            <TrickPlaySlot
              key={`${play.playerId}-${play.card.rank}-${play.card.suit}`}
              play={play}
              index={i}
              presentationPhase={isEcho ? "winnerReveal" : presentationPhase}
              displayCount={displayPlays.length}
              playerName={playerNames[play.playerId] ?? "Player"}
              leaderPlayerId={leaderPlayerId}
              winnerPlayerId={winnerPlayerId}
              instantPlace={instantTrickPlays}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const TrickRow = memo(TrickRowInner);
