import { playerOrderFromDealer } from "../../game/playerOrder";
import type { TablePlayer, TableSessionData } from "../types";

type SeatOrderSession = Pick<
  TableSessionData,
  "dealerId" | "participantIds" | "handEnrollment"
>;

/**
 * Clockwise seat ring for all players at the table (dealer-relative game order).
 * Uses enrollment ring when it matches the seated roster; otherwise dealer order.
 */
export function seatRingPlayerIds(
  playerIds: string[],
  session: SeatOrderSession,
): string[] {
  const ids = [...new Set(playerIds.filter(Boolean))];
  if (!ids.length) return [];

  const enrollmentRing = session.handEnrollment?.orderedPlayerIds?.filter((id) =>
    ids.includes(id),
  );
  if (enrollmentRing?.length === ids.length) {
    return enrollmentRing;
  }

  const dealerRing = playerOrderFromDealer(session.dealerId, ids);
  const missing = ids.filter((id) => !dealerRing.includes(id));
  return missing.length ? [...dealerRing, ...missing] : dealerRing;
}

/**
 * Table render order: local player at index 0 (bottom), then clockwise.
 */
export function orderPlayersForTable(
  players: TablePlayer[],
  session: SeatOrderSession,
  currentUserId?: string | null,
): TablePlayer[] {
  const byId = new Map(players.map((p) => [p.playerId, p]));
  const ring = seatRingPlayerIds(players.map((p) => p.playerId), session);
  if (!ring.length) return players;

  const selfId =
    currentUserId ??
    players.find((p) => p.isSelf)?.playerId ??
    null;
  const selfIdx = selfId ? ring.indexOf(selfId) : 0;
  const rotated =
    selfIdx > 0 ? [...ring.slice(selfIdx), ...ring.slice(0, selfIdx)] : ring;

  return rotated
    .map((id) => byId.get(id))
    .filter((p): p is TablePlayer => p != null);
}
