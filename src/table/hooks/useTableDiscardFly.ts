import { useLayoutEffect, useRef } from "react";
import type { HandPresentation } from "./useHandPresentation";
import { runBotDiscardFly } from "./useDiscardPileState";

export interface UseTableDiscardFlyInput {
  handPresentation: HandPresentation;
  handNumber: number;
  currentUserId: string | null | undefined;
  tableRootRef: React.RefObject<HTMLElement | null>;
  pileIndexRef: React.RefObject<number>;
  onDiscardCommitted: (entries: { id: string; playerId: string }[]) => void;
}

/** Bot draw discard — seat-origin card ghosts fly to the center pile. */
export function useTableDiscardFly({
  handPresentation,
  handNumber,
  currentUserId,
  tableRootRef,
  pileIndexRef,
  onDiscardCommitted,
}: UseTableDiscardFlyInput): void {
  const lastFlyKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const playerId = handPresentation.animatingDrawPlayerId;
    const sub = handPresentation.drawAnimSubPhase;
    const count = handPresentation.drawDiscardCount;
    if (sub !== "discard" || !playerId || count <= 0) {
      if (sub !== "discard") lastFlyKeyRef.current = null;
      return;
    }
    if (playerId === currentUserId) return;

    const flyKey = `${handNumber}:${playerId}:${count}`;
    if (lastFlyKeyRef.current === flyKey) return;
    lastFlyKeyRef.current = flyKey;

    runBotDiscardFly({
      playerId,
      handNumber,
      discardCount: count,
      pileStartIndex: pileIndexRef.current,
      root: tableRootRef.current ?? undefined,
      onComplete: (committed) => {
        pileIndexRef.current += committed.length;
        onDiscardCommitted(committed);
      },
    });
  }, [
    handPresentation.animatingDrawPlayerId,
    handPresentation.drawAnimSubPhase,
    handPresentation.drawDiscardCount,
    handNumber,
    currentUserId,
    tableRootRef,
    pileIndexRef,
    onDiscardCommitted,
  ]);
}
