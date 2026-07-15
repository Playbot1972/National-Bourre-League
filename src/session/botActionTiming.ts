/**
 * Single source of truth for bot action pacing (play think, draw/pass debounce, ante posts).
 * Built to docs/bot-play-delay.js for the static social app; imported directly by the table bundle.
 */

export const BOT_PLAY_DELAY_MIN_MS = 250;
export const BOT_PLAY_DELAY_MAX_MS = 700;
export const BOT_PLAY_LAST_CARD_MIN_MS = 100;
export const BOT_PLAY_LAST_CARD_MAX_MS = 300;
export const BOT_ADVANCE_DEBOUNCE_MS = 150;

export type BotHandPhase = "play" | "draw" | "pass" | "ante" | string | null | undefined;

export interface BotPlayTurnKeyInput {
  handNumber?: number | null;
  trickNumber?: number | null;
  turnPlayerId?: string | null;
}

export function botPlayTurnKey({
  handNumber,
  trickNumber,
  turnPlayerId,
}: BotPlayTurnKeyInput): string {
  return `${handNumber ?? 0}:${trickNumber ?? 0}:${turnPlayerId ?? ""}`;
}

export function antePostTurnKey(handNumber: number, playerId: string): string {
  return `ante:${handNumber}:${playerId}`;
}

export function randomIntInclusive(min: number, max: number, rng: () => number = Math.random): number {
  const span = max - min + 1;
  return min + Math.floor(rng() * span);
}

/** Deterministic RNG so presentation phase schedule matches GSAP plan for the same hand/seats. */
export function createSeededRng(seed: string): () => number {
  let state = 0;
  for (let i = 0; i < seed.length; i += 1) {
    state = (Math.imul(31, state) + seed.charCodeAt(i)) >>> 0;
  }
  if (state === 0) state = 0x9e3779b9;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export interface BotPlayDelayPick {
  chosenDelayMs: number;
  isLastCard: boolean;
  remainingHandCount: number | null;
}

export function pickBotPlayDelayMs(
  remainingHandCount?: number | null,
  rng: () => number = Math.random,
): BotPlayDelayPick {
  const isLastCard = remainingHandCount === 1;
  const chosenDelayMs = isLastCard
    ? randomIntInclusive(BOT_PLAY_LAST_CARD_MIN_MS, BOT_PLAY_LAST_CARD_MAX_MS, rng)
    : randomIntInclusive(BOT_PLAY_DELAY_MIN_MS, BOT_PLAY_DELAY_MAX_MS, rng);
  return {
    chosenDelayMs,
    isLastCard,
    remainingHandCount: remainingHandCount ?? null,
  };
}

function delayCacheKey(turnKey: string, remainingHandCount?: number | null): string {
  return `${turnKey}:r${remainingHandCount ?? "?"}`;
}

export interface BotPlayDelayResolveInput {
  handNumber: number;
  trickNumber?: number | null;
  turnPlayerId?: string | null;
  remainingHandCount?: number | null;
  nowMs: number;
}

export interface BotPlayDelayResolveResult extends BotPlayDelayPick {
  turnKey: string;
  elapsedSinceTurnMs: number;
  trickGapRemainingMs: number;
  delayMs: number;
}

export interface BotPlayDelayState {
  syncHand(handNumber: number): void;
  markTurnEligible(input: {
    handNumber: number;
    trickNumber?: number | null;
    turnPlayerId?: string | null;
    nowMs: number;
  }): string;
  resolvePlayDelayMs(input: BotPlayDelayResolveInput): BotPlayDelayResolveResult;
  resolveAntePostDelayMs(handNumber: number, playerId: string): number;
  delayByTurnKey: Map<string, number>;
}

export function createBotPlayDelayState(options: { rng?: () => number } = {}): BotPlayDelayState {
  const rng = options.rng ?? Math.random;
  let trackedHandNumber: number | null = null;
  let turnEligibleKey: string | null = null;
  let turnEligibleAtMs = 0;
  const delayByTurnKey = new Map<string, number>();

  function syncHand(handNumber: number): void {
    if (trackedHandNumber === handNumber) return;
    trackedHandNumber = handNumber;
    turnEligibleKey = null;
    turnEligibleAtMs = 0;
    delayByTurnKey.clear();
  }

  function markTurnEligible(input: {
    handNumber: number;
    trickNumber?: number | null;
    turnPlayerId?: string | null;
    nowMs: number;
  }): string {
    syncHand(input.handNumber);
    const key = botPlayTurnKey(input);
    if (turnEligibleKey !== key) {
      turnEligibleKey = key;
      turnEligibleAtMs = input.nowMs;
    }
    return key;
  }

  function pickDelayForKey(turnKey: string, remainingHandCount?: number | null): BotPlayDelayPick {
    const cacheKey = delayCacheKey(turnKey, remainingHandCount);
    let chosen = delayByTurnKey.get(cacheKey);
    let meta: BotPlayDelayPick | null = null;
    if (chosen == null) {
      meta = pickBotPlayDelayMs(remainingHandCount, rng);
      chosen = meta.chosenDelayMs;
      delayByTurnKey.set(cacheKey, chosen);
    }
    if (!meta) {
      meta = {
        chosenDelayMs: chosen,
        isLastCard: remainingHandCount === 1,
        remainingHandCount: remainingHandCount ?? null,
      };
    }
    return meta;
  }

  function resolvePlayDelayMs(input: BotPlayDelayResolveInput): BotPlayDelayResolveResult {
    syncHand(input.handNumber);
    const key = markTurnEligible({
      handNumber: input.handNumber,
      trickNumber: input.trickNumber,
      turnPlayerId: input.turnPlayerId,
      nowMs: input.nowMs,
    });
    const picked = pickDelayForKey(key, input.remainingHandCount);
    const chosenDelayMs = picked.chosenDelayMs;
    const elapsedSinceTurnMs = input.nowMs - turnEligibleAtMs;
    const remainingTurnMs = Math.max(0, chosenDelayMs - elapsedSinceTurnMs);
    return {
      turnKey: key,
      chosenDelayMs,
      elapsedSinceTurnMs,
      trickGapRemainingMs: 0,
      delayMs: remainingTurnMs,
      remainingHandCount: picked.remainingHandCount,
      isLastCard: picked.isLastCard,
    };
  }

  function resolveAntePostDelayMs(handNumber: number, playerId: string): number {
    syncHand(handNumber);
    const turnKey = antePostTurnKey(handNumber, playerId);
    const cacheKey = delayCacheKey(turnKey, 5);
    let chosen = delayByTurnKey.get(cacheKey);
    if (chosen == null) {
      chosen = pickBotPlayDelayMs(5, rng).chosenDelayMs;
      delayByTurnKey.set(cacheKey, chosen);
    }
    return chosen;
  }

  return {
    syncHand,
    markTurnEligible,
    resolvePlayDelayMs,
    resolveAntePostDelayMs,
    delayByTurnKey,
  };
}

export interface BotAdvanceDelayInput {
  handPhase?: BotHandPhase;
  playDelayState: BotPlayDelayState;
  ctx: {
    handNumber: number;
    trickNumber?: number | null;
    turnPlayerId?: string | null;
    remainingHandCount?: number | null;
  };
  nowMs: number;
}

export interface BotAdvanceDelayResult extends BotPlayDelayResolveResult {
  handPhase: BotHandPhase;
}

/** Play and ante use random think-time; draw/pass/enrollment use short debounce. */
export function resolveBotAdvanceDelayMs(input: BotAdvanceDelayInput): BotAdvanceDelayResult {
  if (input.handPhase === "play") {
    return {
      ...input.playDelayState.resolvePlayDelayMs({
        handNumber: input.ctx.handNumber,
        trickNumber: input.ctx.trickNumber,
        turnPlayerId: input.ctx.turnPlayerId,
        remainingHandCount: input.ctx.remainingHandCount,
        nowMs: input.nowMs,
      }),
      handPhase: "play",
    };
  }

  if (input.handPhase === "ante") {
    const turnKey = antePostTurnKey(input.ctx.handNumber, input.ctx.turnPlayerId ?? "");
    const chosenDelayMs = input.playDelayState.resolveAntePostDelayMs(
      input.ctx.handNumber,
      input.ctx.turnPlayerId ?? "",
    );
    return {
      handPhase: "ante",
      turnKey,
      chosenDelayMs,
      elapsedSinceTurnMs: 0,
      trickGapRemainingMs: 0,
      delayMs: chosenDelayMs,
      remainingHandCount: 5,
      isLastCard: false,
    };
  }

  return {
    handPhase: input.handPhase ?? null,
    turnKey: null,
    chosenDelayMs: BOT_ADVANCE_DEBOUNCE_MS,
    elapsedSinceTurnMs: 0,
    trickGapRemainingMs: 0,
    delayMs: BOT_ADVANCE_DEBOUNCE_MS,
    remainingHandCount: null,
    isLastCard: false,
  };
}

export interface AnteCoinDelayPlan {
  handNumber: number;
  playerIds: string[];
  thinkBeforeMs: number[];
  totalThinkMs: number;
  travelMs: number;
  settleMs: number;
  totalDurationMs: number;
}

export interface BuildAnteCoinDelayPlanInput {
  handNumber: number;
  playerIds: string[];
  reducedMotion?: boolean;
  travelMs?: number;
  settleMs?: number;
  rng?: () => number;
}

const ANTE_PLAN_CACHE = new Map<string, AnteCoinDelayPlan>();

function antePlanCacheKey(handNumber: number, playerIds: string[], reducedMotion: boolean): string {
  return `${handNumber}:${playerIds.join(",")}:${reducedMotion ? "rm" : "full"}`;
}

/** Per-seat think delays before each ante coin — same random policy as bot play (250–700 ms). */
export function buildAnteCoinDelayPlan(input: BuildAnteCoinDelayPlanInput): AnteCoinDelayPlan {
  const reducedMotion = input.reducedMotion ?? false;
  const cacheKey = antePlanCacheKey(input.handNumber, input.playerIds, reducedMotion);
  const cached = ANTE_PLAN_CACHE.get(cacheKey);
  if (cached) return cached;

  const scale = reducedMotion ? 0.35 : 1;
  const travelMs = input.travelMs ?? Math.round(220 * scale);
  const settleMs = input.settleMs ?? Math.round(80 * scale);
  const rng = input.rng ?? createSeededRng(cacheKey);
  const playDelayState = createBotPlayDelayState({ rng });

  const thinkBeforeMs = input.playerIds.map((playerId) => {
    const chosenDelayMs = playDelayState.resolveAntePostDelayMs(input.handNumber, playerId);
    return Math.round(chosenDelayMs * scale);
  });

  const totalThinkMs = thinkBeforeMs.reduce((sum, ms) => sum + ms, 0);
  const totalDurationMs =
    totalThinkMs + input.playerIds.length * travelMs + (input.playerIds.length > 0 ? settleMs : 0);

  const plan: AnteCoinDelayPlan = {
    handNumber: input.handNumber,
    playerIds: [...input.playerIds],
    thinkBeforeMs,
    totalThinkMs,
    travelMs,
    settleMs,
    totalDurationMs,
  };
  ANTE_PLAN_CACHE.set(cacheKey, plan);
  return plan;
}

export function antePresentationWorstCaseDurationMs(
  participantCount: number,
  reducedMotion = false,
  travelMs = 220,
): number {
  const count = Math.max(1, participantCount);
  const scale = reducedMotion ? 0.35 : 1;
  const travel = Math.round(travelMs * scale);
  const settle = Math.round(80 * scale);
  const maxThink = count * Math.round(BOT_PLAY_DELAY_MAX_MS * scale);
  return maxThink + count * travel + settle;
}

export function antePresentationDurationMs(
  handNumber: number,
  playerIds: string[],
  reducedMotion = false,
  travelMs = 220,
): number {
  if (playerIds.length < 1) {
    return antePresentationWorstCaseDurationMs(1, reducedMotion, travelMs);
  }
  return buildAnteCoinDelayPlan({
    handNumber,
    playerIds,
    reducedMotion,
    travelMs,
  }).totalDurationMs;
}

/** @internal test helper */
export function clearAntePlanCacheForTests(): void {
  ANTE_PLAN_CACHE.clear();
}

export interface BotThinkScheduleArmInput {
  ctx: {
    handNumber: number;
    trickNumber?: number | null;
    turnPlayerId?: string | null;
    remainingHandCount?: number | null;
  };
  nowMs: number;
  shouldFire: () => boolean;
  onFire: (payload: { turnKey: string; generation: number; plan: BotPlayDelayResolveResult }) => void;
  log?: {
    armed?: (detail: Record<string, unknown>) => void;
    coalesced?: (detail: Record<string, unknown>) => void;
    rejected?: (detail: Record<string, unknown>) => void;
    accepted?: (detail: Record<string, unknown>) => void;
    delayChosen?: (detail: Record<string, unknown>) => void;
    canceled?: (detail: Record<string, unknown>) => void;
  };
}

export interface BotThinkScheduleState {
  playDelayState: BotPlayDelayState;
  armPlayThink: (
    input: BotThinkScheduleArmInput,
  ) => { action: string; turnKey: string; generation: number } & BotPlayDelayResolveResult;
  cancelPending: (input?: { reason?: string; onCanceled?: (extra: Record<string, unknown>) => void }) => boolean;
  readonly pendingTurnKey: string | null;
  readonly generation: number;
}

/** Play-phase think scheduler — single pending timer per turn key, generation cancel. */
export function createBotThinkScheduleState(options: { rng?: () => number } = {}): BotThinkScheduleState {
  const playDelayState = createBotPlayDelayState(options);
  let scheduledTimer: ReturnType<typeof setTimeout> | null = null;
  let scheduleGeneration = 0;
  let pendingTurnKey: string | null = null;
  let pendingChosenDelayMs: number | null = null;

  function clearTimer(): void {
    if (scheduledTimer) {
      clearTimeout(scheduledTimer);
      scheduledTimer = null;
    }
  }

  function cancelPending({
    reason = "canceled",
    onCanceled,
  }: { reason?: string; onCanceled?: (extra: Record<string, unknown>) => void } = {}): boolean {
    if (!scheduledTimer && !pendingTurnKey) return false;
    scheduleGeneration += 1;
    const extra = {
      reason,
      turnKey: pendingTurnKey,
      generation: scheduleGeneration,
      chosenDelayMs: pendingChosenDelayMs,
    };
    clearTimer();
    pendingTurnKey = null;
    pendingChosenDelayMs = null;
    onCanceled?.(extra);
    return true;
  }

  function armPlayThink({
    ctx,
    nowMs,
    shouldFire,
    onFire,
    log,
  }: BotThinkScheduleArmInput): { action: string; turnKey: string; generation: number } & BotPlayDelayResolveResult {
    const turnKey = botPlayTurnKey(ctx);
    if (scheduledTimer && pendingTurnKey === turnKey) {
      log?.coalesced?.({
        turnKey,
        generation: scheduleGeneration,
        chosenDelayMs: pendingChosenDelayMs,
        remainingHandCount: ctx.remainingHandCount ?? null,
      });
      return {
        action: "coalesced",
        turnKey,
        generation: scheduleGeneration,
        chosenDelayMs: pendingChosenDelayMs ?? 0,
        elapsedSinceTurnMs: 0,
        trickGapRemainingMs: 0,
        delayMs: 0,
        remainingHandCount: ctx.remainingHandCount ?? null,
        isLastCard: ctx.remainingHandCount === 1,
      };
    }

    if (scheduledTimer || pendingTurnKey) {
      cancelPending({
        reason: "superseded",
        onCanceled: (extra) => log?.canceled?.({ ...extra, trigger: "superseded" }),
      });
    }

    const plan = playDelayState.resolvePlayDelayMs({
      handNumber: ctx.handNumber,
      trickNumber: ctx.trickNumber,
      turnPlayerId: ctx.turnPlayerId,
      remainingHandCount: ctx.remainingHandCount,
      nowMs,
    });
    const generation = scheduleGeneration;
    pendingTurnKey = turnKey;
    pendingChosenDelayMs = plan.chosenDelayMs;

    log?.delayChosen?.({
      turnKey,
      generation,
      chosenDelayMs: plan.chosenDelayMs,
      delayMs: plan.delayMs,
      remainingHandCount: plan.remainingHandCount,
      isLastCard: plan.isLastCard,
      handPhase: "play",
    });

    log?.armed?.({
      turnKey,
      generation,
      chosenDelayMs: plan.chosenDelayMs,
      delayMs: plan.delayMs,
      elapsedSinceTurnMs: plan.elapsedSinceTurnMs,
      remainingHandCount: plan.remainingHandCount,
      isLastCard: plan.isLastCard,
      handPhase: "play",
    });

    scheduledTimer = setTimeout(() => {
      scheduledTimer = null;
      if (generation !== scheduleGeneration) return;
      if (pendingTurnKey !== turnKey) return;
      pendingTurnKey = null;
      pendingChosenDelayMs = null;

      if (!shouldFire()) {
        log?.rejected?.({
          turnKey,
          generation,
          chosenDelayMs: plan.chosenDelayMs,
          remainingHandCount: plan.remainingHandCount,
          isLastCard: plan.isLastCard,
          handPhase: "play",
        });
        return;
      }

      log?.accepted?.({
        turnKey,
        generation,
        chosenDelayMs: plan.chosenDelayMs,
        delayMs: plan.delayMs,
        remainingHandCount: plan.remainingHandCount,
        isLastCard: plan.isLastCard,
        handPhase: "play",
      });
      onFire({ turnKey, generation, plan });
    }, plan.delayMs);

    return { action: "armed", turnKey, generation, ...plan };
  }

  return {
    playDelayState,
    armPlayThink,
    cancelPending,
    get pendingTurnKey() {
      return pendingTurnKey;
    },
    get generation() {
      return scheduleGeneration;
    },
  };
}
