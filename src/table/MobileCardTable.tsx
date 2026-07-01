import { useMemo } from "react";
import type { TableEvent } from "./hooks/useTableEvents";
import { HeroHand } from "./HeroHand";
import { BigPotBrewingIndicator } from "./BigPotBrewingIndicator";
import { isHeroCardAreaEmpty } from "./heroCardArea";
import { PotCenter } from "./PotCenter";
import { TableSeatSlot } from "./TableSeatSlot";
import { useTableSeatModel } from "./hooks/useTableSeatModel";
import {
  type MobileOrientation,
} from "./layout/mobileSeatMap";
import {
  resolveMobileOpponentLayout,
  resolveMobileSelfLayout,
} from "./layout/seatLayout";
import { useTableLayoutMode } from "./layout/useTableLayoutMode";
import { useMobileStageFit } from "./hooks/useMobileStageFit";
import { useDiscardPileState } from "./hooks/useDiscardPileState";
import { useTableDiscardFly } from "./hooks/useTableDiscardFly";
import { useTableDrawReceiveFly } from "./hooks/useTableDrawReceiveFly";
import { useTableDrawMotionCleanup } from "./hooks/useTableDrawMotionCleanup";
import { useTableDealPresentation } from "./hooks/useTableDealPresentation";
import { useWonTrickCollection } from "./hooks/useWonTrickCollection";
import type { HandPresentation } from "./hooks/useHandPresentation";
import type { TableMicrointeractions } from "./hooks/useTableMicrointeractions";
import type { TrickPresentation } from "./hooks/useTrickPresentation";
import type { TrumpHolderPresentation } from "./trumpHolderPresentation";
import type { PotMetrics, SerializedCard, TableActionFeedback, TablePlayer, TableSessionData } from "./types";
import { TableProfiler } from "./tableProfiler";

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
  recommendedPlayIndex?: number | null;
  recommendedDiscardIndices?: number[];
  handComplete?: boolean;
  actionFeedback?: TableActionFeedback | null;
  trickPresentation: TrickPresentation;
  handPresentation: HandPresentation;
  microinteractions: TableMicrointeractions;
  instantTrickPlays?: boolean;
  bigPotEvent?: TableEvent | null;
  onDismissTableEvent?: (id: string) => void;
  onToggleInHand: (playerId: string, inHand: boolean) => void;
  onPassEnrollment?: (playerId: string) => void;
  onTrickDelta: (playerId: string, delta: number) => void;
  onSubmitDraw?: (discardIndices: number[]) => void | Promise<void>;
  onPassDraw?: () => void | Promise<void>;
  onFoldDraw?: () => void | Promise<void>;
  onPlayCard?: (cardIndex: number) => void | Promise<void>;
  onHeroUserActivity?: () => void;
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
  recommendedPlayIndex,
  recommendedDiscardIndices = [],
  handComplete = false,
  actionFeedback,
  trickPresentation,
  handPresentation,
  microinteractions,
  instantTrickPlays = false,
  bigPotEvent = null,
  onDismissTableEvent,
  onToggleInHand,
  onPassEnrollment,
  onTrickDelta,
  onSubmitDraw,
  onPassDraw,
  onFoldDraw,
  onPlayCard,
  onHeroUserActivity,
}: MobileCardTableProps) {
  const layoutMode = useTableLayoutMode();
  const orientation: MobileOrientation =
    layoutMode === "mobile-landscape" ? "landscape" : "portrait";

  const seatModel = useTableSeatModel({
    session,
    players,
    currentUserId,
    potMetrics,
    trickPresentation,
    handPresentation,
    microinteractions,
    trumpHolderPresentation,
    mobileOrientation: orientation,
  });

  const {
    rotated,
    opponents,
    playerCount,
    countClass,
    handTiming,
    playerNames,
    displayPlayersById,
    selfPlayer,
    suppressTurn,
    drawCompleted,
    hasActiveTurn,
    potMetricsForCenter,
    wrapStyle,
  } = seatModel;

  const feltSelfLayout = useMemo(
    () => (selfPlayer ? resolveMobileSelfLayout(rotated.length, orientation) : null),
    [selfPlayer, rotated.length, orientation],
  );

  const sessionKey = session.sessionId;
  const wrapRef = useMobileStageFit({ aspect: seatModel.tableAspect, sessionKey });
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
  useTableDrawMotionCleanup({
    handNumber: session.handNumber,
    sessionPhase: session.phase,
    turnPlayerId: session.turnPlayerId,
    drawCompletedIds: session.drawCompletedIds ?? [],
    currentUserId,
    handPresentation,
    tableRootRef: wrapRef,
  });
  const clockwiseDealing = useTableDealPresentation({
    session,
    heroCards,
    privateHandReady,
    tableRootRef: wrapRef,
  });
  useWonTrickCollection({
    trickPresentation,
    handNumber: session.handNumber,
    sessionPhase: session.phase,
    handComplete,
    tableRootRef: wrapRef,
  });

  const potCenterProps = useMemo(
    () => ({
      potMetrics: potMetricsForCenter,
      participantCount,
      trumpUpcard: session.trumpUpcard,
      trumpSuit: session.trumpSuit,
      phase: session.phase,
      enrollmentActive,
      remainingDeckCount: session.remainingDeckCount,
      trickDisplayPlays: trickPresentation.displayPlays,
      trickLeadSuit: session.currentTrick?.leadSuit ?? session.leadSuit ?? null,
      trickWinnerPlayerId: trickPresentation.winnerPlayerId,
      trickShowWinnerTag: trickPresentation.showWinnerTag,
      trickPresentationPhase: trickPresentation.phase,
      trickEchoPlays: trickPresentation.trickEchoPlays,
      trickEchoWinnerId: trickPresentation.trickEchoWinnerId,
      trickEchoPhase: trickPresentation.trickEchoPhase,
      showFinalTrickEcho: trickPresentation.showFinalTrickEcho,
      playerNames,
      anteAnimActive: handPresentation.anteAnimActive,
      trumpRevealActive: handPresentation.trumpRevealActive,
      hideCenterTrump,
      showTrumpSuitReminder,
      drawAnimPlayerId: handPresentation.animatingDrawPlayerId,
      drawAnimSubPhase: handPresentation.drawAnimSubPhase,
      drawDiscardCount: handPresentation.drawDiscardCount,
      settleAnimActive: handPresentation.settleAnimActive,
      settleCarryOver: handPresentation.settleCarryOver,
      potTick: microinteractions.potTick,
      trumpReminderPulse: microinteractions.trumpReminderPulse,
      instantTrickPlays,
      peakTrickPlayCount: trickPresentation.peakPlayCount,
      discardPileCards,
    }),
    [
      potMetricsForCenter,
      participantCount,
      session.trumpUpcard,
      session.trumpSuit,
      session.phase,
      session.remainingDeckCount,
      session.currentTrick?.leadSuit,
      session.leadSuit,
      enrollmentActive,
      trickPresentation,
      playerNames,
      handPresentation,
      hideCenterTrump,
      showTrumpSuitReminder,
      microinteractions.potTick,
      microinteractions.trumpReminderPulse,
      instantTrickPlays,
      discardPileCards,
    ],
  );

  return (
    <TableProfiler id="GameTable">
    <div
      ref={wrapRef}
      className={[
        "btable-mobile-wrap btable-mobile-wrap--stage-fit",
        countClass,
        hasActiveTurn ? "btable-wrap--has-active-turn" : "",
        clockwiseDealing ? "btable-wrap--clockwise-dealing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="table-root"
      data-layout={orientation}
      style={wrapStyle}
    >
      <div className="btable-mobile__table-area">
        <div className="btable-mobile__stage-scaler">
        <div className="btable-mobile-stage-fit">
        <div className="btable-mobile-stage table-stage">
          <div className="table-oval btable-mobile-oval">
            <div className="btable__rail" />
            <div className="btable__felt" data-testid="table-felt" />
          </div>

          <div className="btable__play-zone">
            <TableProfiler id="TrickArea">
            <PotCenter {...potCenterProps} />
            </TableProfiler>
          </div>

          <TableProfiler id="PlayerSeats">
          <div className="btable__seats btable-mobile__seats" aria-label="Players at the table">
            {opponents.map((player, i) => (
              <TableSeatSlot
                key={player.playerId}
                seatIndex={i}
                player={player}
                seatPlayer={displayPlayersById.get(player.playerId) ?? player}
                playerCount={playerCount}
                isMobile
                clockwiseDealing={clockwiseDealing}
                layoutOverride={resolveMobileOpponentLayout(i, rotated.length, orientation)}
                onToggleInHand={onToggleInHand}
                onPassEnrollment={onPassEnrollment}
                onTrickDelta={onTrickDelta}
              />
            ))}
            {selfPlayer && feltSelfLayout && (
              <TableSeatSlot
                key={selfPlayer.playerId}
                seatIndex={0}
                player={selfPlayer}
                seatPlayer={displayPlayersById.get(selfPlayer.playerId) ?? selfPlayer}
                playerCount={playerCount}
                isMobile
                clockwiseDealing={clockwiseDealing}
                layoutOverride={feltSelfLayout}
                seatIndexAttr={0}
                onToggleInHand={onToggleInHand}
                onPassEnrollment={onPassEnrollment}
                onTrickDelta={onTrickDelta}
              />
            )}
          </div>
          </TableProfiler>
        </div>
        </div>
        </div>
      </div>

      <TableProfiler id="ActionBar">
      <div className="btable-mobile-hero-dock hand-panel">
        <div className="btable-mobile-hero-dock__stack">
        {bigPotEvent && isHeroCardAreaEmpty(heroCards) && onDismissTableEvent && (
          <BigPotBrewingIndicator event={bigPotEvent} onDismiss={onDismissTableEvent} />
        )}
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
          drawDiscardCount={
            handPresentation.animatingDrawPlayerId === currentUserId
              ? handPresentation.drawDiscardCount
              : 0
          }
          drawReplaceCount={
            handPresentation.animatingDrawPlayerId === currentUserId
              ? handPresentation.drawReplaceCount
              : 0
          }
          drawCompleted={drawCompleted}
          maxDrawDiscards={session.maxDrawDiscards ?? 4}
          legalPlayIndices={legalPlayIndices ?? undefined}
          recommendedPlayIndex={recommendedPlayIndex ?? undefined}
          recommendedDiscardIndices={recommendedDiscardIndices}
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
          onUserActivity={onHeroUserActivity}
          skipHeroDealMotion={clockwiseDealing}
        />
        </div>
        {enrollmentActive && !selfPlayer?.inHand && (
          <p className="btable-mobile-hero-dock__hint muted small">
            Tap I&apos;m in above to join this hand
          </p>
        )}
      </div>
      </TableProfiler>
    </div>
    </TableProfiler>
  );
}
