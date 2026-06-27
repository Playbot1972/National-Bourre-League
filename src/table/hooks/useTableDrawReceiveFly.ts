import { useLayoutEffect, useRef } from "react";
import { runBotDrawReceiveFly } from "../animations/drawSeatMotion";
import type { HandPresentation } from "./useHandPresentation";

export interface UseTableDrawReceiveFlyInput {
  handPresentation: HandPresentation;
  handNumber: number;
  currentUserId: string | null | undefined;
  tableRootRef: React.RefObject<HTMLElement | null>;
}

/** Bot draw replacement — deck-origin card ghosts fly into the seat hand anchor. */
export function useTableDrawReceiveFly({
  handPresentation,
  handNumber,
  currentUserId,
  tableRootRef,
}: UseTableDrawReceiveFlyInput): void {
  const lastFlyKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const playerId = handPresentation.animatingDrawPlayerId;
    const sub = handPresentation.drawAnimSubPhase;
    const count = handPresentation.drawReplaceCount;
    if (sub !== "receive" || !playerId || count <= 0) {
      if (sub !== "receive") lastFlyKeyRef.current = null;
      return;
    }
    if (playerId === currentUserId) return;

    const root = tableRootRef.current;
    if (!root) return;

    const flyKey = `${handNumber}:${playerId}:receive:${count}`;
    if (lastFlyKeyRef.current === flyKey) return;
    lastFlyKeyRef.current = flyKey;

    runBotDrawReceiveFly({
      playerId,
      replaceCount: count,
      root,
    });
  }, [
    handPresentation.animatingDrawPlayerId,
    handPresentation.drawAnimSubPhase,
    handPresentation.drawReplaceCount,
    handNumber,
    currentUserId,
    tableRootRef,
  ]);
}
