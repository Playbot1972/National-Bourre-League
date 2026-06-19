import { HeroHand } from "./HeroHand";
import { PotCenter } from "./PotCenter";
import { Seat } from "./Seat";
import {
  mobileOpponentSeatPosition,
  mobileTableAspect,
  type MobileOrientation,
} from "./layout/mobileSeatMap";
import { useTableLayoutMode } from "./layout/useTableLayoutMode";
import {
  CARD_LAND_MS,
  TRICK_SWEEP_MS,
  WINNER_HIGHLIGHT_MS,
} from "./trickTiming";
import { handTimingScale } from "./handPresentationTiming";
import { useMobileStageFit } from "./hooks/useMobileStageFit";
import type { HandPresentation } from "./hooks/useHandPresentation";
import type { TableMicrointeractions } from "./hooks/useTableMicrointeractions";
import type { TrickPresentation } from "./hooks/useTrickPresentation";
import { displayLiveBankroll, isPlayerAtBourreRisk } from "./logic";
import { resolveSeatTrumpDisplay } from "./trumpHolderPresentation";
import type { TrumpHolderPresentation } from "./trumpHolderPresentation";
import type { PotMetrics, SerializedCard, TableActionFeedback, TablePlayer, TableSessionData } from "./types";

interface MobileCardTableProps {
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
  handComplete?: boolean;
  actionFeedback?: TableActionFeedback | null;
  trickPresentation: TrickPresentation;
  handPresentation: HandPresentation;
  microinteractions: TableMicrointeractions;
  onToggleInHand: (playerId: string, inHand: boolean) => void;
  onPassEnrollment?: (playerId: string) => void;
  onTrickDelta: (playerId: string, delta: number) => void;
  onSubmitDraw?: (discardIndices: number[]) => void | Promise<void>;
  onPassDraw?: () => void | Promise<void>;
  onPlayCard?: (cardIndex: number) => void | Promise<void>;
}

export function MobileCardTable({
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
  handComplete = false,
  actionFeedback,
  trickPresentation,
  handPresentation,
  microinteractions,
  onToggleInHand,
  onPassEnrollment,
  onTrickDelta,
  onSubmitDraw,
  onPassDraw,
  onPlayCard,
}: MobileCardTableProps) {
  const layoutMode = useTableLayoutMode();
  const orientation: MobileOrientation =
    layoutMode === "mobile-landscape" ? "landscape" : "portrait";

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

  const opponents = rotated.filter((p) => !p.isSelf);
  const playerCount = rotated.length;
  const countClass = `btable--p${Math.min(8, Math.max(2, playerCount))}`;
  const tableAspect = mobileTableAspect(opponents.length, orientation);
  const playerNames = Object.fromEntries(players.map((p) => [p.playerId, p.displayName]));
  const handTiming = handTimingScale();
  const sessionKey = `${session.sessionId}:${session.handNumber}`;
  const wrapRef = useMobileStageFit({ aspect: tableAspect, sessionKey });
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

  const displayPlayers = players.map((player) => {
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
      }),
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
      winnerFlash: microinteractions.winnerFlashPlayerId === player.playerId,
      bankrollTick: microinteractions.bankrollTicks[player.playerId] ?? null,
      bourreAlert: player.isSelf
        ? (microinteractions.bourreAlerts[player.playerId] ?? null)
        : null,
      bourrePressure: bourreRiskIds.has(player.playerId),
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
      className={`btable-mobile-wrap btable-mobile-wrap--stage-fit ${countClass}`}
      data-testid="table-root"
      data-layout={orientation}
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
      <div className="btable-mobile-stage-fit">
        <div className="btable-mobile-stage table-stage">
          <div className="table-oval btable-mobile-oval" aria-hidden="true">
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
            hideCenterTrump={hideCenterTrump}
            showTrumpSuitReminder={showTrumpSuitReminder}
            drawAnimPlayerId={handPresentation.animatingDrawPlayerId}
            drawAnimSubPhase={handPresentation.drawAnimSubPhase}
            drawDiscardCount={handPresentation.drawDiscardCount}
            settleAnimActive={handPresentation.settleAnimActive}
            settleCarryOver={handPresentation.settleCarryOver}
            potTick={microinteractions.potTick}
            trumpReminderPulse={microinteractions.trumpReminderPulse}
          />

          <div className="btable__seats btable-mobile__seats" aria-label="Players at the table">
            {opponents.map((player, i) => {
              const pos = mobileOpponentSeatPosition(i, opponents.length, orientation);
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
                  onPassEnrollment={
                    player.canPassEnrollment && onPassEnrollment
                      ? () => onPassEnrollment(player.playerId)
                      : undefined
                  }
                  onTrickDelta={(delta) => onTrickDelta(player.playerId, delta)}
                  onReaction={undefined}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="btable-mobile-hero-dock hand-panel">
        <HeroHand
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
          revealedTrumpIndex={revealedTrumpIndex}
          trumpMergeActive={trumpMergeActive}
          trumpDisabledIndex={trumpDisabledIndex}
        />
        {enrollmentActive && !selfPlayer?.inHand && (
          <p className="btable-mobile-hero-dock__hint muted small">
            Tap I&apos;m in above to join this hand
          </p>
        )}
      </div>
    </div>
  );
}
