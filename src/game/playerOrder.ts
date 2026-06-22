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

/** Full clockwise seat ring for a hand (prefer over participant join order). */
export function resolveSeatRing(
  hand: {
    seatedIds?: string[];
    actionOrder?: string[];
    participantIds?: string[];
  },
  fallbackSortedPlayerIds?: string[],
): string[] {
  if (hand.seatedIds?.length) return hand.seatedIds;
  if (fallbackSortedPlayerIds?.length) return fallbackSortedPlayerIds;
  if (hand.actionOrder?.length) return hand.actionOrder;
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
  if (hand.actionOrder?.length) {
    return hand.actionOrder.filter((id) => participantIds.includes(id));
  }
  const seatRing = resolveSeatRing(hand, fallbackSortedPlayerIds);
  return activePlayerOrder(hand.dealerId, participantIds, seatRing);
}

/** Five cards per player in a standard Bourré deal. */
export const CARDS_PER_PLAYER = 5;
