import { HeroHand } from "./HeroHand";
import { PotCenter } from "./PotCenter";
import { Seat } from "./Seat";
import { seatPosition, tableAspectForPlayers } from "./logic";
import type { PotMetrics, SerializedCard, TableActionFeedback, TablePlayer, TableSessionData } from "./types";

interface CardTableProps {
  session: TableSessionData;
  players: TablePlayer[];
  potMetrics: PotMetrics;
  participantCount: number;
  enrollmentActive?: boolean;
  heroCards?: SerializedCard[];
  currentUserId?: string | null;
  legalPlayIndices?: number[] | null;
  actionFeedback?: TableActionFeedback | null;
  onToggleInHand: (playerId: string, inHand: boolean) => void;
  onTrickDelta: (playerId: string, delta: number) => void;
  onSubmitDraw?: (discardIndices: number[]) => void | Promise<void>;
  onPassDraw?: () => void | Promise<void>;
  onPlayCard?: (cardIndex: number) => void | Promise<void>;
}

export function CardTable({
  session,
  players,
  potMetrics,
  participantCount,
  enrollmentActive = false,
  heroCards = [],
  currentUserId = null,
  legalPlayIndices,
  actionFeedback,
  onToggleInHand,
  onTrickDelta,
  onSubmitDraw,
  onPassDraw,
  onPlayCard,
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
  const playerNames = Object.fromEntries(players.map((p) => [p.playerId, p.displayName]));
  const selfPlayer = players.find((p) => p.isSelf);
  const drawCompleted =
    Boolean(
      currentUserId &&
        session.drawCompletedIds?.includes(currentUserId),
    );

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
          <PotCenter
            potMetrics={potMetrics}
            participantCount={participantCount}
            trumpUpcard={session.trumpUpcard}
            trumpSuit={session.trumpSuit}
            phase={session.phase}
            enrollmentActive={enrollmentActive}
            remainingDeckCount={session.remainingDeckCount}
            currentTrick={session.currentTrick}
            playedCards={session.playedCards}
            playerNames={playerNames}
          />
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
      <HeroHand
        className="btable-wrap__hero"
        cards={heroCards}
        phase={session.phase}
        enrollmentActive={enrollmentActive}
        isInHand={Boolean(selfPlayer?.inHand)}
        isDealer={Boolean(selfPlayer?.isDealer)}
        signedIn={Boolean(currentUserId)}
        isMyTurn={Boolean(currentUserId && session.turnPlayerId === currentUserId)}
        drawCompleted={drawCompleted}
        maxDrawDiscards={session.maxDrawDiscards ?? 4}
        legalPlayIndices={legalPlayIndices ?? undefined}
        actionFeedback={actionFeedback}
        onSubmitDraw={onSubmitDraw}
        onPassDraw={onPassDraw}
        onPlayCard={onPlayCard}
      />
    </div>
  );
}
