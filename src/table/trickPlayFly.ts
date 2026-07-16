import type { TrickPlay } from "./trickTiming";

export interface PlayOriginRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const playOriginByKey = new Map<string, PlayOriginRect>();
const primedOriginByPlayer = new Map<string, PlayOriginRect>();

export function playFlyKey(play: Pick<TrickPlay, "playerId" | "card">): string {
  return `${play.playerId}:${play.card.rank}:${play.card.suit}`;
}

function rectFromElement(el: Element): PlayOriginRect {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

/** Stable per-seat anchor — survives hole-card count changes after a play. */
export function seatPlayOriginElement(playerId: string): Element | null {
  return document.querySelector(`[data-seat-play-origin="${playerId}"]`);
}

export function readSeatPlayOrigin(playerId: string): PlayOriginRect | null {
  const el = seatPlayOriginElement(playerId);
  if (!el) return null;
  return rectFromElement(el);
}

function originElement(playerId: string): Element | null {
  return (
    document.querySelector(`[data-trick-play-origin-active="${playerId}"] .pcard`) ??
    document.querySelector(`[data-trick-play-origin-active="${playerId}"]`) ??
    document.querySelector(`[data-trick-play-origin="${playerId}"] .pcard`) ??
    document.querySelector(`[data-trick-play-origin="${playerId}"]`) ??
    seatPlayOriginElement(playerId)
  );
}

export function readLivePlayOrigin(playerId: string): PlayOriginRect | null {
  const el = originElement(playerId);
  if (!el) return null;
  return rectFromElement(el);
}

interface PrimePlayOriginOptions {
  /** When false, keep an existing primed rect (hand lane at turn start). */
  force?: boolean;
}

/** Cache the best-known hand origin for a player (refreshed each turn / layout). */
export function primePlayOrigin(
  playerId: string,
  options: PrimePlayOriginOptions = {},
): PlayOriginRect | null {
  if (!options.force && primedOriginByPlayer.has(playerId)) {
    return primedOriginByPlayer.get(playerId)!;
  }
  const rect = readLivePlayOrigin(playerId) ?? readSeatPlayOrigin(playerId);
  if (rect) {
    primedOriginByPlayer.set(playerId, rect);
    return rect;
  }
  return null;
}

export function forcePrimePlayOrigin(playerId: string): PlayOriginRect | null {
  return primePlayOrigin(playerId, { force: true });
}

export function primePlayOrigins(
  playerIds: string[],
  options: PrimePlayOriginOptions = {},
): void {
  for (const playerId of playerIds) primePlayOrigin(playerId, options);
}

export function readPrimedPlayOrigin(playerId: string): PlayOriginRect | undefined {
  return primedOriginByPlayer.get(playerId);
}

export function resolvePlayOrigin(
  playerId: string,
  playKey?: string,
): PlayOriginRect | null {
  if (playKey) {
    const cached = playOriginByKey.get(playKey);
    if (cached) return cached;
  }
  return (
    readPrimedPlayOrigin(playerId) ??
    readLivePlayOrigin(playerId) ??
    readSeatPlayOrigin(playerId) ??
    null
  );
}

export function snapshotPlayOrigin(playerId: string, playKey: string): PlayOriginRect | null {
  const cached = playOriginByKey.get(playKey);
  if (cached) return cached;

  const primed = readPrimedPlayOrigin(playerId);
  if (primed) {
    playOriginByKey.set(playKey, primed);
    return primed;
  }

  const rect = readLivePlayOrigin(playerId) ?? readSeatPlayOrigin(playerId);
  if (rect) playOriginByKey.set(playKey, rect);
  return rect;
}

/** Snapshot the hero's played card while it is still in the hand fan. */
export function snapshotHeroHandCardOrigin(
  playerId: string,
  playKey: string,
  cardIndex: number,
): PlayOriginRect | null {
  const handRoot = document.querySelector('[data-testid="hero-hand"]');
  const cardEl = handRoot?.querySelectorAll(".hand__slot .pcard")[cardIndex];
  if (cardEl) {
    const rect = rectFromElement(cardEl);
    playOriginByKey.set(playKey, rect);
    primedOriginByPlayer.set(playerId, rect);
    return rect;
  }
  return snapshotPlayOrigin(playerId, playKey);
}

export function readCachedPlayOrigin(playKey: string): PlayOriginRect | undefined {
  return playOriginByKey.get(playKey);
}

export function flyOffsetToSlot(
  origin: PlayOriginRect,
  _slotRect: DOMRect,
  cardRect: DOMRect,
): { dx: number; dy: number } {
  const ox = origin.left + origin.width / 2;
  const oy = origin.top + origin.height / 2;
  const cx = cardRect.left + cardRect.width / 2;
  const cy = cardRect.top + cardRect.height / 2;
  return { dx: ox - cx, dy: oy - cy };
}

/** Paths shorter than this are hard to read on dense tables. */
export const SHALLOW_FLY_THRESHOLD_PX = 160;

/** Boost shallow vectors to at least this visible travel distance. */
export const MIN_READABLE_FLY_OFFSET_PX = 200;

/** Cap exaggeration so near-origin seats do not overshoot wildly. */
export const MAX_SHALLOW_FLY_BOOST_RATIO = 2.5;

/** Extra travel time for shallow paths (bounded). */
export const SHALLOW_FLY_MAX_EXTRA_MS = 180;

export function flyOffsetMagnitude(offset: { dx: number; dy: number }): number {
  return Math.hypot(offset.dx, offset.dy);
}

export interface EnhancedFlyOffset {
  dx: number;
  dy: number;
  magnitude: number;
  rawMagnitude: number;
  shallowBoosted: boolean;
}

/**
 * Scale shallow fly vectors along their true direction so geometry-close seats
 * remain accurate but travel farther on screen. Long paths (hero, corners) pass through.
 */
export function enhanceShallowFlyOffset(offset: { dx: number; dy: number }): EnhancedFlyOffset {
  const rawMagnitude = flyOffsetMagnitude(offset);
  if (rawMagnitude < 1e-3) {
    return { ...offset, magnitude: 0, rawMagnitude: 0, shallowBoosted: false };
  }

  if (rawMagnitude >= MIN_READABLE_FLY_OFFSET_PX) {
    return { ...offset, magnitude: rawMagnitude, rawMagnitude, shallowBoosted: false };
  }

  const rawScale = MIN_READABLE_FLY_OFFSET_PX / rawMagnitude;
  const scale = Math.min(rawScale, MAX_SHALLOW_FLY_BOOST_RATIO);
  const magnitude = rawMagnitude * scale;
  if (magnitude <= rawMagnitude + 1) {
    return { ...offset, magnitude: rawMagnitude, rawMagnitude, shallowBoosted: false };
  }

  return {
    dx: offset.dx * scale,
    dy: offset.dy * scale,
    magnitude,
    rawMagnitude,
    shallowBoosted: true,
  };
}

/** Slightly longer travel for shallow paths so boosted distance reads on screen. */
export function shallowFlyTravelMs(
  baseMs: number,
  rawMagnitude: number,
  shallowBoosted: boolean,
): number {
  if (!shallowBoosted) return baseMs;
  const shortfall = Math.max(0, MIN_READABLE_FLY_OFFSET_PX - rawMagnitude);
  const extra = Math.min(SHALLOW_FLY_MAX_EXTRA_MS, Math.round(shortfall * 1.2));
  return baseMs + extra;
}

export function clearPlayOriginCache(): void {
  playOriginByKey.clear();
  primedOriginByPlayer.clear();
}
