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
import { formatHandPhase, isCardsDealtPhase, turnIndicatorLabel } from "./handUi";
import { useTableEvents } from "./hooks/useTableEvents";
import { useHandPresentation } from "./hooks/useHandPresentation";
import { useTableMicrointeractions } from "./hooks/useTableMicrointeractions";
import { useTrickPresentation } from "./hooks/useTrickPresentation";
import { formatNet } from "./logic";
import { SettlementCoWinPanel } from "./SettlementCoWinPanel";
import { useTableTheme } from "./theme/useTableTheme";
import { useMobileTable } from "./useMobileTable";
import type { TableSessionViewProps } from "./types";
import type { PotSnapshot } from "./settlementCopy";

/** Stable fallbacks — inline `?? []` creates new refs every render and loops hand presentation. */
const EMPTY_ENROLLMENT_IDS: string[] = [];
const EMPTY_HERO_CARDS: never[] = [];

export function TableSessionView({
  session,
  players,
  potMetrics,
  mySessionNet,
  myHandContribution,
  leaderLabel,
  showCoWinSettlement,
  splitSharePerWinner = 0,
  enrollmentActive = false,
  enrollmentSecondsLeft = 0,
  currentUserId,
  heroCards = EMPTY_HERO_CARDS,
  privateHandReady = false,
  legalPlayIndices,
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
  const selfEnroll = players.find((p) => p.isSelf && p.canToggleInHand);
  const trickPresentation = useTrickPresentation({
    phase: session.phase,
    currentTrick: session.currentTrick,
    tricksByPlayer: session.tricksByPlayer,
    participantIds: session.participantIds,
    trumpSuit: session.trumpSuit,
    playedCards: session.playedCards,
  });
  const handPresentation = useHandPresentation({
    session,
    enrollmentActive,
    potAmount: potMetrics.currentPot,
    handComplete,
    heroCards,
    enrolledIds: session.handEnrollment?.enrolledIds ?? EMPTY_ENROLLMENT_IDS,
    declinedIds: session.handEnrollment?.declinedIds ?? EMPTY_ENROLLMENT_IDS,
    actionOrder: session.handEnrollment?.orderedPlayerIds ?? session.participantIds,
  });
  const suppressTurn =
    trickPresentation.suppressTurnPlayerId || handPresentation.suppressTurnIndicator;
  const phaseLabel = formatHandPhase(session.phase, enrollmentActive);
  const turnLabel =
    suppressTurn
      ? null
      : turnIndicatorLabel(session.turnPlayerId, players);
  const cardsDealt = isCardsDealtPhase(session.phase);
  const isMyTurn =
    Boolean(currentUserId && session.turnPlayerId === currentUserId) &&
    !suppressTurn;

  const showTrumpSuitReminder =
    !session.trumpUpcard && Boolean(session.trumpSuit) && session.phase === "play";
  const tricksSnapshot = useMemo(
    () => ({ ...trickPresentation.displayTricksByPlayer }),
    [trickPresentation.displayTricksByPlayer],
  );
  const microinteractions = useTableMicrointeractions({
    turnPlayerId: session.turnPlayerId ?? null,
    dealerId: session.dealerId,
    potAmount: handPresentation.displayPotAmount,
    tricksByPlayer: tricksSnapshot,
    phase: session.phase ?? null,
    showTrumpSuitReminder,
    suppressTurn: Boolean(suppressTurn),
    actionFeedbackStatus: actionFeedback?.status ?? "idle",
    trickWinnerSeatId: trickPresentation.trickWinnerSeatId,
    trickPhase: trickPresentation.phase,
  });

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
        if (p?.isSelf) actions.onToggleInHand(inHand);
      },
      onTrickDelta: (playerId: string, delta: number) => {
        const p = players.find((x) => x.playerId === playerId);
        if (p?.isSelf) actions.onTrickDelta(delta);
      },
      onSubmitDraw: actions.onSubmitDraw,
      onPassDraw: actions.onPassDraw,
      onPlayCard: actions.onPlayCard,
      onReaction: handleReaction,
    }),
    [actions, handleReaction, players],
  );

  const sharedTableProps = {
    session,
    players,
    potMetrics,
    participantCount,
    enrollmentActive,
    heroCards,
    privateHandReady,
    currentUserId,
    legalPlayIndices,
    handComplete,
    actionFeedback,
    trickPresentation,
    handPresentation,
    microinteractions,
    ...tableCallbacks,
  };

  const gameplayStage = (
    <>
      <EventReactions events={events} players={players} onDismiss={dismissEvent} />
      <CinematicSplash events={events} onDismiss={dismissEvent} />
      {nativeMobile ? (
        <MobileCardTable {...sharedTableProps} />
      ) : (
        <CardTable {...sharedTableProps} />
      )}
    </>
  );

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
      ]
        .filter(Boolean)
        .join(" ")}
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
            Trump revealed — {formatHandPhase("draw", false)}
          </p>
        )}
        {handPresentation.phase === "drawReady" && (
          <p className="btable-session__turn muted small" aria-live="polite">
            Draw complete — first lead coming up
          </p>
        )}
        {handPresentation.settleAnimActive && (
          <p className="btable-session__turn muted small" aria-live="polite">
            Settling the pot…
          </p>
        )}
        {trickPresentation.isResolving && session.phase === "play" && (
          <p className="btable-session__turn muted small" aria-live="polite">
            Trick won — cards collecting before the next lead
          </p>
        )}
        {turnLabel && cardsDealt && trickPresentation.phase === "live" && (
          <p className="btable-session__turn muted small" aria-live="polite">
            {turnLabel}
          </p>
        )}
        {session.phase === "draw" && isMyTurn && (
          <p className="btable-session__hint muted small">
            Select cards to discard (up to 5), then Draw — or Stand pat
          </p>
        )}
        {session.phase === "play" && (
          <p className="btable-session__hint muted small">
            Follow suit · trump when void · beat the trick when you can
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
          </div>
        )}
        {enrollmentActive && !selfEnroll && (
          <p className="btable-session__enroll muted small">
            Join window: {enrollmentSecondsLeft}s each · clockwise from dealer
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
          <>
            Your contribution this hand{" "}
            {myHandContribution != null ? formatNet(myHandContribution) : formatNet(0)}
            {" · "}
            Your session net {formatNet(mySessionNet)}
          </>
        ) : (
          <>Shared pot and game state only · sign in to track your ledger</>
        )}
      </footer>
    </div>
  );
}
