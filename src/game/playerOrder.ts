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

/** Five cards per player in a standard Bourré deal. */
export const CARDS_PER_PLAYER = 5;
