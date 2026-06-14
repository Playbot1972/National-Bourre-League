import { PlayingCard } from "../components/PlayingCard";
import { formatRiskStake } from "./logic";
import type { PotMetrics } from "./types";

interface PotCenterProps {
  potMetrics: PotMetrics;
  participantCount: number;
}

export function PotCenter({ potMetrics, participantCount }: PotCenterProps) {
  const cardCount = Math.min(5, Math.max(2, participantCount));

  return (
    <div className="bpot">
      <div className="bpot__cards" aria-hidden="true">
        {Array.from({ length: cardCount }, (_, i) => (
          <div key={i} className="bpot__card" style={{ ["--pot-i" as string]: i }}>
            <PlayingCard faceDown size="sm" />
          </div>
        ))}
      </div>
      <dl className="bpot__stats">
        <div className="bpot__stat">
          <dt>Current Pot</dt>
          <dd>{formatRiskStake(potMetrics.currentPot)}</dd>
        </div>
        <div className="bpot__stat">
          <dt>Pot Cap</dt>
          <dd>
            {formatRiskStake(potMetrics.potCap)}
            {potMetrics.limEnabled && <span className="bpot__lim-tag">Lim</span>}
          </dd>
        </div>
        <div className="bpot__stat bpot__stat--highlight">
          <dt>Max Win This Hand</dt>
          <dd>{formatRiskStake(potMetrics.maxWinThisHand)}</dd>
        </div>
        <div className="bpot__stat">
          <dt>Ante</dt>
          <dd>{formatRiskStake(potMetrics.anteAmount)}</dd>
        </div>
      </dl>
      {potMetrics.overflow > 0 && (
        <div className="bpot__carry muted small">
          + {formatRiskStake(potMetrics.overflow)} overflow → next hand
        </div>
      )}
      <div className="bpot__meta muted small">{participantCount} in this hand</div>
    </div>
  );
}
