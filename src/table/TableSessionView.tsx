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
  actions,
}: TableSessionViewProps) {
  const participantCount = session.participantIds.length;
  const isCoWinner =
    currentUserId != null &&
    (session.pendingCoWinSettlement?.winnerIds || []).includes(currentUserId);

  return (
    <div className="btable-session">
      <header className="btable-session__head">
        <h5 className="btable-session__title">Hand #{session.handNumber}</h5>
        <p className="btable-session__status">{leaderLabel}</p>
        {enrollmentActive && (
          <p className="btable-session__enroll muted small">
            Join window: {enrollmentSecondsLeft}s each · clockwise from dealer
          </p>
        )}
      </header>

      <CardTable
        players={players}
        potMetrics={potMetrics}
        participantCount={participantCount}
        onToggleInHand={(playerId, inHand) => {
          const p = players.find((x) => x.playerId === playerId);
          if (p?.isSelf) actions.onToggleInHand(inHand);
        }}
        onTrickDelta={(playerId, delta) => {
          const p = players.find((x) => x.playerId === playerId);
          if (p?.isSelf) actions.onTrickDelta(delta);
        }}
      />

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
