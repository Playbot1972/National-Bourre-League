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
import { formatHandPhase, isCardsDealtPhase, isDecisionPhase, isRevealPhase, serializedToCard, turnIndicatorLabel } from "./handUi";
import { useTableEvents } from "./hooks/useTableEvents";
import { useHandPresentation } from "./hooks/useHandPresentation";
import { useTableMicrointeractions } from "./hooks/useTableMicrointeractions";
import { BourreResultSting } from "./BourreResultSting";
import { YourTurnAttention } from "./YourTurnAttention";
import { useDecisionCountdown } from "./hooks/useDecisionCountdown";
import { isLocalActionRequiredNow, localActionActivityKey } from "./localAction";
import { useTrickPresentation } from "./hooks/useTrickPresentation";
import { formatNet } from "./logic";
import { SettlementCoWinPanel } from "./SettlementCoWinPanel";
import { useTableTheme } from "./theme/useTableTheme";
import { useMobileTable } from "./useMobileTable";
import {
  mapDisplayIndicesToEffective,
  mapEffectiveIndicesToDisplay,
  resolveHeroHandDisplay,
} from "./heroHandDisplay";
import { computeRecommendedPlayIndex } from "./heroHandPlayPreselect";
import { resolveTrumpHolderPresentation } from "./trumpHolderPresentation";
import type { Suit } from "../types";
import type { TableSessionViewProps } from "./types";
import type { PotSnapshot } from "./settlementCopy";

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
  splitSharePerWinner = 0,
  enrollmentActive = false,
  enrollmentSecondsLeft = 0,
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

  const isCoWinner =
    currentUserId != null &&
    (session.pendingCoWinSettlement?.winnerIds || []).includes(currentUserId);
  const selfPendingHandChoice = players.find(
    (p) => p.isSelf && (p.canToggleInHand || p.canPassEnrollment),
  );
  const trickPresentation = useTrickPresentation({
    phase: session.phase,
    currentTrick: session.currentTrick,
    tricksByPlayer: session.tricksByPlayer,
    participantIds: session.participantIds,
    trumpSuit: session.trumpSuit,
    playedCards: session.playedCards,
    turnPlayerId: session.turnPlayerId,
  });
  const handPresentation = useHandPresentation({
    session,
    enrollmentActive,
    potAmount: potMetrics.currentPot,
    handComplete,
    trickPipelineActive: trickPresentation.isPipelineActive,
    heroCards,
    enrolledIds: session.handEnrollment?.enrolledIds ?? EMPTY_ENROLLMENT_IDS,
    declinedIds: session.handEnrollment?.declinedIds ?? EMPTY_ENROLLMENT_IDS,
    actionOrder: session.handEnrollment?.orderedPlayerIds ?? session.participantIds,
  });

  const cardsDealt = isCardsDealtPhase(session.phase);
  const presentationDecisionReady =
    handPresentation.phase === "decision" && cardsDealt;
  const selfDecision =
    Boolean(selfPendingHandChoice) &&
    (isDecisionPhase(session.phase) ||
      (isRevealPhase(session.phase) && presentationDecisionReady));
  const selfEnroll =
    Boolean(selfPendingHandChoice) && !selfDecision && !cardsDealt;

  const decisionLockRef = useRef(false);
  useEffect(() => {
    decisionLockRef.current = false;
  }, [session.sessionId, session.handNumber, session.handEnrollment?.currentIndex]);

  const handleDecisionExpire = useCallback(() => {
    if (decisionLockRef.current || !selfDecision) return;
    decisionLockRef.current = true;
    actions.onPassEnrollment?.();
  }, [selfDecision, actions]);

  const decisionCountdown = useDecisionCountdown({
    active: selfDecision,
    deadlineMs: session.handEnrollment?.turnDeadlineMs,
    onExpire: handleDecisionExpire,
  });

  const guardedPassEnrollment = useCallback(() => {
    decisionCountdown.cancel();
    if (decisionLockRef.current) return;
    decisionLockRef.current = true;
    actions.onPassEnrollment?.();
  }, [decisionCountdown, actions]);

  const guardedToggleInHand = useCallback(
    (inHand: boolean) => {
      if (selfDecision) decisionCountdown.cancel();
      if (inHand && selfDecision) {
        if (decisionLockRef.current) return;
        decisionLockRef.current = true;
      }
      actions.onToggleInHand(inHand);
    },
    [selfDecision, decisionCountdown, actions],
  );

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
  const suppressTurn =
    trickPresentation.suppressTurnPlayerId || handPresentation.suppressTurnIndicator;
  const phaseLabel = formatHandPhase(session.phase, enrollmentActive);
  const turnLabel =
    suppressTurn
      ? null
      : turnIndicatorLabel(session.turnPlayerId, players);
  const selfPlayer = players.find((p) => p.isSelf);
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

  const turnReminderActivityKey = localActionActivityKey({
    currentUserId,
    enrollmentActive,
    selfPlayer,
    session,
    suppressTurn: Boolean(suppressTurn),
    handComplete,
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

  const settlementPotMetrics: PotSnapshot = {
    currentPot: potMetrics.currentPot,
    maxWinThisHand: potMetrics.maxWinThisHand,
    limEnabled: potMetrics.limEnabled,
    overflow: potMetrics.overflow,
    carryIn: session.carryOverPot ?? 0,
  };

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
        if (p?.isSelf) {
          if (selfDecision) guardedToggleInHand(inHand);
          else actions.onToggleInHand(inHand);
        }
      },
      onPassEnrollment: (playerId: string) => {
        const p = players.find((x) => x.playerId === playerId);
        if (p?.isSelf && actions.onPassEnrollment) {
          if (selfDecision) guardedPassEnrollment();
          else actions.onPassEnrollment();
        }
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
    [actions, handleReaction, players, heroHandDisplay.indexMode, heroHandDisplay.trumpDisabledIndex, selfDecision, guardedPassEnrollment, guardedToggleInHand],
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
    hideCenterTrump: trumpHolderPresentation.hideCenterTrump,
    showTrumpSuitReminder,
    trumpHolderPresentation,
    privateHandReady,
    currentUserId,
    legalPlayIndices: displayLegalPlayIndices,
    recommendedPlayIndex: displayRecommendedPlayIndex,
    handComplete,
    actionFeedback,
    trickPresentation,
    handPresentation,
    microinteractions,
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
  const onAdvanceRevealRef = useRef(actions.onAdvanceReveal);
  onAdvanceRevealRef.current = actions.onAdvanceReveal;

  useEffect(() => {
    revealAdvancedRef.current = false;
  }, [session.handNumber, session.sessionId]);

  useEffect(() => {
    if (session.phase !== "reveal") return;
    if (!handPresentation.trumpMergedIntoHand) return;
    if (revealAdvancedRef.current || !onAdvanceRevealRef.current) return;

    revealAdvancedRef.current = true;
    const advance = onAdvanceRevealRef.current();
    void Promise.resolve(advance).catch(() => {
      if (session.phase === "reveal") {
        revealAdvancedRef.current = false;
      }
    });
  }, [
    session.phase,
    session.handNumber,
    session.sessionId,
    handPresentation.trumpMergedIntoHand,
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
      data-trick-resolving={trickPresentation.isPipelineActive ? "true" : "false"}
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
        {turnLabel && cardsDealt && trickPresentation.phase === "live" && (
          <p className="btable-session__turn muted small" aria-live="polite">
            {turnLabel}
          </p>
        )}
        {session.phase === "draw" && isMyTurn && (
          <p className="btable-session__hint muted small">
            Select cards to discard (up to 5), then Draw — Stand pat — or I&apos;m Out
          </p>
        )}
        {session.phase === "play" && (
          <p className="btable-session__hint muted small">
            Follow suit · trump when void · beat the trick when you can
          </p>
        )}
        {isRevealPhase(session.phase) && (
          <p className="btable-session__hint muted small" aria-live="polite">
            Cards dealt — trump revealed. Review your hand…
          </p>
        )}
        {selfEnroll && (
          <div className="btable-session__enroll-cta">
            <button
              type="button"
              className="btn btn--primary btn--sm btable-session__enroll-btn"
              data-testid="join-button"
              onClick={() => actions.onToggleInHand(true)}
            >
              I&apos;m in · {enrollmentSecondsLeft}s
            </button>
            {actions.onPassEnrollment && (
              <button
                type="button"
                className="btn btn--sm btn--ghost btable-session__pass-btn"
                data-testid="pass-enrollment-button"
                onClick={() => actions.onPassEnrollment?.()}
              >
                Pass
              </button>
            )}
          </div>
        )}
        {enrollmentActive && !selfEnroll && !isRevealPhase(session.phase) && (
          <p className="btable-session__enroll muted small">
            Play or pass: {enrollmentSecondsLeft}s each · clockwise from dealer
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

      {showCoWinSettlement && !session.isFinal && (
        <SettlementCoWinPanel
          session={session}
          players={players}
          potMetrics={settlementPotMetrics}
          splitSharePerWinner={splitSharePerWinner}
          currentUserId={currentUserId}
          isCoWinner={isCoWinner}
          onSettle={actions.onSettle}
        />
      )}

      <footer className="btable-session__foot muted small">
        <FeedbackSettings compact />
        {mySessionNet != null ? (
          <>Your session profit/loss {formatNet(mySessionNet)}</>
        ) : (
          <>Shared pot and game state only · sign in to track your ledger</>
        )}
      </footer>
    </div>
  );
}
