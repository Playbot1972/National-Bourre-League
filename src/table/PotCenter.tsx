import { PlayingCard } from "../components/PlayingCard";
import { SUIT_SYMBOL, type Rank, type Suit } from "../types";
import { formatHandPhase, formatTrumpSuit } from "./handUi";
import { formatRiskStake } from "./logic";
import { TrickRow } from "./TrickRow";
import type { TrickPlay, TrickPresentationPhase } from "./trickTiming";
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
  trickWinnerPlayerId?: string | null;
  trickShowWinnerTag?: boolean;
  trickPresentationPhase?: TrickPresentationPhase;
  playerNames?: Record<string, string>;
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
}: PotCenterProps) {
  const phaseLabel = formatHandPhase(phase, enrollmentActive);
  const hasTrumpCard = Boolean(trumpUpcard);
  const showTrumpSuitReminder =
    !hasTrumpCard && Boolean(trumpSuit) && phase === "play";
  const trumpKey = hasTrumpCard ? `${trumpUpcard!.rank}-${trumpUpcard!.suit}` : "none";

  return (
    <>
      <div className="deck-stack" aria-label="Deck and trump">
        {hasTrumpCard ? (
          <div
            key={trumpKey}
            className="deck-stack__trump bpot__trump--deal"
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
            className="deck-stack__trump deck-stack__trump--suit-reminder"
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

      <div className="center-play">
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

        <div className="center-play__trick">
          <TrickRow
            displayPlays={trickDisplayPlays}
            winnerPlayerId={trickWinnerPlayerId}
            showWinnerTag={trickShowWinnerTag}
            presentationPhase={trickPresentationPhase}
            playerNames={playerNames}
          />
        </div>

        <dl className="center-play__stats">
          <div className="bpot__stat bpot__stat--pot" data-testid="pot-display">
            <dt>Pot</dt>
            <dd>{formatRiskStake(potMetrics.currentPot)}</dd>
          </div>
          <div className="bpot__stat">
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
    </>
  );
}
