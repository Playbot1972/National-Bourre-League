import { Seat } from "./Seat";
import { PotCenter } from "./PotCenter";
import { seatPosition } from "./logic";
import type { TablePlayer } from "./types";

interface CardTableProps {
  players: TablePlayer[];
  potAmount: number;
  carryOverPot: number;
  handStake: number;
  participantCount: number;
  onToggleInHand: (playerId: string, inHand: boolean) => void;
  onTrickDelta: (playerId: string, delta: number) => void;
}

export function CardTable({
  players,
  potAmount,
  carryOverPot,
  handStake,
  participantCount,
  onToggleInHand,
  onTrickDelta,
}: CardTableProps) {
  const ordered = [...players].sort((a, b) => {
    if (a.isSelf) return -1;
    if (b.isSelf) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  // Hero (self) anchored at bottom; rotate others around the table.
  const selfIdx = ordered.findIndex((p) => p.isSelf);
  const rotated =
    selfIdx > 0
      ? [...ordered.slice(selfIdx), ...ordered.slice(0, selfIdx)]
      : ordered;

  return (
    <div className="btable">
      <div className="btable__rail" />
      <div className="btable__felt">
        <PotCenter
          potAmount={potAmount}
          carryOverPot={carryOverPot}
          handStake={handStake}
          participantCount={participantCount}
        />
        {rotated.map((player, i) => {
          const pos = seatPosition(i, rotated.length);
          return (
            <Seat
              key={player.playerId}
              player={player}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
              onToggleInHand={() => onToggleInHand(player.playerId, !player.inHand)}
              onTrickDelta={(delta) => onTrickDelta(player.playerId, delta)}
            />
          );
        })}
      </div>
    </div>
  );
}
