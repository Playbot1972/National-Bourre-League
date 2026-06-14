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

  return (
    <div className="bpot">
      <div className="bpot__phase" aria-live="polite">
        <span className={`bpot__phase-tag bpot__phase-tag--${phase ?? "waiting"}`}>
          {phaseLabel}
        </span>
        {hasTrump && trumpSuit && (
          <span className="bpot__phase-trump muted small">
            Trump · {formatTrumpSuit(trumpSuit)}
          </span>
        )}
      </div>

      <div className="bpot__trick-area">
        {hasTrump ? (
          <div className="bpot__trump">
            <PlayingCard
              card={{
                rank: trumpUpcard!.rank as Rank,
                suit: trumpUpcard!.suit as Suit,
              }}
              size="sm"
              state="trump"
            />
            <span className="bpot__trump-label muted small">Upcard</span>
          </div>
        ) : (
          <div className="bpot__deck-placeholder muted small" aria-hidden="true">
            {enrollmentActive ? "Dealing after join" : "Awaiting deal"}
          </div>
        )}

        <TrickRow
          currentTrick={currentTrick}
          playedCards={playedCards}
          playerNames={playerNames}
        />
      </div>

      <dl className="bpot__stats">
        <div className="bpot__stat">
          <dt>Current Pot</dt>
          <dd>{formatRiskStake(potMetrics.currentPot)}</dd>
        </div>
        {potMetrics.limEnabled && (
          <>
            <div className="bpot__stat">
              <dt>Pot Cap</dt>
              <dd>
                {formatRiskStake(potMetrics.potCap)}
                <span className="bpot__lim-tag">LmT</span>
              </dd>
            </div>
            <div className="bpot__stat bpot__stat--highlight">
              <dt>Max Win This Hand</dt>
              <dd>{formatRiskStake(potMetrics.maxWinThisHand)}</dd>
            </div>
          </>
        )}
        <div className="bpot__stat">
          <dt>Ante</dt>
          <dd>{formatRiskStake(potMetrics.anteAmount)}</dd>
        </div>
      </dl>
      {potMetrics.limEnabled && potMetrics.overflow > 0 && (
        <div className="bpot__carry muted small">
          + {formatRiskStake(potMetrics.overflow)} overflow → next hand
        </div>
      )}
      <div className="bpot__meta muted small">
        {participantCount} in this hand
        {remainingDeckCount != null && remainingDeckCount > 0 && (
          <> · {remainingDeckCount} left in deck</>
        )}
      </div>
    </div>
  );
}
