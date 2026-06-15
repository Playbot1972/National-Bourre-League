import { deriveWinnersFromTricks } from "./logic";
import { formatRiskStake } from "./logic";

export interface SettlementNameLookup {
  playerId: string;
  displayName: string;
}

export interface PotSnapshot {
  currentPot: number;
  maxWinThisHand: number;
  carryIn: number;
  limEnabled: boolean;
  overflow: number;
}

export interface CoWinSettlementViewModel {
  headline: string;
  subhead: string;
  winnerLines: string[];
  bourreLine: string | null;
  potLine: string;
  carryoverIfSplitLine: string | null;
  carryoverIfPushLine: string;
  splitPreviewLine: string | null;
  rulesLine: string;
  voteLines: string[];
  observerHint: string | null;
  voterHint: string | null;
}

export interface HandOutcomeViewModel {
  headline: string;
  detailLines: string[];
  carryoverLine: string | null;
}

function nameFor(id: string, players: SettlementNameLookup[]): string {
  return players.find((p) => p.playerId === id)?.displayName || id;
}

function namesFor(ids: string[], players: SettlementNameLookup[]): string {
  return ids.map((id) => nameFor(id, players)).join(" & ");
}

/** Players who stayed in and took zero tricks. */
export function bourrePlayerIds(
  tricksByPlayer: Record<string, number>,
  participantIds: string[],
): string[] {
  return participantIds.filter((pid) => (tricksByPlayer[pid] ?? 0) === 0);
}

export function buildCoWinSettlementView(input: {
  tricksByPlayer: Record<string, number>;
  participantIds: string[];
  players: SettlementNameLookup[];
  pot: PotSnapshot;
  pendingVotes?: Record<string, string>;
  splitSharePerWinner: number;
  currentUserId?: string | null;
  winnerIds?: string[];
  maxTricks?: number;
}): CoWinSettlementViewModel {
  const { tricksByPlayer, participantIds, players, pot, pendingVotes = {} } = input;
  const derived = deriveWinnersFromTricks(tricksByPlayer, participantIds);
  const winnerIds =
    input.winnerIds?.length ? input.winnerIds : derived.winnerIds;
  const maxTricks = input.maxTricks ?? derived.maxTricks;
  const winnerNames = namesFor(winnerIds, players);
  const bourreIds = bourrePlayerIds(tricksByPlayer, participantIds);
  const bourreNames = namesFor(bourreIds, players);

  const potLabel = formatRiskStake(pot.maxWinThisHand);
  const totalPotLabel = formatRiskStake(pot.currentPot);
  const carryInLabel =
    pot.carryIn > 0 ? formatRiskStake(pot.carryIn) : null;

  let potLine = `Pot this hand: ${totalPotLabel} (max win ${potLabel})`;
  if (carryInLabel) {
    potLine += ` — includes ${carryInLabel} carried in`;
  }
  if (pot.limEnabled && pot.overflow > 0) {
    potLine += ` · LIM overflow ${formatRiskStake(pot.overflow)} stays out of play`;
  }

  const winnerLines = winnerIds.map((id) => {
    const tricks = tricksByPlayer[id] ?? 0;
    return `${nameFor(id, players)} — ${tricks} trick${tricks === 1 ? "" : "s"}`;
  });

  const bourreLine =
    bourreIds.length > 0
      ? `Bourré: ${bourreNames} took 0 tricks (extra penalty applies on settlement)`
      : null;

  const splitShare = input.splitSharePerWinner;
  const splitPreviewLine =
    splitShare > 0 && winnerIds.length >= 2
      ? `If all co-winners agree to split: ${formatRiskStake(pot.maxWinThisHand)} → ${formatRiskStake(splitShare)} each`
      : null;

  const carryoverIfSplitLine =
    winnerIds.length >= 2
      ? "If split: pot is divided; no carryover to next hand"
      : null;

  const carryoverIfPushLine =
    `If any co-winner declines: full pot ${totalPotLabel} carries to the next hand · non-winners ante up`;

  const voteLines = winnerIds.map((wid) => {
    const vote = pendingVotes[wid];
    const label = nameFor(wid, players);
    if (vote === "split") return `${label}: Agreed to split ✓`;
    if (vote === "push") return `${label}: Declined split ✓`;
    return `${label}: Waiting to vote…`;
  });

  const isCoWinner =
    input.currentUserId != null && winnerIds.includes(input.currentUserId);

  return {
    headline: `Tie — ${winnerNames} (${maxTricks} tricks each)`,
    subhead: "Co-winners must vote before the next hand can start.",
    winnerLines,
    bourreLine,
    potLine,
    carryoverIfSplitLine,
    carryoverIfPushLine,
    splitPreviewLine,
    rulesLine:
      "One Decline pushes the pot. All co-winners must Agree to split the max win.",
    voteLines,
    observerHint: !isCoWinner && input.currentUserId
      ? "You are not a co-winner — waiting for their vote."
      : null,
    voterHint: isCoWinner
      ? "You tied for the lead — cast your vote below."
      : null,
  };
}

export type SettlementMode =
  | "win"
  | "split"
  | "push"
  | "non_winner_ante_up"
  | "co_win_carry";

export function buildHandOutcomeView(input: {
  settlement: SettlementMode;
  winnerIds: string[];
  participantIds: string[];
  tricksByPlayer: Record<string, number>;
  players: SettlementNameLookup[];
  potMaxWin: number;
  carryOverPot: number;
  bourreIds?: string[];
}): HandOutcomeViewModel {
  const {
    settlement,
    winnerIds,
    participantIds,
    tricksByPlayer,
    players,
    potMaxWin,
    carryOverPot,
  } = input;
  const bourreIds = input.bourreIds ?? bourrePlayerIds(tricksByPlayer, participantIds);
  const bourreNames = namesFor(bourreIds, players);
  const potLabel = formatRiskStake(potMaxWin);
  const carryLabel = formatRiskStake(carryOverPot);
  const detailLines: string[] = [];

  if (settlement === "win" && winnerIds.length === 1) {
    const name = nameFor(winnerIds[0], players);
    const tricks = tricksByPlayer[winnerIds[0]] ?? 0;
    detailLines.push(`${name} wins the pot (${tricks} tricks).`);
    if (bourreIds.length) {
      detailLines.push(`Bourré: ${bourreNames} took 0 tricks.`);
    }
    return {
      headline: `${name} wins ${potLabel}`,
      detailLines,
      carryoverLine:
        carryOverPot > 0 ? `Next hand starts with ${carryLabel} in the pot.` : null,
    };
  }

  if (settlement === "split") {
    const names = namesFor(winnerIds, players);
    const share = winnerIds.length ? potMaxWin / winnerIds.length : 0;
    detailLines.push(
      `${names} agreed to split — ${formatRiskStake(share)} each from max win ${potLabel}.`,
    );
    if (bourreIds.length) {
      detailLines.push(`Bourré: ${bourreNames} took 0 tricks.`);
    }
    return {
      headline: `Pot split — ${names}`,
      detailLines,
      carryoverLine: null,
    };
  }

  if (settlement === "push") {
    detailLines.push(`No winner with tricks — everyone who stayed in is bourré'd.`);
    if (bourreIds.length) {
      detailLines.push(`Bourré: ${bourreNames}.`);
    }
    detailLines.push(`Full pot ${potLabel} carries forward.`);
    return {
      headline: "Hand pushed — pot carries",
      detailLines,
      carryoverLine: `Next hand pot includes ${carryLabel}.`,
    };
  }

  if (settlement === "non_winner_ante_up") {
    detailLines.push(`Co-winners did not all agree to split.`);
    detailLines.push(`Pot ${potLabel} carries to the next hand.`);
    detailLines.push(`Players who did not tie for the lead ante up next hand.`);
    if (bourreIds.length) {
      detailLines.push(`Bourré: ${bourreNames} took 0 tricks.`);
    }
    return {
      headline: "No split agreement — pot pushed",
      detailLines,
      carryoverLine: `Next hand starts with ${carryLabel} in the pot.`,
    };
  }

  if (settlement === "co_win_carry") {
    const names = namesFor(winnerIds, players);
    detailLines.push(`Tie for most tricks — ${names} (${winnerIds.length} co-winners).`);
    detailLines.push(`No outright winner; full pot ${potLabel} carries to the next deal.`);
    detailLines.push(
      `Hand ends; enrollment opens for the next deal. Seats may change between deals.`,
    );
    detailLines.push(
      `Tied leaders skip the ante for that deal; other seated players ante as usual.`,
    );
    detailLines.push(
      `New players seated in time for enrollment may join that deal.`,
    );
    if (bourreIds.length) {
      detailLines.push(`Bourré: ${bourreNames} took 0 tricks.`);
    }
    return {
      headline: "Tie — pot carries",
      detailLines,
      carryoverLine: `Next deal starts with ${carryLabel} in the pot.`,
    };
  }

  return {
    headline: "Hand complete",
    detailLines,
    carryoverLine: carryOverPot > 0 ? `Carryover: ${carryLabel}` : null,
  };
}

export function formatVoteRecordedMessage(
  choice: "push" | "split",
  result: { status: string; settlement?: string },
): string {
  if (result.status === "pending") {
    return choice === "split"
      ? "You agreed to split — waiting for other co-winner(s)."
      : "Vote recorded — waiting for other co-winner(s).";
  }
  if (result.settlement === "split") {
    return "All co-winners agreed — pot split evenly. Next hand enrollment is open.";
  }
  if (result.settlement === "non_winner_ante_up") {
    return "Split declined — full pot carries to the next hand. Non-winners ante up.";
  }
  return "Settlement recorded.";
}

export function formatHandHistoryPublicLine(input: {
  handNumber: number;
  settlement: SettlementMode;
  winnerIds: string[];
  participantIds: string[];
  tricksByPlayer: Record<string, number>;
  players: SettlementNameLookup[];
  potMaxWin: number;
  cappedPot?: number;
  grossPot?: number;
  bourreIds?: string[];
}): string {
  const view = buildHandOutcomeView({
    settlement: input.settlement,
    winnerIds: input.winnerIds,
    participantIds: input.participantIds,
    tricksByPlayer: input.tricksByPlayer,
    players: input.players,
    potMaxWin: input.cappedPot ?? input.potMaxWin,
    carryOverPot: 0,
    bourreIds: input.bourreIds,
  });
  const n = input.participantIds.length;
  const maxNote =
    input.cappedPot != null &&
    input.grossPot != null &&
    input.cappedPot < input.grossPot
      ? " (LIM cap)"
      : "";
  return `#${input.handNumber} ${view.headline}${maxNote} · ${n} players`;
}
