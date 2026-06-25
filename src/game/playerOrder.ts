/** Clockwise table order starting with the first seat after the dealer. */
export function playerOrderFromDealer(
  dealerId: string | null | undefined,
  sortedPlayerIds: string[],
): string[] {
  const ids = [...sortedPlayerIds];
  if (!dealerId || !ids.includes(dealerId)) return ids;
  const idx = ids.indexOf(dealerId);
  return [...ids.slice(idx + 1), ...ids.slice(0, idx + 1)];
}

/** Active participants in clockwise deal / action order. */
export function activePlayerOrder(
  dealerId: string | null | undefined,
  participantIds: string[],
  sortedPlayerIds: string[],
): string[] {
  const order = playerOrderFromDealer(dealerId, sortedPlayerIds);
  const active = new Set(participantIds);
  return order.filter((id) => active.has(id));
}

/** Advance one seat clockwise within the active action ring. */
export function nextActivePlayerClockwise(
  order: string[],
  currentPlayerId: string,
): string | null {
  const idx = order.indexOf(currentPlayerId);
  if (idx < 0) return order[0] ?? null;
  return order[(idx + 1) % order.length] ?? null;
}

/**
 * First active seat to lead trick 1 / start the draw clock — left of dealer,
 * skipping inactive players. Never returns the dealer when another active seat exists.
 */
export function openingLeaderId(
  dealerId: string | null | undefined,
  participantIds: string[],
  sortedPlayerIds: string[],
): string | null {
  const order = activePlayerOrder(dealerId, participantIds, sortedPlayerIds);
  if (!order.length) return null;
  if (dealerId && order[0] === dealerId) {
    return order.find((id) => id !== dealerId) ?? order[0]!;
  }
  return order[0]!;
}

/** Alias — first active player clockwise from the dealer's left. */
export const firstLeaderFromDealerLeft = openingLeaderId;

/** Full clockwise seat ring for a hand (roster order — not dealer-relative actionOrder). */
export function resolveSeatRing(
  hand: {
    seatedIds?: string[];
    participantIds?: string[];
  },
  fallbackSortedPlayerIds?: string[],
): string[] {
  if (hand.seatedIds?.length) return hand.seatedIds;
  if (fallbackSortedPlayerIds?.length) return fallbackSortedPlayerIds;
  return hand.participantIds ?? [];
}

/**
 * Clockwise action order for draw/play — never fall back to raw participantIds
 * (join order often lists the dealer first).
 */
export function resolveActionOrder(
  hand: {
    actionOrder?: string[];
    participantIds?: string[];
    dealerId?: string | null;
    seatedIds?: string[];
  },
  fallbackSortedPlayerIds?: string[],
): string[] {
  const participantIds = hand.participantIds ?? [];
  if (!participantIds.length) return [];

  const seatRing = resolveSeatRing(hand, fallbackSortedPlayerIds);
  const ring =
    seatRing.length > 0
      ? seatRing
      : fallbackSortedPlayerIds?.length
        ? fallbackSortedPlayerIds
        : participantIds;

  const fromRing = activePlayerOrder(hand.dealerId, participantIds, ring);
  if (fromRing.length > 0) return fromRing;

  if (hand.dealerId) {
    return activePlayerOrder(hand.dealerId, participantIds, participantIds);
  }

  if (hand.actionOrder?.length) {
    const filtered = hand.actionOrder.filter((id) => participantIds.includes(id));
    if (filtered.length > 0) return filtered;
  }

  return participantIds;
}

/** Five cards per player in a standard Bourré deal. */
export const CARDS_PER_PLAYER = 5;
