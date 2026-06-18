export const MICRO_MS = {
  turnHandoff: 620,
  dealerMove: 720,
  potTick: 480,
  trickBadge: 450,
  trumpReminder: 900,
  feedbackPulse: 420,
  illegalShake: 340,
  cardSelect: 380,
  winnerFlash: 520,
  bankrollTick: 900,
  bourrePulse: 1200,
  bourreMarker: 4500,
} as const;

export interface MicroTrackInput {
  turnPlayerId: string | null;
  dealerId: string | null;
  potAmount: number;
  tricksByPlayer: Record<string, number>;
  bankrollByPlayer: Record<string, number>;
  bourrePlayerIds: string[];
  phase: string | null;
  showTrumpSuitReminder: boolean;
  suppressTurn: boolean;
  actionFeedbackStatus: "idle" | "loading" | "success" | "error";
  trickWinnerSeatId: string | null;
  trickPhase: string;
}

export interface MicroTrackState {
  turnHandoffPlayerId: string | null;
  dealerMovedPlayerId: string | null;
  potTick: number;
  trickBadgeTicks: Record<string, number>;
  bankrollTicks: Record<string, "up" | "down">;
  bourreAlerts: Record<string, "pulse" | "marker">;
  trumpReminderPulse: number;
  feedbackErrorPulse: number;
  feedbackSuccessPulse: number;
  winnerFlashPlayerId: string | null;
}

export interface MicroPrevSnapshot {
  turnPlayerId: string | null;
  dealerId: string | null;
  potAmount: number;
  tricksByPlayer: Record<string, number>;
  bankrollByPlayer: Record<string, number>;
  bourrePlayerIds: string[];
  showTrumpSuitReminder: boolean;
  actionFeedbackStatus: MicroTrackInput["actionFeedbackStatus"];
  trickWinnerSeatId: string | null;
  trickPhase: string;
}

export const EMPTY_MICRO_STATE: MicroTrackState = {
  turnHandoffPlayerId: null,
  dealerMovedPlayerId: null,
  potTick: 0,
  trickBadgeTicks: {},
  bankrollTicks: {},
  bourreAlerts: {},
  trumpReminderPulse: 0,
  feedbackErrorPulse: 0,
  feedbackSuccessPulse: 0,
  winnerFlashPlayerId: null,
};

export function createMicroPrevSnapshot(input: MicroTrackInput): MicroPrevSnapshot {
  return {
    turnPlayerId: input.turnPlayerId,
    dealerId: input.dealerId,
    potAmount: input.potAmount,
    tricksByPlayer: { ...input.tricksByPlayer },
    bankrollByPlayer: { ...input.bankrollByPlayer },
    bourrePlayerIds: [...input.bourrePlayerIds],
    showTrumpSuitReminder: input.showTrumpSuitReminder,
    actionFeedbackStatus: input.actionFeedbackStatus,
    trickWinnerSeatId: input.trickWinnerSeatId,
    trickPhase: input.trickPhase,
  };
}

export interface MicroDiff {
  turnHandoffPlayerId: string | null;
  dealerMovedPlayerId: string | null;
  potTick: boolean;
  trickBadgeIncrements: Record<string, number>;
  bankrollChanges: Record<string, "up" | "down">;
  bourrePlayerIds: string[];
  trumpReminderPulse: boolean;
  feedbackErrorPulse: boolean;
  feedbackSuccessPulse: boolean;
  winnerFlashPlayerId: string | null;
}

export function diffMicrointeractions(
  prev: MicroPrevSnapshot | null,
  input: MicroTrackInput,
): MicroDiff {
  const empty: MicroDiff = {
    turnHandoffPlayerId: null,
    dealerMovedPlayerId: null,
    potTick: false,
    trickBadgeIncrements: {},
    bankrollChanges: {},
    bourrePlayerIds: [],
    trumpReminderPulse: false,
    feedbackErrorPulse: false,
    feedbackSuccessPulse: false,
    winnerFlashPlayerId: null,
  };

  if (!prev) return empty;

  const turnHandoffPlayerId =
    !input.suppressTurn &&
    input.turnPlayerId &&
    input.turnPlayerId !== prev.turnPlayerId &&
    input.phase === "play"
      ? input.turnPlayerId
      : null;

  const dealerMovedPlayerId =
    input.dealerId && input.dealerId !== prev.dealerId ? input.dealerId : null;

  const potTick =
    input.potAmount !== prev.potAmount && input.potAmount > 0 && prev.potAmount >= 0;

  const trickBadgeIncrements: Record<string, number> = {};
  const playerIds = new Set([
    ...Object.keys(prev.tricksByPlayer),
    ...Object.keys(input.tricksByPlayer),
  ]);
  for (const playerId of playerIds) {
    const before = prev.tricksByPlayer[playerId] ?? 0;
    const after = input.tricksByPlayer[playerId] ?? 0;
    if (after > before) trickBadgeIncrements[playerId] = after - before;
  }

  const bankrollChanges: Record<string, "up" | "down"> = {};
  const bankrollIds = new Set([
    ...Object.keys(prev.bankrollByPlayer),
    ...Object.keys(input.bankrollByPlayer),
  ]);
  for (const playerId of bankrollIds) {
    const before = prev.bankrollByPlayer[playerId] ?? 0;
    const after = input.bankrollByPlayer[playerId] ?? 0;
    if (after > before) bankrollChanges[playerId] = "up";
    else if (after < before) bankrollChanges[playerId] = "down";
  }

  const bourrePlayerIds = input.bourrePlayerIds.filter(
    (id) => !prev.bourrePlayerIds.includes(id),
  );

  const trumpReminderPulse =
    input.showTrumpSuitReminder && !prev.showTrumpSuitReminder;

  const feedbackErrorPulse =
    input.actionFeedbackStatus === "error" && prev.actionFeedbackStatus !== "error";

  const feedbackSuccessPulse =
    input.actionFeedbackStatus === "success" && prev.actionFeedbackStatus !== "success";

  const winnerFlashPlayerId =
    input.trickWinnerSeatId &&
    input.trickPhase === "winnerReveal" &&
    (input.trickWinnerSeatId !== prev.trickWinnerSeatId || prev.trickPhase !== "winnerReveal")
      ? input.trickWinnerSeatId
      : null;

  return {
    turnHandoffPlayerId,
    dealerMovedPlayerId,
    potTick,
    trickBadgeIncrements,
    bankrollChanges,
    bourrePlayerIds,
    trumpReminderPulse,
    feedbackErrorPulse,
    feedbackSuccessPulse,
    winnerFlashPlayerId,
  };
}
