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
  formatLocalActionCue,
  formatWaitingCue,
  isCardsDealtPhase,
  isDecisionPhase,
  isRevealPhase,
  serializedToCard,
  turnIndicatorLabel,
} from "./handUi";
import { useTableEvents } from "./hooks/useTableEvents";
import { useHandPresentation } from "./hooks/useHandPresentation";
import { TurnCountdownSync } from "./TurnCountdownSync";
import { useTableMicrointeractions } from "./hooks/useTableMicrointeractions";
import { BourreResultSting } from "./BourreResultSting";
import { YourTurnAttention } from "./YourTurnAttention";
import { InactivityHelper } from "./InactivityHelper";
import { isLocalActionRequiredNow, localActionActivityKey } from "./localAction";
import { useTrumpTrickMotionGate } from "./hooks/useTrumpTrickMotionGate";
import { TrickPresentationSync } from "./TrickPresentationSync";
import { useExternalStoreSelector } from "./hooks/useExternalStoreSelector";
import {
  getTrickPresentationSnapshot,
  subscribeTrickPresentation,
} from "./trickPresentationStore";
import {
  selectTrickSessionBridge,
  trickSessionBridgeEqual,
} from "./trickPresentationSelectors";
import { setTrickAnimationBusyState, handPresentingBlocksBots } from "./trickAnimationBridge";
import {
  subscribePresentationMotionBusy,
  isDealPresentationActive,
  isTrickCollectionActive,
} from "./presentationMotionBusy";
import { formatNet } from "./logic";
import { SettlementCoWinPanel } from "./SettlementCoWinPanel";
import { SplitPotDecisionToast } from "./SplitPotDecisionToast";
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
  leaderLabel,
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
  const trickPresentationInput = useMemo(
    () => ({
      phase: session.phase,
      currentTrick: session.currentTrick,
      tricksByPlayer: session.tricksByPlayer,
      participantIds: session.participantIds,
      trumpSuit: session.trumpSuit,
      playedCards: session.playedCards,
      turnPlayerId: session.turnPlayerId,
      handComplete,
    }),
    [
      session.phase,
      session.currentTrick,
      session.tricksByPlayer,
      session.participantIds,
      session.trumpSuit,
      session.playedCards,
      session.turnPlayerId,
      handComplete,
    ],
  );

  const trickBridge = useExternalStoreSelector(
    subscribeTrickPresentation,
    getTrickPresentationSnapshot,
    selectTrickSessionBridge,
    trickSessionBridgeEqual,
  );

  const forceTrickHandEndDrain = trickBridge.forceHandEndDrain;

  const handPresentation = useHandPresentation({
    session,
    enrollmentActive,
    potAmount: potMetrics.currentPot,
    handComplete,
    trickPipelineActive: trickBridge.isPipelineActive,
    forceTrickHandEndDrain,
    heroCards,
    enrolledIds: session.handEnrollment?.enrolledIds ?? EMPTY_ENROLLMENT_IDS,
    declinedIds: session.handEnrollment?.declinedIds ?? EMPTY_ENROLLMENT_IDS,
    actionOrder:
      session.actionOrder ??
      session.handEnrollment?.orderedPlayerIds ??
      session.participantIds,
  });

  const instantTrickPlays = useTrumpTrickMotionGate(
    session.phase,
    session.trumpUpcard,
    trickBridge.displayPlaysLength,
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
      pipelineActive: trickBridge.isPipelineActive,
      revealCatchUp:
        trickBridge.phase === "live" &&
        trickBridge.revealedCount < trickBridge.revealTarget,
      motionGateActive: instantTrickPlays,
      peakPlayCount: trickBridge.peakPlayCount,
      displayedPlayCount: trickBridge.displayPlaysLength,
      handPresenting: handPresentingForBots,
      handPresentationPhase: handPresentation.phase,
      dealPresentationActive: isDealPresentationActive(),
      trickCollectionActive: isTrickCollectionActive(),
    });
  }, [
    trickBridge.isPipelineActive,
    trickBridge.phase,
    trickBridge.revealedCount,
    trickBridge.revealTarget,
    trickBridge.peakPlayCount,
    trickBridge.displayPlaysLength,
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
    trickBridge.suppressTurnPlayerId || handPresentation.suppressTurnIndicator;
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
    !showCoWinSettlement &&
    selfPlayer?.isOut === true &&
    Boolean(actions.onRebuy);
  const isMyTurn =
    Boolean(currentUserId && session.turnPlayerId === currentUserId) &&
    !suppressTurn;

  const localActionRequired = isLocalActionRequiredNow({
    currentUserId,
    enrollmentActive,
    selfPlayer,
    session,
    suppressTurn: Boolean(suppressTurn),
    handComplete,
  });
  const actionCue =
    localActionRequired &&
    !handComplete &&
    (enrollmentActive || session.phase === "decision")
      ? formatLocalActionCue(session.phase, enrollmentActive)
      : null;
  const waitingCue =
    !actionCue &&
    !suppressTurn &&
    !(turnLabel && cardsDealt && trickBridge.phase === "live")
      ? formatWaitingCue({
          phase: session.phase,
          enrollmentActive,
          isMyTurn,
          handComplete,
          cardsDealt,
        })
      : null;

  const turnReminderActivityKey = localActionActivityKey({
    currentUserId,
    enrollmentActive,
    selfPlayer,
    session,
    suppressTurn: Boolean(suppressTurn),
    handComplete,
  });

  const [heroHasInteracted, setHeroHasInteracted] = useState(false);
  useEffect(() => {
    setHeroHasInteracted(false);
  }, [turnReminderActivityKey]);

  const handleHeroUserActivity = useCallback(() => {
    setHeroHasInteracted(true);
  }, []);

  const inactivityHelperRequired =
    localActionRequired &&
    !handComplete &&
    !heroHasInteracted &&
    (session.phase === "draw" || session.phase === "play");

  const turnCountdownInput = useMemo(
    () => ({
      session: {
        phase: session.phase,
        turnPlayerId: session.turnPlayerId,
        drawCompletedIds: session.drawCompletedIds,
        handEnrollment: session.handEnrollment,
        participantIds: session.participantIds,
        tricksByPlayer: session.tricksByPlayer,
        handNumber: session.handNumber,
        pendingCoWinSettlement: session.pendingCoWinSettlement,
      },
      suppressTurn: Boolean(suppressTurn),
      handComplete,
    }),
    [
      session.phase,
      session.turnPlayerId,
      session.drawCompletedIds,
      session.handEnrollment,
      session.participantIds,
      session.tricksByPlayer,
      session.handNumber,
      session.pendingCoWinSettlement,
      suppressTurn,
      handComplete,
    ],
  );

  const showTrumpSuitReminder =
    trumpHolderPresentation.showTrumpSuitReminder ||
    (!session.trumpUpcard && Boolean(session.trumpSuit) && session.phase === "play");
  const tricksSnapshot = useMemo(
    () => ({ ...trickBridge.displayTricksByPlayer }),
    [trickBridge.displayTricksByPlayer],
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
    trickWinnerSeatId: trickBridge.trickWinnerSeatId,
    trickPhase: trickBridge.phase,
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
      onHeroUserActivity: handleHeroUserActivity,
    }),
    [actions, handleReaction, players, heroHandDisplay.indexMode, heroHandDisplay.trumpDisabledIndex, handleHeroUserActivity],
  );

  const sharedTableProps = useMemo(
    () => ({
      session,
      players,
      potMetrics,
      participantCount,
      enrollmentActive,
      heroCards: displayHeroCards,
      revealedTrumpIndex: heroHandDisplay.revealedTrumpIndex,
      trumpMergeActive: heroHandDisplay.trumpMergeActive,
      trumpDisabledIndex: heroHandDisplay.trumpDisabledIndex,
      hideCenterTrump: trumpHolderPresentation.hideCenterTrump,
      showTrumpSuitReminder,
      trumpHolderPresentation,
      privateHandReady,
      currentUserId,
      legalPlayIndices: displayLegalPlayIndices,
      recommendedPlayIndex: displayRecommendedPlayIndex,
      recommendedDiscardIndices: displayRecommendedDiscardIndices,
      handComplete,
      actionFeedback,
      handPresentation,
      microinteractions,
      instantTrickPlays,
      bigPotEvent,
      onDismissTableEvent: dismissEvent,
      ...tableCallbacks,
    }),
    [
      session,
      players,
      potMetrics,
      participantCount,
      enrollmentActive,
      displayHeroCards,
      heroHandDisplay.revealedTrumpIndex,
      heroHandDisplay.trumpMergeActive,
      heroHandDisplay.trumpDisabledIndex,
      trumpHolderPresentation,
      showTrumpSuitReminder,
      privateHandReady,
      currentUserId,
      displayLegalPlayIndices,
      displayRecommendedPlayIndex,
      displayRecommendedDiscardIndices,
      handComplete,
      actionFeedback,
      handPresentation,
      microinteractions,
      instantTrickPlays,
      bigPotEvent,
      dismissEvent,
      tableCallbacks,
    ],
  );

  const gameplayStage = (
    <>
      <TrickPresentationSync {...trickPresentationInput} />
      <TurnCountdownSync input={turnCountdownInput} />
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
    if (!handPresentation.trumpMergedIntoHand) return;
    if (handPresentation.phase !== "drawPlayer") return;
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
    handPresentation.trumpMergedIntoHand,
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
      data-trick-resolving={trickBridge.isPipelineActive ? "true" : "false"}
      data-hand-settling={handPresentation.settleAnimActive ? "true" : "false"}
      data-hand-complete={handComplete ? "true" : "false"}
    >
      {actionFeedback && actionFeedback.status !== "idle" && (
        <div
          className={[
            `btable-session__feedback btable-session__feedback--${actionFeedback.status}`,
            actionFeedback.status === "error" ? "btable-session__feedback--pulse-error" : "",
            actionFeedback.status === "success" ? "btable-session__feedback--pulse" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          key={
            actionFeedback.status === "error"
              ? `feedback-error-${microinteractions.feedbackErrorPulse}`
              : actionFeedback.status === "success"
                ? `feedback-success-${microinteractions.feedbackSuccessPulse}`
                : `feedback-${actionFeedback.status}`
          }
          data-testid="feedback-banner"
          role={actionFeedback.status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {actionFeedback.message}
        </div>
      )}
      <header className="btable-session__head">
        <div className="btable-session__head-row">
          <h5 className="btable-session__title">Hand #{session.handNumber}</h5>
          <span
            className={`btable-session__phase-tag btable-session__phase-tag--${session.phase ?? "waiting"}`}
            data-testid="phase-tag"
            data-phase={session.phase ?? "waiting"}
          >
            {phaseLabel}
          </span>
          <button
            type="button"
            className="btable-session__gear btn btn--sm"
            data-testid="settings-button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Table appearance settings"
            title={`Settings (${settings.hotkeys.toggleSettings})`}
          >
            ⚙
          </button>
        </div>
        <p className="btable-session__status">{leaderLabel}</p>
        {handPresentation.trumpRevealActive && session.phase === "draw" && (
          <p className="btable-session__turn muted small" aria-live="polite">
            Trump revealed — settling into your hand
          </p>
        )}
        {handPresentation.trumpMergeActive && session.phase === "draw" && (
          <p className="btable-session__turn muted small" aria-live="polite">
            Trump joining your hand…
          </p>
        )}
        {handPresentation.phase === "drawReady" && (
          <p className="btable-session__turn muted small" aria-live="polite">
            Draw complete — first lead coming up
          </p>
        )}
        <div className="btable-session__turn-stack" aria-live="polite">
          {handPresentation.settleAnimActive && (
            <p className="btable-session__turn btable-session__turn--settle muted small">
              Settling the pot…
            </p>
          )}
          <p className="btable-session__turn btable-session__turn--trick-resolve muted small">
            Trick won — cards collecting before the next lead
          </p>
          {handPresentation.settleAnimActive && (
            <p className="btable-session__turn btable-session__turn--final-trick muted small">
              Final trick — cards collecting before the pot settles
            </p>
          )}
        </div>
        {turnLabel && cardsDealt && trickBridge.phase === "live" && (
          <p
            className={[
              "btable-session__turn",
              isMyTurn ? "btable-session__turn--yours" : "btable-session__turn--waiting",
            ].join(" ")}
            aria-live="polite"
            data-testid="turn-indicator"
          >
            {turnLabel}
          </p>
        )}
        {actionCue && (
          <p className="btable-session__action-cue" data-testid="action-cue" aria-live="polite">
            {actionCue}
          </p>
        )}
        <InactivityHelper
          actionRequired={inactivityHelperRequired}
          activityKey={turnReminderActivityKey}
          phase={session.phase}
          hasUserInteracted={heroHasInteracted}
        />
        {waitingCue && (
          <p className="btable-session__hint btable-session__hint--waiting" data-testid="waiting-cue">
            {waitingCue}
          </p>
        )}
        {isRevealPhase(session.phase) && (
          <p className="btable-session__hint muted small" aria-live="polite">
            Cards dealt — trump revealed. Review your hand…
          </p>
        )}
        {enrollmentActive && !isRevealPhase(session.phase) && (
          <p className="btable-session__enroll muted small">
            Tap I&apos;m in or Pass at your seat — clockwise from dealer
          </p>
        )}
      </header>

      {!nativeMobile && (
        <p className="btable-session__rotate-hint" role="note">
          Rotate your phone to <strong>landscape</strong> for the full table (up to 8 players).
        </p>
      )}

      {nativeMobile ? (
        <MobileLayoutShell>
          <div className="btable-stage">{gameplayStage}</div>
        </MobileLayoutShell>
      ) : (
        <DesktopLayoutShell>
          <div className="btable-stage">{gameplayStage}</div>
        </DesktopLayoutShell>
      )}

      <TableSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {showCoWinSettlement && !session.isFinal && splitPotEnabled && (
        <SplitPotDecisionToast
          session={session}
          players={players}
          splitSharePerWinner={splitSharePerWinner}
          currentUserId={currentUserId}
          isCoWinner={isCoWinner}
          onAgreeSplit={() => actions.onSettle("split")}
          onDeclineSplit={() => actions.onSettle("push")}
          onCarryover={() => actions.onSettleCarryover?.()}
        />
      )}

      {showCoWinSettlement && !session.isFinal && !splitPotEnabled && (
        <SettlementCoWinPanel
          session={session}
          players={players}
          potMetrics={potMetrics}
          splitSharePerWinner={splitSharePerWinner}
          currentUserId={currentUserId}
          isCoWinner={isCoWinner}
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
