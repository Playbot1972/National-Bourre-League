import { HeroHand } from "./HeroHand";
import { PotCenter } from "./PotCenter";
import { Seat } from "./Seat";
import { seatPosition, tableAspectForPlayers } from "./logic";
import {
  CARD_LAND_MS,
  TRICK_SWEEP_MS,
  WINNER_HIGHLIGHT_MS,
} from "./trickTiming";
import { handTimingScale } from "./handPresentationTiming";
import { useStageFit } from "./hooks/useStageFit";
import type { HandPresentation } from "./hooks/useHandPresentation";
import type { TableMicrointeractions } from "./hooks/useTableMicrointeractions";
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
  handPresentation: HandPresentation;
  microinteractions: TableMicrointeractions;
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
  handPresentation,
  microinteractions,
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
  const handTiming = handTimingScale();
  const sessionKey = `${session.sessionId}:${session.handNumber}`;
  const wrapRef = useStageFit({ aspect: tableAspect, sessionKey });
  const displayPlayers = players.map((player) => {
    const tricksThisHand = trickPresentation.displayTricksByPlayer[player.playerId] ?? 0;
    const trickWinnerSeat = trickPresentation.trickWinnerSeatId === player.playerId;
    const suppressTurn =
      trickPresentation.suppressTurnPlayerId || handPresentation.suppressTurnIndicator;
    const capturingTrick = trickPresentation.phase === "collectTrick" && trickWinnerSeat;
    const enrollmentPulse = handPresentation.enrollmentPulse[player.playerId];
    const drawingNow = handPresentation.animatingDrawPlayerId === player.playerId;
    return {
      ...player,
      tricksThisHand,
      isOnTurn: suppressTurn ? false : player.isOnTurn,
      isLeading:
        trickWinnerSeat &&
        (trickPresentation.phase === "winnerReveal" ||
          trickPresentation.phase === "collectTrick")
          ? true
          : suppressTurn
            ? false
            : player.isLeading,
      isTrickCapture: capturingTrick,
      enrollmentPulse,
      drawAnimSubPhase: drawingNow ? handPresentation.drawAnimSubPhase : null,
      drawDiscardCount: drawingNow ? handPresentation.drawDiscardCount : 0,
      drawReplaceCount: drawingNow ? handPresentation.drawReplaceCount : 0,
      turnHandoff: microinteractions.turnHandoffPlayerId === player.playerId,
      dealerMoved: microinteractions.dealerMovedPlayerId === player.playerId,
      trickBadgeTick: microinteractions.trickBadgeTicks[player.playerId] ?? 0,
      winnerFlash: microinteractions.winnerFlashPlayerId === player.playerId,
    };
  });
  const selfPlayer = players.find((p) => p.isSelf);
  const suppressTurn =
    trickPresentation.suppressTurnPlayerId || handPresentation.suppressTurnIndicator;
  const drawCompleted =
    Boolean(
      currentUserId &&
        session.drawCompletedIds?.includes(currentUserId),
    );

  return (
    <div
      ref={wrapRef}
      className={`btable-wrap btable-wrap--stage-fit ${countClass}`}
      data-testid="table-root"
      style={{
        ["--player-count" as string]: playerCount,
        ["--table-aspect" as string]: tableAspect,
        ["--trick-card-land-ms" as string]: `${CARD_LAND_MS}ms`,
        ["--trick-winner-highlight-ms" as string]: `${WINNER_HIGHLIGHT_MS}ms`,
        ["--trick-sweep-ms" as string]: `${TRICK_SWEEP_MS}ms`,
        ["--deal-card-stagger-ms" as string]: `${handTiming.dealCardStaggerMs}ms`,
        ["--draw-discard-ms" as string]: `${handTiming.drawDiscardMs}ms`,
        ["--draw-replace-ms" as string]: `${handTiming.drawReplaceMs}ms`,
      }}
    >
      <div className="table-stage-fit">
      <div className="table-stage">
        <div className="table-oval" aria-hidden="true">
          <div className="btable__rail" />
          <div className="btable__felt" data-testid="table-felt" />
        </div>

        <PotCenter
          potMetrics={{
            ...potMetrics,
            currentPot: handPresentation.displayPotAmount,
          }}
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
          anteAnimActive={handPresentation.anteAnimActive}
          trumpRevealActive={handPresentation.trumpRevealActive}
          drawAnimPlayerId={handPresentation.animatingDrawPlayerId}
          drawAnimSubPhase={handPresentation.drawAnimSubPhase}
          drawDiscardCount={handPresentation.drawDiscardCount}
          settleAnimActive={handPresentation.settleAnimActive}
          settleCarryOver={handPresentation.settleCarryOver}
          potTick={microinteractions.potTick}
          trumpReminderPulse={microinteractions.trumpReminderPulse}
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
                onToggleInHand={() =>
                  onToggleInHand(
                    player.playerId,
                    player.canToggleInHand ? true : !player.inHand,
                  )
                }
                onTrickDelta={(delta) => onTrickDelta(player.playerId, delta)}
                onReaction={player.isSelf ? onReaction : undefined}
              />
            );
          })}
        </div>
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
          !suppressTurn
        }
        dealStaggerMs={handTiming.dealCardStaggerMs}
        drawAnimSubPhase={
          handPresentation.animatingDrawPlayerId === currentUserId
            ? handPresentation.drawAnimSubPhase
            : null
        }
        drawCompleted={drawCompleted}
        maxDrawDiscards={session.maxDrawDiscards ?? 4}
        legalPlayIndices={legalPlayIndices ?? undefined}
        handComplete={handComplete}
        actionFeedback={actionFeedback}
        onSubmitDraw={onSubmitDraw}
        onPassDraw={onPassDraw}
        onPlayCard={onPlayCard}
        currentUserId={currentUserId}
      />
    </div>
  );
}
