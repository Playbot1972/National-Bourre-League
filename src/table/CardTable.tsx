import { HeroHand } from "./HeroHand";
import { PotCenter } from "./PotCenter";
import { Seat } from "./Seat";
import { tableAspectForPlayers, isPlayerAtBourreRisk, displayLiveBankroll } from "./logic";
import { orderPlayersForTable } from "./layout/seatOrder";
import { resolveSeatLayout } from "./layout/seatLayout";
import {
  CARD_LAND_MS,
  NEXT_LEAD_GAP_MS,
  POST_TRICK_READ_MS,
  TRICK_CARD_SETTLE_MS,
  TRICK_CARD_SHIFT_MS,
  TRICK_CARD_TRAVEL_MS,
  TRICK_SWEEP_MS,
  WINNER_HIGHLIGHT_MS,
} from "./trickTiming";
import { handTimingScale } from "./handPresentationTiming";
import { useStageFit } from "./hooks/useStageFit";
import { useDiscardPileState } from "./hooks/useDiscardPileState";
import { useTableDiscardFly } from "./hooks/useTableDiscardFly";
import { useTableDrawReceiveFly } from "./hooks/useTableDrawReceiveFly";
import { useWonTrickCollection } from "./hooks/useWonTrickCollection";
import type { HandPresentation } from "./hooks/useHandPresentation";
import type { TableMicrointeractions } from "./hooks/useTableMicrointeractions";
import type { TrickPresentation } from "./hooks/useTrickPresentation";
import type { TrumpHolderPresentation } from "./trumpHolderPresentation";
import { resolveSeatTrumpDisplay } from "./trumpHolderPresentation";
import type { PotMetrics, SerializedCard, TableActionFeedback, TablePlayer, TableSessionData } from "./types";

interface CardTableProps {
  session: TableSessionData;
  players: TablePlayer[];
  potMetrics: PotMetrics;
  participantCount: number;
  enrollmentActive?: boolean;
  heroCards?: SerializedCard[];
  revealedTrumpIndex?: number | null;
  trumpMergeActive?: boolean;
  trumpDisabledIndex?: number | null;
  hideCenterTrump?: boolean;
  showTrumpSuitReminder?: boolean;
  trumpHolderPresentation: TrumpHolderPresentation;
  privateHandReady?: boolean;
  currentUserId?: string | null;
  legalPlayIndices?: number[] | null;
  /** Bot-heuristic best play index for the viewing player (display hand space). */
  recommendedPlayIndex?: number | null;
  handComplete?: boolean;
  actionFeedback?: TableActionFeedback | null;
  trickPresentation: TrickPresentation;
  handPresentation: HandPresentation;
  microinteractions: TableMicrointeractions;
  instantTrickPlays?: boolean;
  onToggleInHand: (playerId: string, inHand: boolean) => void;
  onPassEnrollment?: (playerId: string) => void;
  onTrickDelta: (playerId: string, delta: number) => void;
  onSubmitDraw?: (discardIndices: number[]) => void | Promise<void>;
  onPassDraw?: () => void | Promise<void>;
  onFoldDraw?: () => void | Promise<void>;
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
  revealedTrumpIndex = null,
  trumpMergeActive = false,
  trumpDisabledIndex = null,
  hideCenterTrump = false,
  showTrumpSuitReminder = false,
  trumpHolderPresentation,
  privateHandReady = false,
  currentUserId = null,
  legalPlayIndices,
  recommendedPlayIndex,
  handComplete = false,
  actionFeedback,
  trickPresentation,
  handPresentation,
  microinteractions,
  instantTrickPlays = false,
  onToggleInHand,
  onPassEnrollment,
  onTrickDelta,
  onSubmitDraw,
  onPassDraw,
  onFoldDraw,
  onPlayCard,
  onReaction,
}: CardTableProps) {
  const feltPlayers = players.map((player) => ({
    ...player,
    isSelf:
      player.isSelf ||
      (currentUserId != null && player.playerId === currentUserId),
  }));

  const rotated = orderPlayersForTable(feltPlayers, session, currentUserId);
  const playerCount = rotated.length;
  const countClass = `btable--p${Math.min(8, Math.max(2, playerCount))}`;
  const tableAspect = tableAspectForPlayers(playerCount);
  const playerNames = Object.fromEntries(feltPlayers.map((p) => [p.playerId, p.displayName]));
  const handTiming = handTimingScale();
  const sessionKey = session.sessionId;
  const wrapRef = useStageFit({ aspect: tableAspect, sessionKey });
  const { cards: discardPileCards, pileIndexRef, commitDiscardCards } = useDiscardPileState({
    handNumber: session.handNumber,
    sessionPhase: session.phase,
    tableRootRef: wrapRef,
  });
  useTableDiscardFly({
    handPresentation,
    handNumber: session.handNumber,
    currentUserId,
    tableRootRef: wrapRef,
    pileIndexRef,
    onDiscardCommitted: commitDiscardCards,
  });
  useTableDrawReceiveFly({
    handPresentation,
    handNumber: session.handNumber,
    currentUserId,
    tableRootRef: wrapRef,
  });
  useWonTrickCollection({
    trickPresentation,
    handNumber: session.handNumber,
    sessionPhase: session.phase,
    handComplete,
    tableRootRef: wrapRef,
  });
  const bourreRiskIds = new Set(
    session.participantIds.filter((pid) =>
      isPlayerAtBourreRisk(
        pid,
        trickPresentation.displayTricksByPlayer,
        session.participantIds,
        session.phase,
      ),
    ),
  );
  const displayPlayers = feltPlayers.map((player) => {
    const tricksThisHand = trickPresentation.displayTricksByPlayer[player.playerId] ?? 0;
    const trickWinnerSeat = trickPresentation.trickWinnerSeatId === player.playerId;
    const suppressTurn =
      trickPresentation.suppressTurnPlayerId || handPresentation.suppressTurnIndicator;
    const capturingTrick = trickPresentation.phase === "collectTrick" && trickWinnerSeat;
    const enrollmentPulse = handPresentation.enrollmentPulse[player.playerId];
    const drawingNow = handPresentation.animatingDrawPlayerId === player.playerId;
    const seatTrump = resolveSeatTrumpDisplay(
      player.playerId,
      trumpHolderPresentation,
      session.trumpUpcard ?? null,
      player.holeCardCount ?? 0,
      player.isSelf,
    );
    return {
      ...player,
      ...seatTrump,
      bankroll: displayLiveBankroll(player.bankroll, potMetrics.anteAmount, {
        inHand: player.inHand,
        anteAnimActive: handPresentation.anteAnimActive,
        anteAlreadyPosted:
          session.postedAntes != null &&
          Object.prototype.hasOwnProperty.call(session.postedAntes, player.playerId),
      }),
      tricksThisHand,
      isOnTurn: suppressTurn ? false : player.isOnTurn,
      isActiveActor: suppressTurn ? false : player.isActiveActor,
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
      winnerFlash: microinteractions.winnerFlashPlayerId === player.playerId,
      bankrollTick: microinteractions.bankrollTicks[player.playerId] ?? null,
      bourreAlert: player.isSelf
        ? (microinteractions.bourreAlerts[player.playerId] ?? null)
        : null,
      bourrePressure: bourreRiskIds.has(player.playerId),
    };
  });
  const selfPlayer = feltPlayers.find((p) => p.isSelf);
  const suppressTurn =
    trickPresentation.suppressTurnPlayerId || handPresentation.suppressTurnIndicator;
  const drawCompleted =
    Boolean(
      currentUserId &&
        session.drawCompletedIds?.includes(currentUserId),
    );
  const hasActiveTurn = displayPlayers.some((p) => p.isActiveActor);

  return (
    <div
      ref={wrapRef}
      className={[
        "btable-wrap btable-wrap--stage-fit",
        countClass,
        hasActiveTurn ? "btable-wrap--has-active-turn" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="table-root"
      style={{
        ["--player-count" as string]: playerCount,
        ["--table-aspect" as string]: tableAspect,
        ["--trick-card-travel-ms" as string]: `${TRICK_CARD_TRAVEL_MS}ms`,
        ["--trick-card-settle-ms" as string]: `${TRICK_CARD_SETTLE_MS}ms`,
        ["--trick-card-shift-ms" as string]: `${TRICK_CARD_SHIFT_MS}ms`,
        ["--trick-card-land-ms" as string]: `${CARD_LAND_MS}ms`,
        ["--trick-winner-highlight-ms" as string]: `${WINNER_HIGHLIGHT_MS}ms`,
        ["--trick-sweep-ms" as string]: `${TRICK_SWEEP_MS}ms`,
        ["--trick-post-read-ms" as string]: `${POST_TRICK_READ_MS}ms`,
        ["--trick-next-lead-gap-ms" as string]: `${NEXT_LEAD_GAP_MS}ms`,
        ["--trick-final-pipeline-ms" as string]: `${POST_TRICK_READ_MS + WINNER_HIGHLIGHT_MS + TRICK_SWEEP_MS + NEXT_LEAD_GAP_MS}ms`,
        ["--deal-card-stagger-ms" as string]: `${handTiming.dealCardStaggerMs}ms`,
        ["--draw-discard-ms" as string]: `${handTiming.drawDiscardMs}ms`,
        ["--draw-replace-ms" as string]: `${handTiming.drawReplaceMs}ms`,
      }}
    >
      <div className="btable-wrap__table-area">
        <div className="btable-wrap__stage-scaler">
        <div className="table-stage-fit">
        <div className="table-stage">
        <div className="table-oval">
          <div className="btable__rail" />
          <div className="btable__felt" data-testid="table-felt" />
        </div>

        <div className="btable__play-zone">
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
            trickEchoPlays={trickPresentation.trickEchoPlays}
            trickEchoWinnerId={trickPresentation.trickEchoWinnerId}
            trickEchoPhase={trickPresentation.trickEchoPhase}
            showFinalTrickEcho={trickPresentation.showFinalTrickEcho}
            playerNames={playerNames}
            anteAnimActive={handPresentation.anteAnimActive}
            trumpRevealActive={handPresentation.trumpRevealActive}
            hideCenterTrump={hideCenterTrump}
            showTrumpSuitReminder={showTrumpSuitReminder}
            drawAnimPlayerId={handPresentation.animatingDrawPlayerId}
            drawAnimSubPhase={handPresentation.drawAnimSubPhase}
            drawDiscardCount={handPresentation.drawDiscardCount}
            settleAnimActive={handPresentation.settleAnimActive}
            settleCarryOver={handPresentation.settleCarryOver}
            potTick={microinteractions.potTick}
            trumpReminderPulse={microinteractions.trumpReminderPulse}
            instantTrickPlays={instantTrickPlays}
            peakTrickPlayCount={trickPresentation.peakPlayCount}
            discardPileCards={discardPileCards}
          />
        </div>

        <div className="btable__seats" aria-label="Players at the table">
          {rotated.map((player, i) => {
            const layout = resolveSeatLayout(i, rotated.length, {
              isMobile: false,
              isSelf: player.isSelf,
            });
            const seatPlayer = displayPlayers.find((p) => p.playerId === player.playerId) ?? player;
            return (
              <div
                key={player.playerId}
                className={`btable__seat-slot btable__seat-slot--${i}`}
                data-seat-index={i}
              >
                <Seat
                  player={seatPlayer}
                  region={layout.region}
                  handLane={layout.handLane}
                  style={{
                    left: `${layout.x}%`,
                    top: `${layout.y}%`,
                  }}
                  onToggleInHand={() =>
                    onToggleInHand(
                      player.playerId,
                      player.canToggleInHand ? true : !player.inHand,
                    )
                  }
                  onPassEnrollment={
                    player.canPassEnrollment && onPassEnrollment
                      ? () => onPassEnrollment(player.playerId)
                      : undefined
                  }
                  onTrickDelta={(delta) => onTrickDelta(player.playerId, delta)}
                  onReaction={player.isSelf ? onReaction : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>
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
        recommendedPlayIndex={recommendedPlayIndex ?? undefined}
        handComplete={handComplete}
        actionFeedback={actionFeedback}
        onSubmitDraw={onSubmitDraw}
        onPassDraw={onPassDraw}
        onFoldDraw={onFoldDraw}
        onPlayCard={onPlayCard}
        currentUserId={currentUserId}
        revealedTrumpIndex={revealedTrumpIndex}
        trumpMergeActive={trumpMergeActive}
        trumpDisabledIndex={trumpDisabledIndex}
        handNumber={session.handNumber}
        tableRootRef={wrapRef}
        pileIndexRef={pileIndexRef}
        onDiscardCommitted={commitDiscardCards}
      />
    </div>
  );
}
