import { PlayingCard } from "../components/PlayingCard";
import { resolveTrickWinner } from "../game/trick";
import { SUIT_SYMBOL, type Rank, type Suit } from "../types";
import { formatHandPhase, formatTrumpSuit } from "./handUi";
import { formatRiskStake } from "./logic";
import { TrickRow } from "./TrickRow";
import type { DrawAnimSubPhase } from "./handPresentationTiming";
import { completedTrickPlays, type TrickPlay, type TrickPresentationPhase } from "./trickTiming";
import type { PlayedCardEntry, PotMetrics, SerializedCard } from "./types";

interface PotCenterProps {
  potMetrics: PotMetrics;
  participantCount: number;
  trumpUpcard?: SerializedCard | null;
  trumpSuit?: string | null;
  phase?: string | null;
  enrollmentActive?: boolean;
  remainingDeckCount?: number | null;
  trickDisplayPlays?: TrickPlay[];
  trickWinnerPlayerId?: string | null;
  trickShowWinnerTag?: boolean;
  trickPresentationPhase?: TrickPresentationPhase;
  playerNames?: Record<string, string>;
  anteAnimActive?: boolean;
  trumpRevealActive?: boolean;
  drawAnimPlayerId?: string | null;
  drawAnimSubPhase?: DrawAnimSubPhase;
  drawDiscardCount?: number;
  settleAnimActive?: boolean;
  settleCarryOver?: boolean;
  playedCards?: PlayedCardEntry[];
  handComplete?: boolean;
  potTick?: number;
  trumpReminderPulse?: number;
  /** Hide center trump card when the holder already shows it in their fan. */
  hideCenterTrump?: boolean;
  /** Force suit badge when trump card is visually merged into holder hand. */
  showTrumpSuitReminder?: boolean;
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
  trickWinnerPlayerId = null,
  trickShowWinnerTag = false,
  trickPresentationPhase = "live",
  playerNames = {},
  anteAnimActive = false,
  trumpRevealActive = false,
  drawAnimPlayerId = null,
  drawAnimSubPhase = "done",
  drawDiscardCount = 0,
  settleAnimActive = false,
  settleCarryOver = false,
  playedCards = [],
  handComplete = false,
  potTick = 0,
  trumpReminderPulse = 0,
  hideCenterTrump = false,
  showTrumpSuitReminder: showTrumpSuitReminderProp = false,
}: PotCenterProps) {
  const phaseLabel = formatHandPhase(phase, enrollmentActive);
  const hasTrumpCard = Boolean(trumpUpcard) && !hideCenterTrump;
  const showTrumpSuitReminder =
    showTrumpSuitReminderProp ||
    (!hasTrumpCard && Boolean(trumpSuit) && phase === "play");
  const trumpKey = hasTrumpCard ? `${trumpUpcard!.rank}-${trumpUpcard!.suit}` : "none";
  const trickResolving = trickPresentationPhase !== "live" && trickPresentationPhase !== "nextLeadReady";
  const liveTrickCardCount = trickDisplayPlays.length;
  const finalTrickNumber =
    playedCards.length > 0 ? Math.max(...playedCards.map((entry) => entry.trickNumber)) : 0;
  const echoPlays: TrickPlay[] =
    finalTrickNumber > 0
      ? completedTrickPlays({
          prevTrick: null,
          playedCards,
          trickNumber: finalTrickNumber,
        })
      : [];
  const echoLeadSuit = echoPlays[0]?.card.suit ?? null;
  const echoWinnerId =
    echoPlays.length > 0 && echoLeadSuit && trumpSuit
      ? resolveTrickWinner(
          echoPlays.map((play) => ({
            playerId: play.playerId,
            card: { rank: play.card.rank as Rank, suit: play.card.suit as Suit },
          })),
          echoLeadSuit as Suit,
          trumpSuit as Suit,
        )
      : null;
  const showFinalTrickEcho =
    settleAnimActive && liveTrickCardCount === 0 && echoPlays.length > 0;

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
          >
            <PlayingCard
              card={{
                rank: trumpUpcard!.rank as Rank,
                suit: trumpUpcard!.suit as Suit,
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
            key={trumpReminderPulse > 0 ? `trump-reminder-${trumpReminderPulse}` : "trump-reminder"}
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
          showFinalTrickEcho ? "center-play--final-trick-echo" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-trick-phase={trickPresentationPhase}
        data-trick-cards={liveTrickCardCount}
        data-hand-settling={settleAnimActive ? "true" : "false"}
        data-hand-complete={handComplete ? "true" : "false"}
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

        {(drawAnimPlayerId && drawAnimSubPhase === "discard" && drawDiscardCount > 0) && (
          <div className="center-play__discard" aria-hidden="true">
            {Array.from({ length: drawDiscardCount }, (_, i) => (
              <span key={i} className="center-play__discard-card" style={{ ["--discard-i" as string]: i }} />
            ))}
          </div>
        )}
        <div className="center-play__phase" aria-live="polite">
          <span className={`bpot__phase-tag bpot__phase-tag--${phase ?? "waiting"}`}>
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
              winnerPlayerId={trickWinnerPlayerId}
              showWinnerTag={trickShowWinnerTag}
              presentationPhase={trickPresentationPhase}
              playerNames={playerNames}
            />
          </div>
          {showFinalTrickEcho && (
            <div className="center-play__trick-echo" aria-hidden="true">
              <TrickRow
                variant="echo"
                displayPlays={echoPlays}
                winnerPlayerId={echoWinnerId}
                showWinnerTag
                presentationPhase="winnerReveal"
                playerNames={playerNames}
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
            <dt>Pot</dt>
            <dd>{formatRiskStake(potMetrics.currentPot)}</dd>
          </div>
          <div className="bpot__stat" data-testid="ante-display">
            <dt>Ante</dt>
            <dd>{formatRiskStake(potMetrics.anteAmount)}</dd>
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
