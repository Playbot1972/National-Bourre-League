import { seatPlayerVisualEqual } from "./seatPlayerEqual";
import type { ResolvedSeatLayout } from "./layout/seatLayout";
import type { TablePlayer } from "./types";

export interface TableSeatSlotMemoProps {
  seatIndex: number;
  player: TablePlayer;
  seatPlayer: TablePlayer;
  playerCount: number;
  isMobile: boolean;
  clockwiseDealing: boolean;
  layoutOverride?: ResolvedSeatLayout;
  seatIndexAttr?: number;
  onToggleInHand: (playerId: string, inHand: boolean) => void;
  onPassEnrollment?: (playerId: string) => void;
  onTrickDelta: (playerId: string, delta: number) => void;
  onReaction?: (emoji: string) => void;
}

/** Slot-shell memo — mirrors Seat visual equality plus layout/enrollment shell fields. */
export function tableSeatSlotPropsEqual(
  prev: TableSeatSlotMemoProps,
  next: TableSeatSlotMemoProps,
): boolean {
  return (
    prev.seatIndex === next.seatIndex &&
    prev.playerCount === next.playerCount &&
    prev.isMobile === next.isMobile &&
    prev.clockwiseDealing === next.clockwiseDealing &&
    prev.seatIndexAttr === next.seatIndexAttr &&
    prev.layoutOverride === next.layoutOverride &&
    prev.onToggleInHand === next.onToggleInHand &&
    prev.onPassEnrollment === next.onPassEnrollment &&
    prev.onTrickDelta === next.onTrickDelta &&
    prev.onReaction === next.onReaction &&
    prev.player.playerId === next.player.playerId &&
    prev.player.isSelf === next.player.isSelf &&
    prev.player.canToggleInHand === next.player.canToggleInHand &&
    prev.player.inHand === next.player.inHand &&
    prev.player.canPassEnrollment === next.player.canPassEnrollment &&
    seatPlayerVisualEqual(prev.seatPlayer, next.seatPlayer)
  );
}
