import { Seat } from "./Seat";
import { PotCenter } from "./PotCenter";
import { seatPosition, tableAspectForPlayers } from "./logic";
import type { PotMetrics, TablePlayer } from "./types";

interface CardTableProps {
  players: TablePlayer[];
  potMetrics: PotMetrics;
  participantCount: number;
  onToggleInHand: (playerId: string, inHand: boolean) => void;
  onTrickDelta: (playerId: string, delta: number) => void;
}

export function CardTable({
  players,
  potMetrics,
  participantCount,
  onToggleInHand,
  onTrickDelta,
}: CardTableProps) {
  const ordered = [...players].sort((a, b) => {
    if (a.isSelf) return -1;
    if (b.isSelf) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  const selfIdx = ordered.findIndex((p) => p.isSelf);
  const rotated =
    selfIdx > 0
      ? [...ordered.slice(selfIdx), ...ordered.slice(0, selfIdx)]
      : ordered;

  const playerCount = rotated.length;
  const countClass = `btable--p${Math.min(8, Math.max(2, playerCount))}`;
  const tableAspect = tableAspectForPlayers(playerCount);

  return (
    <div
      className={`btable-wrap ${countClass}`}
      style={{
        ["--player-count" as string]: playerCount,
        ["--table-aspect" as string]: tableAspect,
      }}
    >
      <div className="btable">
        <div className="btable__rail" aria-hidden="true" />
        <div className="btable__felt">
          <PotCenter potMetrics={potMetrics} participantCount={participantCount} />
        </div>
      </div>
      <div className="btable__seats" aria-label="Players at the table">
        {rotated.map((player, i) => {
          const pos = seatPosition(i, rotated.length);
          return (
            <Seat
              key={player.playerId}
              player={player}
              region={pos.region}
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
