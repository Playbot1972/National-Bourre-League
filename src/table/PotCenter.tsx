import { useEffect, useState } from "react";
import { PlayingCard } from "../components/PlayingCard";
import { SUIT_SYMBOL, type Rank, type Suit } from "../types";
import { formatHandPhase, formatTrumpSuit } from "./handUi";
import { currentTrickLeaderId } from "./trickTiming";
import { formatAnteStake, formatRiskStake } from "./logic";
import { TrickRow } from "./TrickRow";
import type { CardLandedAudioCallbackInput } from "./TrickPlaySlot";
import { DiscardPile } from "./DiscardPile";
import type { DiscardPileCard } from "./discardPileModel";
import type { DrawAnimSubPhase } from "./handPresentationTiming";
import type { TrickPlay, TrickPresentationPhase } from "./trickTiming";
import { CARD_LAND_MS } from "./trickTiming";
import type { PotMetrics, SerializedCard } from "./types";

interface PotCenterProps {
  potMetrics: PotMetrics;
  participantCount: number;
  trumpUpcard?: SerializedCard | null;
  trumpSuit?: string | null;
  phase?: string | null;
  enrollmentActive?: boolean;
  remainingDeckCount?: number | null;
  trickDisplayPlays?: TrickPlay[];
  trickLeadSuit?: string | null;
  trickLeaderPlayerId?: string | null;
  trickWinnerPlayerId?: string | null;
  trickShowWinnerTag?: boolean;
  trickPresentationPhase?: TrickPresentationPhase;
  trickEchoPlays?: TrickPlay[];
  trickEchoWinnerId?: string | null;
  trickEchoPhase?: TrickPresentationPhase;
  showFinalTrickEcho?: boolean;
  playerNames?: Record<string, string>;
  anteAnimActive?: boolean;
  trumpRevealActive?: boolean;
  drawAnimPlayerId?: string | null;
  drawAnimSubPhase?: DrawAnimSubPhase;
  drawDiscardCount?: number;
  settleAnimActive?: boolean;
  settleCarryOver?: boolean;
  potTick?: number;
  trumpReminderPulse?: number;
  /** Hide center trump card when the holder already shows it in their fan. */
  hideCenterTrump?: boolean;
  /** Force suit badge when trump card is visually merged into holder hand. */
  showTrumpSuitReminder?: boolean;
  instantTrickPlays?: boolean;
  /** Peak stable trick play count — defers trump swap while stagger catches up. */
  peakTrickPlayCount?: number;
  discardPileCards?: DiscardPileCard[];
  currentUserId?: string | null;
  onCardLanded?: (input: CardLandedAudioCallbackInput) => void;
}

export function PotCenter({
  potMetrics,
  participantCount,
  trumpUpcard,
  trumpSuit,
  phase,
  enrollmentActive = false,
  remainingDeckCount,
  trickDisplayPlays = [],
  trickLeadSuit = null,
  trickLeaderPlayerId: trickLeaderPlayerIdProp = null,
  trickWinnerPlayerId = null,
  trickShowWinnerTag = false,
  trickPresentationPhase = "live",
  trickEchoPlays = [],
  trickEchoWinnerId = null,
  trickEchoPhase = "live",
  showFinalTrickEcho = false,
  playerNames = {},
  anteAnimActive = false,
  trumpRevealActive = false,
  drawAnimPlayerId: _drawAnimPlayerId = null,
  drawAnimSubPhase: _drawAnimSubPhase = "done",
  drawDiscardCount: _drawDiscardCount = 0,
  settleAnimActive = false,
  settleCarryOver = false,
  potTick = 0,
  trumpReminderPulse = 0,
  hideCenterTrump = false,
  showTrumpSuitReminder: showTrumpSuitReminderProp = false,
  instantTrickPlays = false,
  peakTrickPlayCount = 0,
  discardPileCards = [],
  currentUserId = null,
  onCardLanded,
}: PotCenterProps) {
  const phaseLabel = formatHandPhase(phase, enrollmentActive);
  const trickLeaderPlayerId =
    trickLeaderPlayerIdProp ??
    ((trickPresentationPhase === "live" || trickPresentationPhase === "trickComplete") &&
    trickDisplayPlays.length > 0
      ? currentTrickLeaderId(
          trickDisplayPlays,
          trickLeadSuit ?? trickDisplayPlays[0]?.card.suit ?? null,
          trumpSuit ?? null,
        )
      : null);
  const trickResolving = trickPresentationPhase !== "live" && trickPresentationPhase !== "nextLeadReady";
  const liveTrickCardCount = trickDisplayPlays.length;
  const trickPlaysPending =
    liveTrickCardCount > 0 ||
    peakTrickPlayCount > liveTrickCardCount ||
    instantTrickPlays;

  /** Defer trump upcard → suit-badge swap while trick cards are landing. */
  const [displayTrumpUpcard, setDisplayTrumpUpcard] = useState(trumpUpcard ?? null);
  useEffect(() => {
    if (trumpUpcard) {
      setDisplayTrumpUpcard(trumpUpcard);
      return;
    }
    if (!displayTrumpUpcard) return;
    if (trickPlaysPending || trickResolving) {
      const id = window.setTimeout(() => setDisplayTrumpUpcard(null), CARD_LAND_MS + 200);
      return () => window.clearTimeout(id);
    }
    setDisplayTrumpUpcard(null);
  }, [trumpUpcard, trickPlaysPending, trickResolving, displayTrumpUpcard]);

  const hasTrumpCard = Boolean(displayTrumpUpcard) && !hideCenterTrump;
  const showTrumpSuitReminder =
    showTrumpSuitReminderProp ||
    (!hasTrumpCard && Boolean(trumpSuit) && phase === "play");
  const trumpKey = hasTrumpCard ? `${displayTrumpUpcard!.rank}-${displayTrumpUpcard!.suit}` : "trump-slot";
  const finalTrickEcho =
    showFinalTrickEcho || (settleAnimActive && trickEchoPlays.length > 0 && liveTrickCardCount === 0);

  return (
    <div className="table-center-cluster" aria-label="Table center">
      <div className="deck-stack" aria-label="Deck and trump">
        {hasTrumpCard ? (
          <div
            key={trumpKey}
            className={[
              "deck-stack__trump",
              "bpot__trump--deal",
              trumpRevealActive ? "bpot__trump--reveal" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            data-testid="trump-button"
            data-trump-deal-target=""
          >
            <PlayingCard
              card={{
                rank: displayTrumpUpcard!.rank as Rank,
                suit: displayTrumpUpcard!.suit as Suit,
              }}
              size="sm"
              state="trump"
            />
            <span className="deck-stack__label muted small">Trump</span>
          </div>
        ) : showTrumpSuitReminder ? (
          <div
            className={[
              "deck-stack__trump",
              "deck-stack__trump--suit-reminder",
              trumpReminderPulse > 0 ? "deck-stack__trump--suit-reminder-pulse" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key="trump-reminder"
            data-testid="trump-suit-reminder"
            aria-label={`Trump suit: ${formatTrumpSuit(trumpSuit)}`}
          >
            <div
              className={`trump-suit-badge trump-suit-badge--${trumpSuit}`}
              aria-hidden="true"
            >
              {SUIT_SYMBOL[trumpSuit as Suit]}
            </div>
            <span className="deck-stack__label muted small">Trump</span>
          </div>
        ) : (
          <div className="deck-stack__pile" data-testid="deal-button" aria-hidden="true">
            <div className="deck-stack__card deck-stack__card--back" />
            <div className="deck-stack__card deck-stack__card--back deck-stack__card--offset" />
            <span className="deck-stack__label muted small">
              {enrollmentActive ? "Dealing" : "Deck"}
            </span>
          </div>
        )}
        {remainingDeckCount != null && remainingDeckCount > 0 && (
          <span className="deck-stack__count muted small">{remainingDeckCount} left</span>
        )}
      </div>

      <div
        className={[
          "center-play",
          anteAnimActive ? "center-play--ante-in" : "",
          settleAnimActive ? "center-play--settle" : "",
          settleCarryOver ? "center-play--carry" : "",
          trickResolving ? "center-play--trick-resolving" : "",
          finalTrickEcho ? "center-play--final-trick-echo" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-trick-phase={trickPresentationPhase}
        data-trick-cards={liveTrickCardCount}
        data-hand-settling={settleAnimActive ? "true" : "false"}
      >
        {anteAnimActive && (
          <div className="bpot__ante-chips" aria-hidden="true">
            {Array.from({ length: Math.min(participantCount, 8) }, (_, i) => (
              <span
                key={i}
                className="bpot__ante-chip"
                style={{ ["--ante-i" as string]: i }}
              />
            ))}
          </div>
        )}

        {phase === "draw" ? <DiscardPile cards={discardPileCards} /> : null}

        <div
          className={[
            "center-play__phase",
            phase === "play" ? "center-play__phase--play" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-live="polite"
        >
          <span
            className="btable-sr-only"
            data-testid="phase-tag-center"
            data-phase={phase ?? "waiting"}
          >
            {phaseLabel}
          </span>
          {hasTrumpCard && trumpSuit && (
            <span className="center-play__trump-suit muted small">
              {formatTrumpSuit(trumpSuit)}
            </span>
          )}
          {showTrumpSuitReminder && (
            <span className="center-play__trump-suit center-play__trump-suit--reminder muted small">
              {formatTrumpSuit(trumpSuit)} trump
            </span>
          )}
        </div>

        <div className="center-play__trick-stage">
          <div className="center-play__trick-live">
            <TrickRow
              displayPlays={trickDisplayPlays}
              leaderPlayerId={trickLeaderPlayerId}
              winnerPlayerId={trickWinnerPlayerId}
              showWinnerTag={trickShowWinnerTag}
              presentationPhase={trickPresentationPhase}
              playerNames={playerNames}
              instantTrickPlays={instantTrickPlays}
              peakCardCount={peakTrickPlayCount}
              participantCount={participantCount}
              currentUserId={currentUserId}
              onCardLanded={onCardLanded}
            />
          </div>
          {finalTrickEcho && (
            <div className="center-play__trick-echo" aria-hidden="true">
              <TrickRow
                displayPlays={trickEchoPlays}
                winnerPlayerId={trickEchoWinnerId}
                showWinnerTag
                presentationPhase={trickEchoPhase}
                playerNames={playerNames}
                variant="echo"
              />
            </div>
          )}
        </div>

        <dl className="center-play__stats">
          <div
            className={`bpot__stat bpot__stat--pot${potTick > 0 ? " bpot__stat--tick" : ""}`}
            data-testid="pot-display"
            key={potTick > 0 ? `pot-${potTick}` : "pot-static"}
          >
            <dt>Table pot</dt>
            <dd>{formatRiskStake(potMetrics.currentPot)}</dd>
          </div>
          <div className="bpot__stat" data-testid="ante-display">
            <dt>Ante / hand</dt>
            <dd>{formatAnteStake(potMetrics.anteAmount)}</dd>
          </div>
          {potMetrics.limEnabled && (
            <>
              <div className="bpot__stat">
                <dt>Cap</dt>
                <dd>
                  {formatRiskStake(potMetrics.potCap)}
                  <span className="bpot__lim-tag">LmT</span>
                </dd>
              </div>
              <div className="bpot__stat bpot__stat--highlight">
                <dt>Max win</dt>
                <dd>{formatRiskStake(potMetrics.maxWinThisHand)}</dd>
              </div>
            </>
          )}
        </dl>

        {potMetrics.limEnabled && potMetrics.overflow > 0 && (
          <div className="center-play__carry muted small">
            +{formatRiskStake(potMetrics.overflow)} carry
          </div>
        )}

        <div className="center-play__meta muted small">
          {participantCount} in hand
        </div>
      </div>
    </div>
  );
}
