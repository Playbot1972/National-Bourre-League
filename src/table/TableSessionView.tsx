import { useCallback, useEffect, useState } from "react";
import { CardTable } from "./CardTable";
import { CinematicSplash } from "./CinematicSplash";
import { DesktopLayoutShell } from "./DesktopLayoutShell";
import { EventReactions } from "./EventReactions";
import { TableSettingsPanel } from "./TableSettingsPanel";
import { formatHandPhase, isCardsDealtPhase, turnIndicatorLabel } from "./handUi";
import { useTableEvents } from "./hooks/useTableEvents";
import { formatNet, formatRiskStake } from "./logic";
import { useTableTheme } from "./theme/useTableTheme";
import type { TableSessionViewProps } from "./types";

export function TableSessionView({
  session,
  players,
  potMetrics,
  mySessionNet,
  myHandContribution,
  leaderLabel,
  showCoWinSettlement,
  splitSharePerWinner = 0,
  voteStatus,
  enrollmentActive = false,
  enrollmentSecondsLeft = 0,
  currentUserId,
  heroCards = [],
  legalPlayIndices,
  actions,
}: TableSessionViewProps) {
  const { settings } = useTableTheme();
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
  const phaseLabel = formatHandPhase(session.phase, enrollmentActive);
  const turnLabel = turnIndicatorLabel(session.turnPlayerId, players);
  const cardsDealt = isCardsDealtPhase(session.phase);
  const isMyTurn = Boolean(currentUserId && session.turnPlayerId === currentUserId);

  const handleReaction = useCallback(
    (emoji: string) => {
      pushReaction(emoji, currentUserId ?? undefined);
    },
    [pushReaction, currentUserId],
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
    <div className={`btable-session${settingsOpen ? " btable-session--settings-open" : ""}`}>
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
            onClick={() => setSettingsOpen(true)}
            aria-label="Table appearance settings"
            title={`Settings (${settings.hotkeys.toggleSettings})`}
          >
            ⚙
          </button>
        </div>
        <p className="btable-session__status">{leaderLabel}</p>
        {turnLabel && cardsDealt && (
          <p className="btable-session__turn muted small" aria-live="polite">
            {turnLabel}
          </p>
        )}
        {session.phase === "draw" && isMyTurn && (
          <p className="btable-session__hint muted small">
            Select cards to discard, then Draw — or Stand pat
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

      <p className="btable-session__rotate-hint" role="note">
        Rotate your phone to <strong>landscape</strong> for the full table (up to 8 players).
      </p>

      <DesktopLayoutShell>
        <div className="btable-stage">
          <EventReactions events={events} players={players} onDismiss={dismissEvent} />
          <CinematicSplash events={events} onDismiss={dismissEvent} />
          <CardTable
            session={session}
            players={players}
            potMetrics={potMetrics}
            participantCount={participantCount}
            enrollmentActive={enrollmentActive}
            heroCards={heroCards}
            currentUserId={currentUserId}
            legalPlayIndices={legalPlayIndices}
            onToggleInHand={(playerId, inHand) => {
              const p = players.find((x) => x.playerId === playerId);
              if (p?.isSelf) actions.onToggleInHand(inHand);
            }}
            onTrickDelta={(playerId, delta) => {
              const p = players.find((x) => x.playerId === playerId);
              if (p?.isSelf) actions.onTrickDelta(delta);
            }}
            onSubmitDraw={actions.onSubmitDraw}
            onPassDraw={actions.onPassDraw}
            onPlayCard={actions.onPlayCard}
            onReaction={handleReaction}
          />
        </div>
      </DesktopLayoutShell>

      <TableSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {showCoWinSettlement && !session.isFinal && (
        <div className="btable-session__settle">
          <p className="muted small">
            Co-winners vote — one <strong>Decline</strong> pushes the pot; all must{" "}
            <strong>Agree</strong> to split.
          </p>
          {splitSharePerWinner > 0 && (
            <p className="btable-session__split-preview">
              Split max win {formatRiskStake(potMetrics.maxWinThisHand)} →{" "}
              <strong>{formatRiskStake(splitSharePerWinner)}</strong> each
            </p>
          )}
          <div className="btable-session__settle-btns">
            <button
              type="button"
              className="btn btn--sm"
              disabled={!isCoWinner}
              onClick={() => actions.onSettle("push")}
            >
              Decline split
            </button>
            <button
              type="button"
              className="btn btn--sm btn--primary"
              disabled={!isCoWinner}
              onClick={() => actions.onSettle("split")}
            >
              Agree to split
            </button>
          </div>
          {voteStatus && <p className="muted small">{voteStatus}</p>}
          {!isCoWinner && currentUserId && (
            <p className="muted small">Waiting for co-winners to vote.</p>
          )}
        </div>
      )}

      <footer className="btable-session__foot muted small">
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
