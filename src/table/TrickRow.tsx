import { useEffect } from "react";
import { TrickPlaySlot, type CardLandedAudioCallbackInput } from "./TrickPlaySlot";
import { isGameFlowDebugEnabled, logGameFlow } from "./gameFlowDebug";
import type { TrickPlay, TrickPresentationPhase } from "./trickTiming";
import { resolveTrickLayoutCardCount } from "./trickRowLayout";

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
  revealCatchUp?: boolean;
  /** Peak play count — reserves trick row width so the center cluster does not reflow mid-trick. */
  peakCardCount?: number;
  /** Seated players in the hand — reserves full trick width from trick start. */
  participantCount?: number;
  currentUserId?: string | null;
  onCardLanded?: (input: CardLandedAudioCallbackInput) => void;
}

/** Public trick cards only — never hole cards. */
export function TrickRow({
  displayPlays = [],
  leaderPlayerId = null,
  winnerPlayerId = null,
  showWinnerTag = false,
  presentationPhase = "live",
  playerNames = {},
  variant = "live",
  instantTrickPlays: _instantTrickPlays = false,
  revealCatchUp = false,
  peakCardCount = 0,
  participantCount = 0,
  currentUserId = null,
  onCardLanded,
}: TrickRowProps) {
  useEffect(() => {
    if (!isGameFlowDebugEnabled()) return;
    logGameFlow("TrickRow", displayPlays.length === 0 ? "trick-empty" : "trick-cards", {
      count: displayPlays.length,
      phase: presentationPhase,
    });
  }, [displayPlays.length, presentationPhase]);

  const { layoutCardCount, trickActive } = resolveTrickLayoutCardCount(
    displayPlays.length,
    peakCardCount,
    participantCount,
  );

  if (displayPlays.length === 0 && !trickActive) {
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

  if (displayPlays.length === 0 && trickActive) {
    return (
      <div
        className="btrick btrick--reserved muted small"
        aria-hidden="true"
        data-testid="trick-row"
        data-trick-phase={presentationPhase}
        data-trick-card-count="0"
        data-trick-layout-count={layoutCardCount}
        data-trick-variant={variant}
      >
        <div className="btrick__surface">
          <div
            className="btrick__cards btrick__cards--reserved"
            style={{ ["--trick-card-count" as string]: layoutCardCount }}
          />
        </div>
      </div>
    );
  }

  const winnerName = winnerPlayerId ? (playerNames[winnerPlayerId] ?? "Player") : null;

  const isHold =
    presentationPhase === "trickComplete" ||
    presentationPhase === "winnerReveal";

  const isRake =
    presentationPhase === "collectTrick";

  const isEcho = variant === "echo";

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
              instantPlace={false}
              revealCatchUp={revealCatchUp}
              currentUserId={currentUserId}
              onCardLanded={onCardLanded}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
