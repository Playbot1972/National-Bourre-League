import { memo, useCallback, useMemo, type CSSProperties } from "react";
import { Seat } from "./Seat";
import { resolveSeatLayout, type ResolvedSeatLayout } from "./layout/seatLayout";
import { tableSeatSlotPropsEqual } from "./tableSeatSlotEqual";
import type { TablePlayer } from "./types";

export interface TableSeatSlotProps {
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

function layoutStyle(layout: ResolvedSeatLayout): CSSProperties {
  return { left: `${layout.x}%`, top: `${layout.y}%` };
}

function TableSeatSlotInner({
  seatIndex,
  player,
  seatPlayer,
  playerCount,
  isMobile,
  clockwiseDealing,
  layoutOverride,
  seatIndexAttr,
  onToggleInHand,
  onPassEnrollment,
  onTrickDelta,
  onReaction,
}: TableSeatSlotProps) {
  const layout = useMemo(
    () =>
      layoutOverride ??
      resolveSeatLayout(seatIndex, playerCount, {
        isMobile,
        isSelf: player.isSelf,
      }),
    [layoutOverride, seatIndex, playerCount, isMobile, player.isSelf],
  );

  const style = useMemo(() => layoutStyle(layout), [layout.x, layout.y]);

  const handleToggleInHand = useCallback(() => {
    onToggleInHand(player.playerId, player.canToggleInHand ? true : !player.inHand);
  }, [onToggleInHand, player.playerId, player.canToggleInHand, player.inHand]);

  const handlePassEnrollment = useCallback(() => {
    onPassEnrollment?.(player.playerId);
  }, [onPassEnrollment, player.playerId]);

  const handleTrickDelta = useCallback(
    (delta: number) => {
      onTrickDelta(player.playerId, delta);
    },
    [onTrickDelta, player.playerId],
  );

  const passEnrollment = player.canPassEnrollment && onPassEnrollment ? handlePassEnrollment : undefined;
  const reaction = player.isSelf ? onReaction : undefined;

  return (
    <div
      className={`btable__seat-slot btable__seat-slot--${seatIndex}${player.isSelf ? " btable__seat-slot--self" : ""}`}
      data-seat-index={seatIndexAttr ?? (player.isSelf ? 0 : seatIndex + (isMobile ? 1 : 0))}
    >
      <Seat
        player={seatPlayer}
        region={layout.region}
        handLane={layout.handLane}
        clockwiseDealing={clockwiseDealing}
        style={style}
        onToggleInHand={handleToggleInHand}
        onPassEnrollment={passEnrollment}
        onTrickDelta={handleTrickDelta}
        onReaction={reaction}
        countdownPlayerId={seatPlayer.isActiveActor ? seatPlayer.playerId : null}
      />
    </div>
  );
}

export const TableSeatSlot = memo(TableSeatSlotInner, tableSeatSlotPropsEqual);
