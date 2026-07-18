import { useEffect } from "react";
import type { TableEvent } from "./hooks/useTableEvents";
import { HeroHand } from "./HeroHand";
import { BigPotBrewingIndicator } from "./BigPotBrewingIndicator";
import { isHeroCardAreaEmpty } from "./heroCardArea";
import { PotCenter } from "./PotCenter";
import { Seat } from "./Seat";
import {
  mobileTableAspect,
  type MobileOrientation,
} from "./layout/mobileSeatMap";
import { orderPlayersForTable, seatRingPlayerIds } from "./layout/seatOrder";
import {
  resolveMobileOpponentLayout,
  resolveMobileSelfLayout,
} from "./layout/seatLayout";
import { useTableLayoutMode } from "./layout/useTableLayoutMode";
import {
  CARD_LAND_MS,
  NEXT_LEAD_GAP_MS,
  POST_TRICK_READ_MS,
  TRICK_CARD_SETTLE_MS,
  TRICK_CARD_SHIFT_MS,
  TRICK_CARD_TRAVEL_MS,
  TRICK_RAKE_MS,
  TRICK_SWEEP_MS,
  WINNER_HIGHLIGHT_MS,
} from "./trickTiming";
import { handTimingScale } from "./handPresentationTiming";
import { useMobileStageFit } from "./hooks/useMobileStageFit";
import { useDiscardPileState } from "./hooks/useDiscardPileState";
import { useTableDiscardFly } from "./hooks/useTableDiscardFly";
import { useTableDrawReceiveFly } from "./hooks/useTableDrawReceiveFly";
import { useTableDrawMotionCleanup } from "./hooks/useTableDrawMotionCleanup";
import { useTableAntePresentation } from "./hooks/useTableAntePresentation";
import { useTableDealPresentation } from "./hooks/useTableDealPresentation";
import { useTrumpMergePresentation } from "./hooks/useTrumpMergePresentation";
import { useWonTrickCollection } from "./hooks/useWonTrickCollection";
import { useCardAudio } from "./hooks/useCardAudio";
import type { HandPresentation } from "./hooks/useHandPresentation";
import type { TableMicrointeractions } from "./hooks/useTableMicrointeractions";
import type { TrickPresentation } from "./hooks/useTrickPresentation";
import { isHeroDrawOrPlayTurn, resolveSuppressTurnForHero } from "./localAction";
import { isRevealCatchUpBusy } from "./matchKey";
import {
  displayLiveBankroll,
  isPlayerAtBourreRisk,
} from "./logic";
import type { PotMetrics, SerializedCard, TableActionFeedback, TablePlayer, TableSessionData } from "./types";
import type { TurnCountdownState } from "./turnCountdown";
import type { TrumpHolderPresentation } from "./trumpHolderPresentation";
import { resolveSeatTrumpDisplay } from "./trumpHolderPresentation";

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
  turnCountdown?: TurnCountdownState | null;
  heroCanAct?: boolean | null;
  visualCatchUpBusy?: boolean;
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
  turnCountdown = null,
  heroCanAct = null,
  visualCatchUpBusy = false,
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

  const feltPlayers = players.map((player) => ({
    ...player,
    isSelf:
      player.isSelf ||
      (currentUserId != null && player.playerId === currentUserId),
  }));

  const rotated = orderPlayersForTable(feltPlayers, session, currentUserId);
  const opponents = rotated.filter((p) => !p.isSelf);
  const feltSelfPlayer = rotated.find((p) => p.isSelf);
  const feltSelfLayout = feltSelfPlayer
    ? resolveMobileSelfLayout(rotated.length, orientation)
    : null;
  const playerCount = rotated.length;
  const countClass = `btable--p${Math.min(8, Math.max(2, playerCount))}`;
  const tableAspect = mobileTableAspect(opponents.length, orientation);
  const playerNames = Object.fromEntries(players.map((p) => [p.playerId, p.displayName]));
  const handTiming = handTimingScale();
  const sessionKey = session.sessionId;
  const wrapRef = useMobileStageFit({ aspect: tableAspect, sessionKey });
  useEffect(() => {
    if (typeof window === "undefined" || localStorage.getItem("tableSeatDebug") !== "1") return;
    const root = wrapRef.current;
    if (!root) return;
    const avatars = root.querySelectorAll<HTMLElement>(".bseat__avatar-wrap");
    const painted = [...avatars].filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return false;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      return Boolean(hit?.closest(".bseat__avatar-wrap"));
    }).length;
    console.debug("[table-seats-mobile]", {
      playersProp: players.length,
      rotated: rotated.length,
      domSeats: root.querySelectorAll(".bseat").length,
      paintedAvatars: painted,
      inOverlay: Boolean(root.closest(".table-play-overlay")),
      mobileShell: Boolean(root.closest(".btable-mobile")),
    });
  }, [players.length, rotated.length, wrapRef]);
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
    dealPresentationAllowed: handPresentation.dealPresentationAllowed,
    privateHandReady,
    trumpRevealActive: handPresentation.trumpRevealActive,
    trumpMergeActive: handPresentation.trumpMergeActive,
    anteAnimActive: handPresentation.anteAnimActive,
    tableRootRef: wrapRef,
  });
  const anteSeatRing = seatRingPlayerIds(session.participantIds, session);
  useTableAntePresentation({
    handNumber: session.handNumber,
    phase: handPresentation.phase,
    anteAnimActive: handPresentation.anteAnimActive,
    dealerId: session.dealerId,
    participantIds: session.participantIds,
    seatRing: anteSeatRing,
    tableRootRef: wrapRef,
    onCoinLanded: handPresentation.reportAnteCoinLanded,
    onSequenceComplete: handPresentation.completeAnteSequence,
  });
  const trumpHolderId = session.trumpHolderId ?? session.dealerId ?? null;
  const isTrumpHolder =
    currentUserId != null && trumpHolderId != null && currentUserId === trumpHolderId;
  useTrumpMergePresentation({
    tableRootRef: wrapRef,
    trumpMergeActive: handPresentation.trumpMergeActive,
    isTrumpHolder,
    onComplete: handPresentation.completeTrumpMerge,
  });
  const cardAudio = useCardAudio({
    trickPresentation,
    currentUserId,
    participantCount,
    trickNumber: session.currentTrick?.trickNumber ?? trickPresentation.frozenTrick?.trickNumber ?? 1,
    sessionPhase: session.phase,
  });
  useWonTrickCollection({
    trickPresentation,
    handNumber: session.handNumber,
    sessionPhase: session.phase,
    handComplete,
    tableRootRef: wrapRef,
    onTrickCollectionStart: cardAudio.onTrickCollectionStart,
    onCollectionComplete: trickPresentation.completeTrickCollection,
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

  const activeActorId = turnCountdown?.playerId ?? null;
  const rawSuppressTurn =
    trickPresentation.suppressTurnPlayerId || handPresentation.suppressTurnIndicator;
  const suppressTurn = resolveSuppressTurnForHero({
    suppressTurn: Boolean(rawSuppressTurn),
    session,
    currentUserId,
  });
  const revealCatchUpActive = isRevealCatchUpBusy({
    phase: trickPresentation.phase,
    revealedCount: trickPresentation.revealedCount,
    revealTarget: trickPresentation.revealTarget,
    serverTrickPlays: session.currentTrick?.plays?.length ?? 0,
  });

  const displayPlayers = feltPlayers.map((player) => {
    const tricksThisHand = trickPresentation.displayTricksByPlayer[player.playerId] ?? 0;
    const trickWinnerSeat = trickPresentation.trickWinnerSeatId === player.playerId;
    const isActiveActor =
      !suppressTurn && activeActorId != null && player.playerId === activeActorId;
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
        anteLandedThisHand: handPresentation.anteLandedPlayerIds.includes(player.playerId),
      }),
      tricksThisHand,
      isOnTurn: isActiveActor,
      isActiveActor,
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
      drawAnimSubPhase:
        drawingNow && player.isSelf ? handPresentation.drawAnimSubPhase : null,
      drawDiscardCount: drawingNow ? handPresentation.drawDiscardCount : 0,
      drawReplaceCount: drawingNow ? handPresentation.drawReplaceCount : 0,
      turnHandoff: false,
      turnCountdown:
        turnCountdown?.playerId === player.playerId
          ? {
              progress: turnCountdown.progress,
              remainingMs: turnCountdown.remainingMs,
              segment: turnCountdown.segment,
            }
          : null,
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
        "btable-mobile-wrap btable-mobile-wrap--stage-fit",
        countClass,
        hasActiveTurn ? "btable-wrap--has-active-turn" : "",
        clockwiseDealing ? "btable-wrap--clockwise-dealing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="table-root"
      data-layout={orientation}
      style={{
        ["--player-count" as string]: playerCount,
        ["--table-aspect" as string]: tableAspect,
        ["--trick-card-travel-ms" as string]: `${TRICK_CARD_TRAVEL_MS}ms`,
        ["--trick-card-settle-ms" as string]: `${TRICK_CARD_SETTLE_MS}ms`,
        ["--trick-card-shift-ms" as string]: `${TRICK_CARD_SHIFT_MS}ms`,
        ["--trick-card-land-ms" as string]: `${CARD_LAND_MS}ms`,
        ["--trick-winner-highlight-ms" as string]: `${WINNER_HIGHLIGHT_MS}ms`,
        ["--trick-sweep-ms" as string]: `${TRICK_SWEEP_MS}ms`,
        ["--trick-rake-ms" as string]: `${TRICK_RAKE_MS}ms`,
        ["--trick-post-read-ms" as string]: `${POST_TRICK_READ_MS}ms`,
        ["--trick-next-lead-gap-ms" as string]: `${NEXT_LEAD_GAP_MS}ms`,
        ["--trick-final-pipeline-ms" as string]: `${POST_TRICK_READ_MS + WINNER_HIGHLIGHT_MS + TRICK_SWEEP_MS + NEXT_LEAD_GAP_MS}ms`,
        ["--deal-card-stagger-ms" as string]: `${handTiming.dealCardStaggerMs}ms`,
        ["--draw-discard-ms" as string]: `${handTiming.drawDiscardMs}ms`,
        ["--draw-replace-ms" as string]: `${handTiming.drawReplaceMs}ms`,
      }}
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
            <PotCenter
              potMetrics={{
                ...potMetrics,
                currentPot: handPresentation.antePotRevealed
                  ? handPresentation.displayPotAmount
                  : Math.max(
                      0,
                      handPresentation.displayPotAmount -
                        potMetrics.anteAmount * Math.max(1, participantCount),
                    ),
              }}
              participantCount={participantCount}
              trumpUpcard={session.trumpUpcard}
              trumpSuit={session.trumpSuit}
              phase={session.phase}
              enrollmentActive={enrollmentActive}
              remainingDeckCount={session.remainingDeckCount}
              trickDisplayPlays={trickPresentation.displayPlays}
              trickLeadSuit={session.currentTrick?.leadSuit ?? session.leadSuit ?? null}
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
              trumpMergeActive={handPresentation.trumpMergeActive}
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
              revealCatchUp={revealCatchUpActive}
              peakTrickPlayCount={trickPresentation.peakPlayCount}
              discardPileCards={discardPileCards}
              currentUserId={currentUserId}
              onCardLanded={cardAudio.onCardLanded}
            />
          </div>

          <div className="btable__seats btable-mobile__seats" aria-label="Players at the table">
            {opponents.map((player, i) => {
              const layout = resolveMobileOpponentLayout(
                i,
                rotated.length,
                orientation,
              );
              const seatPlayer = displayPlayers.find((p) => p.playerId === player.playerId) ?? player;
              return (
                <div
                  key={player.playerId}
                  className={`btable__seat-slot btable__seat-slot--${i}`}
                  data-seat-index={i + 1}
                >
                  <Seat
                    player={seatPlayer}
                    region={layout.region}
                    handLane={layout.handLane}
                    clockwiseDealing={clockwiseDealing}
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
                    onReaction={undefined}
                  />
                </div>
              );
            })}
            {feltSelfPlayer && feltSelfLayout && (
              <div
                key={feltSelfPlayer.playerId}
                className="btable__seat-slot btable__seat-slot--self"
                data-seat-index={0}
              >
                <Seat
                  player={
                    displayPlayers.find((p) => p.playerId === feltSelfPlayer.playerId) ??
                    feltSelfPlayer
                  }
                  region={feltSelfLayout.region}
                  handLane={feltSelfLayout.handLane}
                  clockwiseDealing={clockwiseDealing}
                  style={{
                    left: `${feltSelfLayout.x}%`,
                    top: `${feltSelfLayout.y}%`,
                  }}
                  onToggleInHand={() =>
                    onToggleInHand(
                      feltSelfPlayer.playerId,
                      feltSelfPlayer.canToggleInHand ? true : !feltSelfPlayer.inHand,
                    )
                  }
                  onPassEnrollment={
                    feltSelfPlayer.canPassEnrollment && onPassEnrollment
                      ? () => onPassEnrollment(feltSelfPlayer.playerId)
                      : undefined
                  }
                  onTrickDelta={(delta) => onTrickDelta(feltSelfPlayer.playerId, delta)}
                  onReaction={undefined}
                />
              </div>
            )}
          </div>
        </div>
        </div>
        </div>
      </div>

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
            heroCanAct != null
              ? heroCanAct
              : isHeroDrawOrPlayTurn({
                  currentUserId,
                  session,
                  suppressTurn: Boolean(suppressTurn),
                  handComplete,
                  enrollmentActive,
                  selfPlayer,
                }) && !visualCatchUpBusy
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
          trickNumber={session.currentTrick?.trickNumber ?? null}
          turnPlayerId={session.turnPlayerId}
          tableRootRef={wrapRef}
          pileIndexRef={pileIndexRef}
          onDiscardCommitted={commitDiscardCards}
          onUserActivity={onHeroUserActivity}
          skipHeroDealMotion={clockwiseDealing}
        />
        </div>
      </div>
    </div>
  );
}
