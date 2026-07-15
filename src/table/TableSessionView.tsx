import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CardTable } from "./CardTable";
import { MobileCardTable } from "./MobileCardTable";
import { CinematicSplash } from "./CinematicSplash";
import { DesktopLayoutShell } from "./DesktopLayoutShell";
import { MobileLayoutShell } from "./MobileLayoutShell";
import { EventReactions } from "./EventReactions";
import { FeedbackSettings } from "./FeedbackSettings";
import { playActionSuccessFeedback, playIllegalActionFeedback } from "./feedback";
import { TableSettingsPanel } from "./TableSettingsPanel";
import {
  formatHandPhase,
  isCardsDealtPhase,
  isDecisionPhase,
  isRevealPhase,
  serializedToCard,
  turnIndicatorLabel,
} from "./handUi";
import { useTableEvents } from "./hooks/useTableEvents";
import { useHandPresentation } from "./hooks/useHandPresentation";
import { useAnteSeatCountdown } from "./hooks/useAnteSeatCountdown";
import { useTurnCountdown } from "./hooks/useTurnCountdown";
import { useTurnTimerWarning } from "./hooks/useTurnTimerWarning";
import { useTableMicrointeractions } from "./hooks/useTableMicrointeractions";
import { BourreResultSting } from "./BourreResultSting";
import { YourTurnAttention } from "./YourTurnAttention";
import { TableSceneOverlay } from "./TableSceneOverlay";
import { isLocalActionRequiredNow, isHeroDrawOrPlayTurn, localActionActivityKey } from "./localAction";
import { useTrumpTrickMotionGate } from "./hooks/useTrumpTrickMotionGate";
import { useTrickPresentation } from "./hooks/useTrickPresentation";
import { setTrickAnimationBusyState, handPresentingBlocksBots } from "./trickAnimationBridge";
import {
  subscribePresentationMotionBusy,
  isAntePresentationActive,
  isDealPresentationActive,
  isTrickCollectionActive,
} from "./presentationMotionBusy";
import { formatNet } from "./logic";
import { SettlementCoWinPanel } from "./SettlementCoWinPanel";
import { SplitPotDecisionToast } from "./SplitPotDecisionToast";
import { buildCoWinSettlementView } from "./settlementCopy";
import { useCoWinResultVisibility } from "./useCoWinResultVisibility";
import { useTableTheme } from "./theme/useTableTheme";
import { useMobileTable } from "./useMobileTable";
import {
  mapDisplayIndicesToEffective,
  mapEffectiveIndicesToDisplay,
  resolveHeroHandDisplay,
} from "./heroHandDisplay";
import { computeRecommendedDiscardIndices, computeRecommendedPlayIndex } from "./heroHandPlayPreselect";
import { resolveTrumpHolderPresentation } from "./trumpHolderPresentation";
import type { Suit } from "../types";
import type { TableSessionViewProps } from "./types";

/** Stable fallbacks — inline `?? []` creates new refs every render and loops hand presentation. */
const EMPTY_ENROLLMENT_IDS: string[] = [];
const EMPTY_HERO_CARDS: never[] = [];
const EMPTY_BOURRE_IDS: string[] = [];

export function TableSessionView({
  session,
  players,
  potMetrics,
  mySessionNet,
  leaderLabel: _leaderLabel,
  showCoWinSettlement,
  splitPotEnabled = false,
  rebuyEnabled = false,
  splitSharePerWinner = 0,
  enrollmentActive = false,
  currentUserId,
  heroCards = EMPTY_HERO_CARDS,
  rawHeroCards = EMPTY_HERO_CARDS,
  privateHandReady = false,
  legalPlayIndices,
  recentBourreIds = EMPTY_BOURRE_IDS,
  handComplete = false,
  actionFeedback,
  actions,
}: TableSessionViewProps) {
  const { settings } = useTableTheme();
  const nativeMobile = useMobileTable();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const participantCount = session.participantIds.length;
  const { events, dismissEvent, pushReaction } = useTableEvents({
    session,
    potMetrics,
    participantIds: session.participantIds,
  });

  const bigPotEvent = useMemo(
    () => [...events].reverse().find((e) => e.kind === "big-pot") ?? null,
    [events],
  );

  const isCoWinner =
    currentUserId != null &&
    (session.pendingCoWinSettlement?.winnerIds || []).includes(currentUserId);
  const trickPresentation = useTrickPresentation({
    phase: session.phase,
    handNumber: session.handNumber,
    currentTrick: session.currentTrick,
    tricksByPlayer: session.tricksByPlayer,
    participantIds: session.participantIds,
    trumpSuit: session.trumpSuit,
    playedCards: session.playedCards,
    turnPlayerId: session.turnPlayerId,
    handComplete,
  });

  const forceTrickHandEndDrain = trickPresentation.forceHandEndDrain;

  const handPresentation = useHandPresentation({
    session,
    enrollmentActive,
    potAmount: potMetrics.currentPot,
    handComplete,
    trickPipelineActive: trickPresentation.isPipelineActive,
    forceTrickHandEndDrain,
    heroCards,
    enrolledIds: session.handEnrollment?.enrolledIds ?? EMPTY_ENROLLMENT_IDS,
    declinedIds: session.handEnrollment?.declinedIds ?? EMPTY_ENROLLMENT_IDS,
    actionOrder:
      session.actionOrder ??
      session.handEnrollment?.orderedPlayerIds ??
      session.participantIds,
  });

  const shouldClearHandEndEcho =
    handPresentation.phase === "settle" ||
    handPresentation.phase === "nextHandReset" ||
    handPresentation.phase === "ante";

  useEffect(() => {
    if (!shouldClearHandEndEcho) return;
    if (!trickPresentation.showFinalTrickEcho) return;
    trickPresentation.clearHandEndEcho();
  }, [
    shouldClearHandEndEcho,
    trickPresentation.showFinalTrickEcho,
    trickPresentation.clearHandEndEcho,
  ]);

  const coWinProposalKey = useMemo(() => {
    const winnerIds = session.pendingCoWinSettlement?.winnerIds ?? [];
    return `${session.handNumber}:${winnerIds.join(",")}`;
  }, [session.handNumber, session.pendingCoWinSettlement?.winnerIds]);

  const coWinResultMessage = useMemo(() => {
    if (!showCoWinSettlement) return "";
    const view = buildCoWinSettlementView({
      tricksByPlayer: session.tricksByPlayer,
      participantIds: session.participantIds,
      players: players.map((p) => ({ playerId: p.playerId, displayName: p.displayName })),
      pot: {
        currentPot: potMetrics.currentPot,
        maxWinThisHand: potMetrics.maxWinThisHand,
        carryIn: session.carryOverPot ?? 0,
        limEnabled: potMetrics.limEnabled,
        overflow: potMetrics.overflow,
      },
      pendingVotes: session.pendingCoWinSettlement?.votes,
      splitSharePerWinner,
      currentUserId,
      winnerIds: session.pendingCoWinSettlement?.winnerIds,
    });
    return [view.headline, view.subhead, view.potLine].filter(Boolean).join(" · ");
  }, [
    showCoWinSettlement,
    session.tricksByPlayer,
    session.participantIds,
    session.carryOverPot,
    session.pendingCoWinSettlement?.votes,
    session.pendingCoWinSettlement?.winnerIds,
    players,
    potMetrics.currentPot,
    potMetrics.maxWinThisHand,
    potMetrics.limEnabled,
    potMetrics.overflow,
    splitSharePerWinner,
    currentUserId,
  ]);

  const { visible: coWinResultVisible, manualContinueAllowed: coWinManualContinueAllowed } =
    useCoWinResultVisibility(showCoWinSettlement, coWinProposalKey, coWinResultMessage);

  const instantTrickPlays = useTrumpTrickMotionGate(
    session.phase,
    session.trumpUpcard,
    trickPresentation.displayPlays.length,
  );

  // Server play/draw is authoritative — do not block bots on peer draw animations.
  const handPresentingForBots = handPresentingBlocksBots(
    handPresentation.isPresenting,
    handPresentation.phase,
    session.phase,
  );

  const [motionBusyTick, setMotionBusyTick] = useState(0);
  useEffect(() => subscribePresentationMotionBusy(() => setMotionBusyTick((n) => n + 1)), []);

  useEffect(() => {
    setTrickAnimationBusyState({
      pipelineActive: trickPresentation.isPipelineActive,
      revealCatchUp:
        trickPresentation.phase === "live" &&
        trickPresentation.revealedCount < trickPresentation.revealTarget,
      motionGateActive: instantTrickPlays,
      peakPlayCount: trickPresentation.peakPlayCount,
      displayedPlayCount: trickPresentation.displayPlays.length,
      handPresenting: handPresentingForBots,
      handPresentationPhase: handPresentation.phase,
      dealPresentationActive: isDealPresentationActive(),
      antePresentationActive: isAntePresentationActive(),
      trickCollectionActive: isTrickCollectionActive(),
    });
  }, [
    trickPresentation.isPipelineActive,
    trickPresentation.phase,
    trickPresentation.revealedCount,
    trickPresentation.revealTarget,
    trickPresentation.peakPlayCount,
    trickPresentation.displayPlays.length,
    instantTrickPlays,
    handPresentingForBots,
    handPresentation.phase,
    session.phase,
    motionBusyTick,
  ]);

  const cardsDealt = isCardsDealtPhase(session.phase);

  const trumpHolderPresentation = useMemo(
    () =>
      resolveTrumpHolderPresentation({
        trumpHolderId: session.trumpHolderId ?? session.dealerId,
        trumpUpcard: session.trumpUpcard ?? null,
        trumpSuit: session.trumpSuit ?? null,
        phase: session.phase ?? null,
        handPresentation: {
          trumpRevealActive: handPresentation.trumpRevealActive,
          trumpMergeActive: handPresentation.trumpMergeActive,
          trumpMergedIntoHand: handPresentation.trumpMergedIntoHand,
        },
      }),
    [
      session.trumpHolderId,
      session.dealerId,
      session.trumpUpcard,
      session.trumpSuit,
      session.phase,
      handPresentation.trumpRevealActive,
      handPresentation.trumpMergeActive,
      handPresentation.trumpMergedIntoHand,
    ],
  );

  const heroHandDisplay = useMemo(
    () =>
      resolveHeroHandDisplay({
        rawHeroCards,
        effectiveHeroCards: heroCards,
        playerId: currentUserId,
        trumpHolderId: session.trumpHolderId ?? session.dealerId,
        trumpUpcard: session.trumpUpcard ?? null,
        trumpSuit: session.trumpSuit ?? null,
        phase: session.phase ?? null,
        handPresentation: {
          trumpRevealActive: handPresentation.trumpRevealActive,
          trumpMergeActive: handPresentation.trumpMergeActive,
          trumpMergedIntoHand: handPresentation.trumpMergedIntoHand,
        },
      }),
    [
      rawHeroCards,
      heroCards,
      currentUserId,
      session.trumpHolderId,
      session.dealerId,
      session.trumpUpcard,
      session.trumpSuit,
      session.phase,
      handPresentation.trumpRevealActive,
      handPresentation.trumpMergeActive,
      handPresentation.trumpMergedIntoHand,
    ],
  );

  const displayHeroCards = heroHandDisplay.displayCards;
  const displayLegalPlayIndices = useMemo(() => {
    if (!legalPlayIndices?.length || heroHandDisplay.indexMode === "effective") {
      return legalPlayIndices;
    }
    return mapEffectiveIndicesToDisplay(
      legalPlayIndices,
      heroHandDisplay.trumpDisabledIndex,
    );
  }, [legalPlayIndices, heroHandDisplay.indexMode, heroHandDisplay.trumpDisabledIndex]);

  const displayRecommendedPlayIndex = useMemo(() => {
    if (!legalPlayIndices?.length || !heroCards.length) return null;
    const effectiveHand = heroCards.map(serializedToCard);
    const effectiveRecommended = computeRecommendedPlayIndex(
      effectiveHand,
      {
        trumpSuit: (session.trumpSuit ?? "clubs") as Suit,
        currentTrick: session.currentTrick ?? null,
        leadSuit: (session.leadSuit ?? null) as Suit | null,
        cinchEnabled: session.cinchEnabled === true,
      },
      legalPlayIndices,
    );
    if (effectiveRecommended == null) return null;
    if (heroHandDisplay.indexMode === "effective") return effectiveRecommended;
    const mapped = mapEffectiveIndicesToDisplay(
      [effectiveRecommended],
      heroHandDisplay.trumpDisabledIndex,
    );
    return mapped[0] ?? null;
  }, [
    legalPlayIndices,
    heroCards,
    session.trumpSuit,
    session.currentTrick,
    session.leadSuit,
    session.cinchEnabled,
    heroHandDisplay.indexMode,
    heroHandDisplay.trumpDisabledIndex,
  ]);

  const displayRecommendedDiscardIndices = useMemo(() => {
    if (session.phase !== "draw" || !heroCards.length) return [];
    const effectiveHand = heroCards.map(serializedToCard);
    const excludedEffective =
      heroHandDisplay.indexMode === "display" && heroHandDisplay.trumpDisabledIndex != null
        ? mapDisplayIndicesToEffective(
            [heroHandDisplay.trumpDisabledIndex],
            heroHandDisplay.trumpDisabledIndex,
          )
        : heroHandDisplay.trumpDisabledIndex != null
          ? [heroHandDisplay.trumpDisabledIndex]
          : [];
    const effectiveRecommended = computeRecommendedDiscardIndices(
      effectiveHand,
      (session.trumpSuit ?? "clubs") as Suit,
      session.maxDrawDiscards ?? 4,
      session.remainingDeckCount ?? Number.POSITIVE_INFINITY,
      excludedEffective,
    );
    if (heroHandDisplay.indexMode === "effective") return effectiveRecommended;
    return mapEffectiveIndicesToDisplay(
      effectiveRecommended,
      heroHandDisplay.trumpDisabledIndex,
    );
  }, [
    session.phase,
    heroCards,
    session.trumpSuit,
    session.maxDrawDiscards,
    session.remainingDeckCount,
    heroHandDisplay.indexMode,
    heroHandDisplay.trumpDisabledIndex,
  ]);
  const suppressTurn =
    trickPresentation.suppressTurnPlayerId || handPresentation.suppressTurnIndicator;
  const phaseLabel = formatHandPhase(session.phase, enrollmentActive);
  const turnLabel =
    suppressTurn
      ? null
      : turnIndicatorLabel(session.turnPlayerId, players);
  const selfPlayer = players.find((p) => p.isSelf);
  const lockedInLiveHand =
    currentUserId != null &&
    session.participantIds.includes(currentUserId) &&
    (session.phase === "draw" || session.phase === "play");
  const showRebuyOffer =
    rebuyEnabled &&
    !session.isFinal &&
    !lockedInLiveHand &&
    !coWinResultVisible &&
    selfPlayer?.isOut === true &&
    Boolean(actions.onRebuy);
  const isMyTurn = isHeroDrawOrPlayTurn({
    currentUserId,
    session,
    suppressTurn: Boolean(suppressTurn),
    handComplete,
    enrollmentActive,
    selfPlayer,
  });

  const localActionRequired = isLocalActionRequiredNow({
    currentUserId,
    enrollmentActive,
    selfPlayer,
    session,
    suppressTurn: Boolean(suppressTurn),
    handComplete,
  });

  const turnReminderActivityKey = localActionActivityKey({
    currentUserId,
    enrollmentActive,
    selfPlayer,
    session,
    suppressTurn: Boolean(suppressTurn),
    handComplete,
  });

  const { countdown: turnCountdown } = useTurnCountdown({
    session,
    suppressTurn: Boolean(suppressTurn),
    handComplete,
  });

  const anteSeatCountdown = useAnteSeatCountdown({
    anteAnimActive: handPresentation.anteAnimActive,
    session,
  });

  const avatarTurnCountdown = anteSeatCountdown ?? turnCountdown;

  useTurnTimerWarning({
    session,
    suppressTurn: Boolean(suppressTurn),
    handComplete,
    currentUserId,
    localActionPending: actionFeedback?.status === "loading",
  });

  const showTrumpSuitReminder =
    trumpHolderPresentation.showTrumpSuitReminder ||
    (!session.trumpUpcard && Boolean(session.trumpSuit) && session.phase === "play");
  const tricksSnapshot = useMemo(
    () => ({ ...trickPresentation.displayTricksByPlayer }),
    [trickPresentation.displayTricksByPlayer],
  );
  const bankrollByPlayer = useMemo(
    () =>
      Object.fromEntries(
        players.map((p) => [p.playerId, Math.max(0, Number(p.bankroll) || 0)]),
      ),
    [players],
  );
  const microinteractions = useTableMicrointeractions({
    turnPlayerId: session.turnPlayerId ?? null,
    dealerId: session.dealerId,
    potAmount: handPresentation.displayPotAmount,
    tricksByPlayer: tricksSnapshot,
    bankrollByPlayer,
    bourrePlayerIds: recentBourreIds ?? [],
    phase: session.phase ?? null,
    showTrumpSuitReminder,
    suppressTurn: Boolean(suppressTurn),
    actionFeedbackStatus: actionFeedback?.status ?? "idle",
    trickWinnerSeatId: trickPresentation.trickWinnerSeatId,
    trickPhase: trickPresentation.phase,
  });
  const selfBourreSting =
    Boolean(selfPlayer?.playerId) &&
    (recentBourreIds ?? []).includes(selfPlayer!.playerId) &&
    microinteractions.bourreAlerts[selfPlayer!.playerId] === "pulse";

  const prevErrorPulseRef = useRef(0);
  const prevSuccessPulseRef = useRef(0);
  useEffect(() => {
    if (microinteractions.feedbackErrorPulse > prevErrorPulseRef.current) {
      playIllegalActionFeedback();
    }
    prevErrorPulseRef.current = microinteractions.feedbackErrorPulse;
  }, [microinteractions.feedbackErrorPulse]);

  useEffect(() => {
    if (microinteractions.feedbackSuccessPulse > prevSuccessPulseRef.current) {
      playActionSuccessFeedback();
    }
    prevSuccessPulseRef.current = microinteractions.feedbackSuccessPulse;
  }, [microinteractions.feedbackSuccessPulse]);

  const handleReaction = useCallback(
    (emoji: string) => {
      pushReaction(emoji, currentUserId ?? undefined);
    },
    [pushReaction, currentUserId],
  );

  const tableCallbacks = useMemo(
    () => ({
      onToggleInHand: (playerId: string, inHand: boolean) => {
        const p = players.find((x) => x.playerId === playerId);
        if (p?.isSelf) actions.onToggleInHand(inHand);
      },
      onPassEnrollment: (playerId: string) => {
        const p = players.find((x) => x.playerId === playerId);
        if (p?.isSelf && actions.onPassEnrollment) actions.onPassEnrollment();
      },
      onTrickDelta: (playerId: string, delta: number) => {
        const p = players.find((x) => x.playerId === playerId);
        if (p?.isSelf) actions.onTrickDelta(delta);
      },
      onSubmitDraw: (discardIndices: number[]) => {
        if (!actions.onSubmitDraw) return;
        const indices =
          heroHandDisplay.indexMode === "display"
            ? mapDisplayIndicesToEffective(
                discardIndices,
                heroHandDisplay.trumpDisabledIndex,
              )
            : discardIndices;
        return actions.onSubmitDraw(indices);
      },
      onPassDraw: actions.onPassDraw,
      onFoldDraw: actions.onFoldDraw,
      onPlayCard: (cardIndex: number) => {
        if (!actions.onPlayCard) return;
        if (heroHandDisplay.indexMode !== "display") {
          return actions.onPlayCard(cardIndex);
        }
        const effective = mapDisplayIndicesToEffective(
          [cardIndex],
          heroHandDisplay.trumpDisabledIndex,
        )[0];
        if (effective == null) return;
        return actions.onPlayCard(effective);
      },
      onReaction: handleReaction,
    }),
    [actions, handleReaction, players, heroHandDisplay.indexMode, heroHandDisplay.trumpDisabledIndex],
  );

  const sharedTableProps = {
    session,
    players,
    potMetrics,
    participantCount,
    enrollmentActive,
    heroCards: displayHeroCards,
    revealedTrumpIndex: heroHandDisplay.revealedTrumpIndex,
    trumpMergeActive: heroHandDisplay.trumpMergeActive,
    trumpDisabledIndex: heroHandDisplay.trumpDisabledIndex,
    hideCenterTrump: heroHandDisplay.hideCenterTrumpForHolder,
    showTrumpSuitReminder,
    trumpHolderPresentation,
    privateHandReady,
    currentUserId,
    legalPlayIndices: displayLegalPlayIndices,
    recommendedPlayIndex: displayRecommendedPlayIndex,
    recommendedDiscardIndices: displayRecommendedDiscardIndices,
    handComplete,
    actionFeedback,
    trickPresentation,
    handPresentation,
    microinteractions,
    instantTrickPlays,
    turnCountdown: avatarTurnCountdown,
    bigPotEvent,
    onDismissTableEvent: dismissEvent,
    ...tableCallbacks,
  };

  const gameplayStage = (
    <>
      <div className="btable-session__attention-layer" aria-live="polite">
        <YourTurnAttention
          actionRequired={localActionRequired}
          activityKey={turnReminderActivityKey}
        />
      </div>
      <BourreResultSting active={selfBourreSting} displayName={selfPlayer?.displayName} />
      <EventReactions events={events} onDismiss={dismissEvent} />
      <CinematicSplash events={events} onDismiss={dismissEvent} />
      {nativeMobile ? (
        <MobileCardTable {...sharedTableProps} />
      ) : (
        <CardTable {...sharedTableProps} />
      )}
    </>
  );

  const revealAdvancedRef = useRef(false);
  useEffect(() => {
    revealAdvancedRef.current = false;
  }, [session.handNumber, session.sessionId]);

  useEffect(() => {
    if (session.phase !== "reveal") return;
    if (handPresentation.anteAnimActive || handPresentation.trumpRevealActive) return;
    if (handPresentation.phase !== "drawPlayer" && handPresentation.phase !== "drawReady") return;
    if (revealAdvancedRef.current || !actions.onAdvanceReveal) return;

    const advance = actions.onAdvanceReveal();
    void Promise.resolve(advance).then(
      () => {
        revealAdvancedRef.current = true;
      },
      () => {
        revealAdvancedRef.current = false;
      },
    );
  }, [
    session.phase,
    session.handNumber,
    session.sessionId,
    handPresentation.anteAnimActive,
    handPresentation.trumpRevealActive,
    handPresentation.phase,
    actions,
  ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === settings.hotkeys.toggleSettings || (e.key === "," && e.metaKey)) {
        setSettingsOpen((o) => !o);
      }
      if (e.key === settings.hotkeys.focusTable) {
        document.querySelector(".btable-wrap")?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settings.hotkeys]);

  useEffect(() => {
    const openSettings = () => setSettingsOpen(true);
    window.addEventListener("nbl-open-table-settings", openSettings);
    return () => window.removeEventListener("nbl-open-table-settings", openSettings);
  }, []);

  return (
    <div
      className={[
        "btable-session",
        nativeMobile ? "btable-session--native-mobile btable-session--mobile-layout" : "",
        settingsOpen ? "btable-session--settings-open" : "",
        isRevealPhase(session.phase) ? "btable-session--reveal-phase" : "",
        isDecisionPhase(session.phase) ? "btable-session--decision-phase" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-trick-resolving={trickPresentation.isPipelineActive ? "true" : "false"}
      data-hand-settling={handPresentation.settleAnimActive ? "true" : "false"}
      data-hand-complete={handComplete ? "true" : "false"}
    >
      <header className="btable-session__head" aria-hidden="true">
        <span className="btable-sr-only" data-testid="phase-tag" data-phase={session.phase ?? "waiting"}>
          {phaseLabel}
        </span>
      </header>

      {!nativeMobile && (
        <p className="btable-session__rotate-hint" role="note">
          Rotate your phone to <strong>landscape</strong> for the full table (up to 8 players).
        </p>
      )}

      {nativeMobile ? (
        <MobileLayoutShell>
          <div className="btable-stage">
            <TableSceneOverlay
              actionFeedback={actionFeedback}
              feedbackErrorPulse={microinteractions.feedbackErrorPulse}
              feedbackSuccessPulse={microinteractions.feedbackSuccessPulse}
              turnLabel={turnLabel}
              isMyTurn={isMyTurn}
              showTurn={Boolean(turnLabel && cardsDealt && trickPresentation.phase === "live")}
            />
            {gameplayStage}
          </div>
        </MobileLayoutShell>
      ) : (
        <DesktopLayoutShell>
          <div className="btable-stage">
            <TableSceneOverlay
              actionFeedback={actionFeedback}
              feedbackErrorPulse={microinteractions.feedbackErrorPulse}
              feedbackSuccessPulse={microinteractions.feedbackSuccessPulse}
              turnLabel={turnLabel}
              isMyTurn={isMyTurn}
              showTurn={Boolean(turnLabel && cardsDealt && trickPresentation.phase === "live")}
            />
            {gameplayStage}
          </div>
        </DesktopLayoutShell>
      )}

      <TableSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {coWinResultVisible && !session.isFinal && splitPotEnabled && (
        <SplitPotDecisionToast
          session={session}
          players={players}
          splitSharePerWinner={splitSharePerWinner}
          currentUserId={currentUserId}
          isCoWinner={isCoWinner}
          resultMessage={coWinResultMessage}
          manualContinueAllowed={coWinManualContinueAllowed}
          onAgreeSplit={() => actions.onSettle("split")}
          onDeclineSplit={() => actions.onSettle("push")}
          onCarryover={() => actions.onSettleCarryover?.()}
        />
      )}

      {coWinResultVisible && !session.isFinal && !splitPotEnabled && (
        <SettlementCoWinPanel
          session={session}
          players={players}
          potMetrics={potMetrics}
          splitSharePerWinner={splitSharePerWinner}
          currentUserId={currentUserId}
          isCoWinner={isCoWinner}
          manualContinueAllowed={coWinManualContinueAllowed}
          onSettle={(choice) => actions.onSettle(choice)}
        />
      )}

      <footer className="btable-session__foot muted small">
        <FeedbackSettings compact />
        {showRebuyOffer && (
          <div className="btable-session__rebuy-offer">
            <p className="btable-session__rebuy-copy">You&apos;re out — rebuy to join the next hand.</p>
            <button
              type="button"
              className="btn btn--sm btn--primary"
              data-testid="rebuy-button"
              onClick={() => void actions.onRebuy?.()}
            >
              Rebuy
            </button>
          </div>
        )}
        {mySessionNet != null ? (
          <>Your session profit/loss {formatNet(mySessionNet)}</>
        ) : (
          <>Shared pot and game state only · sign in to track your ledger</>
        )}
      </footer>
    </div>
  );
}
