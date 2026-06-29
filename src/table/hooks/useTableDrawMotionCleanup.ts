import { useLayoutEffect, useRef } from "react";
import { clearDrawFlyGhosts } from "../animations/drawFlyCleanup";
import type { HandPresentation } from "./useHandPresentation";

export interface UseTableDrawMotionCleanupInput {
  handNumber: number;
  sessionPhase?: string | null;
  turnPlayerId?: string | null;
  drawCompletedIds: string[];
  currentUserId: string | null | undefined;
  handPresentation: HandPresentation;
  tableRootRef: React.RefObject<HTMLElement | null>;
}

/**
 * Clear stray draw fly ghosts when the local player is waiting to act in draw phase.
 * Prevents red placeholder cards from prior bot animations at turn entry.
 */
export function useTableDrawMotionCleanup({
  handNumber,
  sessionPhase,
  turnPlayerId,
  drawCompletedIds,
  currentUserId,
  handPresentation,
  tableRootRef,
}: UseTableDrawMotionCleanupInput): void {
  const lastCleanupKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    if (!root || !currentUserId) return;

    if (sessionPhase !== "draw") {
      lastCleanupKeyRef.current = null;
      return;
    }

    const heroWaitingToDraw =
      turnPlayerId === currentUserId &&
      !drawCompletedIds.includes(currentUserId) &&
      handPresentation.animatingDrawPlayerId !== currentUserId &&
      handPresentation.drawAnimSubPhase === "done";

    if (!heroWaitingToDraw) {
      return;
    }

    const key = `${handNumber}:${currentUserId}:draw-wait`;
    if (lastCleanupKeyRef.current === key) return;
    lastCleanupKeyRef.current = key;
    clearDrawFlyGhosts(root);
  }, [
    handNumber,
    sessionPhase,
    turnPlayerId,
    drawCompletedIds,
    currentUserId,
    handPresentation.animatingDrawPlayerId,
    handPresentation.drawAnimSubPhase,
    tableRootRef,
  ]);

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    if (!root) return;
    clearDrawFlyGhosts(root);
    lastCleanupKeyRef.current = null;
  }, [handNumber, tableRootRef]);
}
