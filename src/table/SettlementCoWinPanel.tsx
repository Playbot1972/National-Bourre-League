import { formatRiskStake } from "./logic";
import {
  buildCoWinSettlementView,
  type PotSnapshot,
} from "./settlementCopy";
import type { TablePlayer, TableSessionData } from "./types";

interface SettlementCoWinPanelProps {
  session: TableSessionData;
  players: TablePlayer[];
  potMetrics: PotSnapshot;
  splitSharePerWinner: number;
  currentUserId: string | null;
  isCoWinner: boolean;
  onSettle: (choice: "push" | "split") => void;
}

export function SettlementCoWinPanel({
  session,
  players,
  potMetrics,
  splitSharePerWinner,
  currentUserId,
  isCoWinner,
  onSettle,
}: SettlementCoWinPanelProps) {
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

  return (
    <div
      className="btable-session__settle"
      data-testid="settlement-panel"
      role="region"
      aria-label="Co-winner settlement vote"
    >
      <h6 className="btable-session__settle-title" data-testid="settlement-headline">
        {view.headline}
      </h6>
      <p className="btable-session__settle-sub" data-testid="settlement-subhead">
        {view.subhead}
      </p>

      <ul className="btable-session__settle-list" data-testid="settlement-winners">
        {view.winnerLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {view.bourreLine && (
        <p className="btable-session__settle-bourre" data-testid="settlement-bourre">
          {view.bourreLine}
        </p>
      )}

      <p className="btable-session__settle-pot" data-testid="settlement-pot">
        {view.potLine}
      </p>

      {view.splitPreviewLine && (
        <p className="btable-session__split-preview" data-testid="settlement-split-preview">
          {view.splitPreviewLine}
        </p>
      )}

      <p className="btable-session__settle-carry muted small" data-testid="settlement-carry-push">
        {view.carryoverIfPushLine}
      </p>
      {view.carryoverIfSplitLine && (
        <p className="btable-session__settle-carry muted small" data-testid="settlement-carry-split">
          {view.carryoverIfSplitLine}
        </p>
      )}

      <p className="btable-session__settle-rules muted small" data-testid="settlement-rules">
        {view.rulesLine}
      </p>

      <ul className="btable-session__settle-votes" data-testid="settlement-votes">
        {view.voteLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {view.voterHint && (
        <p className="btable-session__settle-hint" data-testid="settlement-voter-hint">
          {view.voterHint}
        </p>
      )}
      {view.observerHint && (
        <p className="btable-session__settle-hint muted small" data-testid="settlement-observer-hint">
          {view.observerHint}
        </p>
      )}

      <div className="btable-session__settle-btns">
        <button
          type="button"
          className="btn btn--sm"
          disabled={!isCoWinner}
          data-testid="settlement-decline-btn"
          onClick={() => onSettle("push")}
        >
          Decline split · push pot
        </button>
        <button
          type="button"
          className="btn btn--sm btn--primary"
          disabled={!isCoWinner}
          data-testid="settlement-agree-btn"
          onClick={() => onSettle("split")}
        >
          Agree to split · {formatRiskStake(splitSharePerWinner)} each
        </button>
      </div>
    </div>
  );
}
