import { PlayingCard } from "../components/PlayingCard";
import type { Rank, Suit } from "../types";
import { CardTable } from "./CardTable";
import { formatNet, formatRiskStake } from "./logic";
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
  actions,
}: TableSessionViewProps) {
  const participantCount = session.participantIds.length;
  const isCoWinner =
    currentUserId != null &&
    (session.pendingCoWinSettlement?.winnerIds || []).includes(currentUserId);
  const selfEnroll = players.find((p) => p.isSelf && p.canToggleInHand);

  return (
    <div className="btable-session">
      <header className="btable-session__head">
        <h5 className="btable-session__title">Hand #{session.handNumber}</h5>
        <p className="btable-session__status">{leaderLabel}</p>
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

      <CardTable
        players={players}
        potMetrics={potMetrics}
        participantCount={participantCount}
        trumpUpcard={session.trumpUpcard}
        onToggleInHand={(playerId, inHand) => {
          const p = players.find((x) => x.playerId === playerId);
          if (p?.isSelf) actions.onToggleInHand(inHand);
        }}
        onTrickDelta={(playerId, delta) => {
          const p = players.find((x) => x.playerId === playerId);
          if (p?.isSelf) actions.onTrickDelta(delta);
        }}
      />

      {heroCards.length > 0 && (
        <div className="btable-session__hero-hand" aria-label="Your dealt cards">
          <p className="btable-session__hero-hand-label muted small">Your hand</p>
          <div className="btable-session__hero-cards">
            {heroCards.map((c, i) => (
              <PlayingCard
                key={`${c.rank}-${c.suit}-${i}`}
                card={{ rank: c.rank as Rank, suit: c.suit as Suit }}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}

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
