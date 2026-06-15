import { HeroHand } from "./HeroHand";
import { PotCenter } from "./PotCenter";
import { Seat } from "./Seat";
import { seatPosition, tableAspectForPlayers } from "./logic";
import type { TrickPresentation } from "./hooks/useTrickPresentation";
import type { PotMetrics, SerializedCard, TableActionFeedback, TablePlayer, TableSessionData } from "./types";

interface CardTableProps {
  session: TableSessionData;
  players: TablePlayer[];
  potMetrics: PotMetrics;
  participantCount: number;
  enrollmentActive?: boolean;
  heroCards?: SerializedCard[];
  privateHandReady?: boolean;
  currentUserId?: string | null;
  legalPlayIndices?: number[] | null;
  handComplete?: boolean;
  actionFeedback?: TableActionFeedback | null;
  trickPresentation: TrickPresentation;
  onToggleInHand: (playerId: string, inHand: boolean) => void;
  onTrickDelta: (playerId: string, delta: number) => void;
  onSubmitDraw?: (discardIndices: number[]) => void | Promise<void>;
  onPassDraw?: () => void | Promise<void>;
  onPlayCard?: (cardIndex: number) => void | Promise<void>;
  onReaction?: (emoji: string) => void;
}

export function CardTable({
  session,
  players,
  potMetrics,
  participantCount,
  enrollmentActive = false,
  heroCards = [],
  privateHandReady = false,
  currentUserId = null,
  legalPlayIndices,
  handComplete = false,
  actionFeedback,
  trickPresentation,
  onToggleInHand,
  onTrickDelta,
  onSubmitDraw,
  onPassDraw,
  onPlayCard,
  onReaction,
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
  const displayPlayers = players.map((player) => {
    const tricksThisHand = trickPresentation.displayTricksByPlayer[player.playerId] ?? 0;
    const trickWinnerSeat = trickPresentation.trickWinnerSeatId === player.playerId;
    const suppressTurn = trickPresentation.suppressTurnPlayerId;
    const capturingTrick = trickPresentation.phase === "sweep" && trickWinnerSeat;
    return {
      ...player,
      tricksThisHand,
      isOnTurn: suppressTurn ? false : player.isOnTurn,
      isLeading: trickWinnerSeat && trickPresentation.phase === "hold" ? true : suppressTurn ? false : player.isLeading,
      isTrickCapture: capturingTrick,
    };
  });
  const selfPlayer = players.find((p) => p.isSelf);
  const drawCompleted =
    Boolean(
      currentUserId &&
        session.drawCompletedIds?.includes(currentUserId),
    );

  return (
    <div
      className={`btable-wrap ${countClass}`}
      data-testid="table-root"
      style={{
        ["--player-count" as string]: playerCount,
        ["--table-aspect" as string]: tableAspect,
      }}
    >
      <div className="table-stage">
        <div className="table-oval" aria-hidden="true">
          <div className="btable__rail" />
          <div className="btable__felt" data-testid="table-felt" />
        </div>

        <PotCenter
          potMetrics={potMetrics}
          participantCount={participantCount}
          trumpUpcard={session.trumpUpcard}
          trumpSuit={session.trumpSuit}
          phase={session.phase}
          enrollmentActive={enrollmentActive}
          remainingDeckCount={session.remainingDeckCount}
          trickDisplayPlays={trickPresentation.displayPlays}
          trickWinnerPlayerId={trickPresentation.winnerPlayerId}
          trickShowWinnerTag={trickPresentation.showWinnerTag}
          trickPresentationPhase={trickPresentation.phase}
          playerNames={playerNames}
        />

        <div className="btable__seats" aria-label="Players at the table">
          {rotated.map((player, i) => {
            const pos = seatPosition(i, rotated.length);
            const seatPlayer = displayPlayers.find((p) => p.playerId === player.playerId) ?? player;
            return (
              <Seat
                key={player.playerId}
                player={seatPlayer}
                region={pos.region}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                }}
                onToggleInHand={() => onToggleInHand(player.playerId, !player.inHand)}
                onTrickDelta={(delta) => onTrickDelta(player.playerId, delta)}
                onReaction={player.isSelf ? onReaction : undefined}
              />
            );
          })}
        </div>
      </div>
      <HeroHand
        className="hand-panel"
        cards={heroCards}
        privateHandReady={privateHandReady}
        phase={session.phase}
        enrollmentActive={enrollmentActive}
        isInHand={Boolean(selfPlayer?.inHand)}
        isDealer={Boolean(selfPlayer?.isDealer)}
        signedIn={Boolean(currentUserId)}
        isMyTurn={
          Boolean(currentUserId && session.turnPlayerId === currentUserId) &&
          !trickPresentation.suppressTurnPlayerId
        }
        drawCompleted={drawCompleted}
        maxDrawDiscards={session.maxDrawDiscards ?? 4}
        legalPlayIndices={legalPlayIndices ?? undefined}
        handComplete={handComplete}
        actionFeedback={actionFeedback}
        onSubmitDraw={onSubmitDraw}
        onPassDraw={onPassDraw}
        onPlayCard={onPlayCard}
      />
    </div>
  );
}
