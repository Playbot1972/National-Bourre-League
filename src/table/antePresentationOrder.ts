import { resolveActionOrder } from "../game/playerOrder";
import type { TableSessionData } from "./types";

export interface AnteScoreRow {
  out?: boolean;
  skipNextAnte?: boolean;
  fundingContribution?: number | null;
  bourreReplacementDue?: number | null;
  perHandStake?: number | null;
}

type AnteOrderSession = Pick<
  TableSessionData,
  | "dealerId"
  | "participantIds"
  | "seatedIds"
  | "actionOrder"
  | "handEnrollment"
  | "postedAntes"
  | "anteContributorIds"
>;

/** Mirrors `handAnteContribution` in money core — kept local to avoid pulling untyped money bundle into app tsc. */
function handAnteContribution(
  scoreRow: AnteScoreRow | null | undefined,
  sessionStake: number,
): number {
  const authoritative = Number(scoreRow?.fundingContribution);
  if (Number.isFinite(authoritative) && authoritative >= 0) {
    return authoritative;
  }
  const replacement = Number(scoreRow?.bourreReplacementDue);
  if (Number.isFinite(replacement) && replacement > 0) {
    return replacement;
  }
  if (scoreRow?.skipNextAnte) return 0;
  const n = scoreRow?.perHandStake ?? sessionStake;
  return Math.max(0.01, Number(n) || sessionStake);
}

/** Projected chip-in for this hand — mirrors pot display / collectHandAntes. */
export function projectedAnteContribution(
  playerId: string,
  scoreRow: AnteScoreRow | null | undefined,
  sessionStake: number,
  postedAntes?: Record<string, number> | null,
): number {
  if (postedAntes != null && Object.prototype.hasOwnProperty.call(postedAntes, playerId)) {
    return Math.max(0, Number(postedAntes[playerId]) || 0);
  }
  if (scoreRow?.out === true) return 0;
  return handAnteContribution(scoreRow, sessionStake);
}

/**
 * Dealer-relative ante fly-in order: first seat left of dealer, clockwise.
 * Skips exempt players and anyone not contributing this hand.
 */
export function resolveAnteContributorIds(
  session: AnteOrderSession,
  scoreById: Record<string, AnteScoreRow | undefined> = {},
  sessionStake: number,
): string[] {
  if (session.anteContributorIds?.length) {
    return session.anteContributorIds.filter(Boolean).slice(0, 8);
  }

  const participantIds = session.participantIds.filter(Boolean);
  if (!participantIds.length) return [];

  const ordered = resolveActionOrder(
    {
      actionOrder: session.actionOrder,
      participantIds,
      dealerId: session.dealerId,
      seatedIds: session.seatedIds,
    },
    session.seatedIds,
  );

  return ordered
    .filter(
      (playerId) =>
        projectedAnteContribution(
          playerId,
          scoreById[playerId],
          sessionStake,
          session.postedAntes,
        ) > 0,
    )
    .slice(0, 8);
}
