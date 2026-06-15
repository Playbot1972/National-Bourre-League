import { PlayingCard } from "../components/PlayingCard";
import type { Rank, Suit } from "../types";
import { formatHandPhase, formatTrumpSuit } from "./handUi";
import { formatRiskStake } from "./logic";
import { TrickRow } from "./TrickRow";
import type {
  CurrentTrickState,
  PlayedCardEntry,
  PotMetrics,
  SerializedCard,
} from "./types";

interface PotCenterProps {
  potMetrics: PotMetrics;
  participantCount: number;
  trumpUpcard?: SerializedCard | null;
  trumpSuit?: string | null;
  phase?: string | null;
  enrollmentActive?: boolean;
  remainingDeckCount?: number | null;
  currentTrick?: CurrentTrickState | null;
  playedCards?: PlayedCardEntry[];
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
  currentTrick,
  playedCards,
  playerNames = {},
}: PotCenterProps) {
  const phaseLabel = formatHandPhase(phase, enrollmentActive);
  const hasTrump = Boolean(trumpUpcard);
  const trumpKey = hasTrump ? `${trumpUpcard!.rank}-${trumpUpcard!.suit}` : "none";

  return (
    <>
      <div className="deck-stack" aria-label="Deck and trump">
        {hasTrump ? (
          <div key={trumpKey} className="deck-stack__trump bpot__trump--deal">
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
        ) : (
          <div className="deck-stack__pile" aria-hidden="true">
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
          {hasTrump && trumpSuit && (
            <span className="center-play__trump-suit muted small">
              {formatTrumpSuit(trumpSuit)}
            </span>
          )}
        </div>

        <div className="center-play__trick">
          <TrickRow
            currentTrick={currentTrick}
            playedCards={playedCards}
            playerNames={playerNames}
          />
        </div>

        <dl className="center-play__stats">
          <div className="bpot__stat bpot__stat--pot">
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
