import { useMemo, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  CARD_GESTURE,
  type CardGestureKind,
  createCardGestureSession,
  isScrollCancel,
  isSwipeFlickPlay,
  isTapMovement,
} from "./cardGesture";

export type CardGestureMode = "none" | "play" | "draw-select" | "peek";

export interface UseCardGestureHandlersOptions {
  disabled?: boolean;
  mode: CardGestureMode;
  onPlay?: () => void;
  onSelect?: () => void;
  onPeekStart?: () => void;
  onPeekEnd?: () => void;
  onPressChange?: (pressed: boolean) => void;
}

export function useCardGestureHandlers({
  disabled = false,
  mode,
  onPlay,
  onSelect,
  onPeekStart,
  onPeekEnd,
  onPressChange,
}: UseCardGestureHandlersOptions) {
  const optsRef = useRef({
    disabled,
    mode,
    onPlay,
    onSelect,
    onPeekStart,
    onPeekEnd,
    onPressChange,
  });
  optsRef.current = {
    disabled,
    mode,
    onPlay,
    onSelect,
    onPeekStart,
    onPeekEnd,
    onPressChange,
  };

  const sessionRef = useRef<ReturnType<typeof createCardGestureSession> | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const peekingRef = useRef(false);

  const clearHoldTimer = () => {
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const finishPeek = () => {
    if (!peekingRef.current) return;
    peekingRef.current = false;
    optsRef.current.onPeekEnd?.();
  };

  const firePlay = (kind: CardGestureKind) => {
    const session = sessionRef.current;
    if (!session || session.fired) return;
    session.fired = true;
    clearHoldTimer();
    finishPeek();
    optsRef.current.onPlay?.();
    void kind;
  };

  const fireSelect = () => {
    const session = sessionRef.current;
    if (!session || session.fired) return;
    session.fired = true;
    clearHoldTimer();
    finishPeek();
    optsRef.current.onSelect?.();
  };

  return useMemo(() => {
    const releaseCapture = (target: EventTarget | null, pointerId: number) => {
      if (target instanceof HTMLElement && target.hasPointerCapture(pointerId)) {
        try {
          target.releasePointerCapture(pointerId);
        } catch {
          /* pointer already released */
        }
      }
    };

    const resetSession = (target: EventTarget | null) => {
      clearHoldTimer();
      const session = sessionRef.current;
      if (session) {
        releaseCapture(target, session.pointerId);
      }
      sessionRef.current = null;
      optsRef.current.onPressChange?.(false);
      finishPeek();
    };

    return {
      onPointerDown(event: ReactPointerEvent<HTMLElement>) {
        const opts = optsRef.current;
        if (opts.disabled || opts.mode === "none" || event.button !== 0) return;

        clearHoldTimer();
        sessionRef.current = createCardGestureSession(
          event.pointerId,
          event.clientX,
          event.clientY,
        );
        peekingRef.current = false;
        opts.onPressChange?.(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();

        if (opts.mode === "peek") {
          peekingRef.current = true;
          opts.onPeekStart?.();
          return;
        }

        if (opts.mode === "play") {
          holdTimerRef.current = window.setTimeout(() => {
            holdTimerRef.current = null;
            firePlay("hold");
          }, CARD_GESTURE.HOLD_MS);
        }
      },

      onPointerMove(event: ReactPointerEvent<HTMLElement>) {
        const session = sessionRef.current;
        const opts = optsRef.current;
        if (!session || session.pointerId !== event.pointerId || opts.disabled) return;

        const dx = event.clientX - session.startX;
        const dy = event.clientY - session.startY;

        if (opts.mode === "play" && !session.fired) {
          if (isScrollCancel(dx, dy)) {
            clearHoldTimer();
            finishPeek();
            return;
          }
          if (isSwipeFlickPlay(dx, dy)) {
            firePlay("swipe-flick");
          }
        }
      },

      onPointerUp(event: ReactPointerEvent<HTMLElement>) {
        const session = sessionRef.current;
        const opts = optsRef.current;
        if (!session || session.pointerId !== event.pointerId) return;

        const dx = event.clientX - session.startX;
        const dy = event.clientY - session.startY;
        clearHoldTimer();

        if (!session.fired) {
          if (opts.mode === "play" && isTapMovement(dx, dy)) {
            firePlay("tap");
          } else if (opts.mode === "draw-select" && isTapMovement(dx, dy)) {
            fireSelect();
          }
        }

        releaseCapture(event.currentTarget, event.pointerId);
        sessionRef.current = null;
        opts.onPressChange?.(false);
        finishPeek();
      },

      onPointerCancel(event: ReactPointerEvent<HTMLElement>) {
        const session = sessionRef.current;
        if (!session || session.pointerId !== event.pointerId) return;
        resetSession(event.currentTarget);
      },

      onPointerLeave(event: ReactPointerEvent<HTMLElement>) {
        const session = sessionRef.current;
        const opts = optsRef.current;
        if (!session || session.pointerId !== event.pointerId) return;
        if (opts.mode === "play" || opts.mode === "draw-select") return;
        resetSession(event.currentTarget);
      },
    };
  }, []);
}
