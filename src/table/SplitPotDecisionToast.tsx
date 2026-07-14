import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatRiskStake } from "./logic";
import { getTieResultDurationMs } from "./tieResultTiming";
import type { TablePlayer, TableSessionData } from "./types";

interface SplitPotDecisionToastProps {
  session: TableSessionData;
  players: TablePlayer[];
  splitSharePerWinner: number;
  currentUserId: string | null;
  isCoWinner: boolean;
  resultMessage?: string;
  manualContinueAllowed?: boolean;
  onAgreeSplit: () => void;
  onDeclineSplit: () => void;
  onCarryover: () => void;
}

function nameFor(id: string, players: TablePlayer[]): string {
  return players.find((p) => p.playerId === id)?.displayName || id;
}

/** Compact tied-leader split-pot vote (house rule). */
export function SplitPotDecisionToast({
  session,
  players,
  splitSharePerWinner,
  currentUserId,
  isCoWinner,
  resultMessage = "",
  manualContinueAllowed = true,
  onAgreeSplit,
  onDeclineSplit,
  onCarryover,
}: SplitPotDecisionToastProps) {
  const winnerIds = session.pendingCoWinSettlement?.winnerIds ?? [];
  const votes = session.pendingCoWinSettlement?.votes ?? {};
  const decisionDurationMs = useMemo(
    () => getTieResultDurationMs(resultMessage || "Tie — split the pot?"),
    [resultMessage],
  );
  const [remainingMs, setRemainingMs] = useState(decisionDurationMs);
  const [localAgreed, setLocalAgreed] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const settledRef = useRef(false);

  const proposalKey = useMemo(
    () => `${winnerIds.join(",")}:${session.handNumber ?? 0}`,
    [winnerIds, session.handNumber],
  );

  useEffect(() => {
    startedAtRef.current = Date.now();
    settledRef.current = false;
    setRemainingMs(decisionDurationMs);
    setLocalAgreed(false);
  }, [proposalKey, decisionDurationMs]);

  const allAgreed = winnerIds.length >= 2 && winnerIds.every((id) => votes[id] === "split");

  const finalizeCarryover = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    onCarryover();
  }, [onCarryover]);

  useEffect(() => {
    if (winnerIds.length < 2) return;
    const tick = window.setInterval(() => {
      const started = startedAtRef.current ?? Date.now();
      const elapsed = Date.now() - started;
      const nextRemaining = Math.max(0, decisionDurationMs - elapsed);
      setRemainingMs(nextRemaining);
      if (nextRemaining <= 0 && !allAgreed) {
        finalizeCarryover();
      }
    }, 100);
    return () => window.clearInterval(tick);
  }, [winnerIds.length, allAgreed, finalizeCarryover, proposalKey, decisionDurationMs]);

  useEffect(() => {
    if (allAgreed) {
      settledRef.current = true;
    }
  }, [allAgreed]);

  if (winnerIds.length < 2) return null;

  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const winnerNames = winnerIds.map((id) => nameFor(id, players)).join(" & ");
  const canInteract = manualContinueAllowed && !settledRef.current;

  const handleAgreeChange = (checked: boolean) => {
    if (!isCoWinner || !canInteract) return;
    setLocalAgreed(checked);
    if (checked) onAgreeSplit();
    else onDeclineSplit();
  };

  return (
    <div
      className="btable-split-toast"
      data-testid="split-pot-toast"
      role="dialog"
      aria-label="Split pot decision"
      aria-live="polite"
    >
      <p className="btable-split-toast__title">Tie — split the pot?</p>
      <p className="btable-split-toast__names">{winnerNames}</p>
      <p className="btable-split-toast__share muted small">
        {formatRiskStake(splitSharePerWinner)} each if all agree
      </p>
      {isCoWinner ? (
        <label className="btable-split-toast__choice">
          <input
            type="checkbox"
            checked={localAgreed || votes[currentUserId ?? ""] === "split"}
            disabled={!canInteract}
            onChange={(e) => handleAgreeChange(e.target.checked)}
            data-testid="split-pot-agree"
          />
          <span>Yes — split pot</span>
        </label>
      ) : (
        <p className="btable-split-toast__wait muted small">Waiting for tied leaders…</p>
      )}
      <p className="btable-split-toast__timer muted small" data-testid="split-pot-timer">
        {seconds}s — carryover if not all agree
      </p>
    </div>
  );
}
