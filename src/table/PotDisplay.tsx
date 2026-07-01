import { memo } from "react";
import { formatAnteStake, formatRiskStake } from "./logic";
import type { PotMetrics } from "./types";

export interface PotDisplayProps {
  potMetrics: PotMetrics;
  participantCount: number;
  potTick?: number;
}

function PotDisplayInner({
  potMetrics,
  participantCount,
  potTick = 0,
}: PotDisplayProps) {
  return (
    <>
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

      <div className="center-play__meta muted small">{participantCount} in hand</div>
    </>
  );
}

export const PotDisplay = memo(PotDisplayInner);
