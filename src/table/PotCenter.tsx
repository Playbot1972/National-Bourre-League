import { PlayingCard } from "../components/PlayingCard";
import { formatRiskStake } from "./logic";

interface PotCenterProps {
  potAmount: number;
  carryOverPot: number;
  handStake: number;
  participantCount: number;
}

export function PotCenter({ potAmount, carryOverPot, handStake, participantCount }: PotCenterProps) {
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
      <div className="bpot__amount">{formatRiskStake(potAmount)}</div>
      {carryOverPot > 0 && (
        <div className="bpot__carry">+ {formatRiskStake(carryOverPot)} carry</div>
      )}
      <div className="bpot__ante muted small">
        {formatRiskStake(handStake)} ante · {participantCount} in
      </div>
    </div>
  );
}
