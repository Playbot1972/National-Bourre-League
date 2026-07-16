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

export function clearPlayOriginCache(): void {
  playOriginByKey.clear();
  primedOriginByPlayer.clear();
}
