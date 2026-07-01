import { useMemo, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  CARD_GESTURE,
  type CardGestureKind,
  classifyPlayPointerMove,
  createCardGestureSession,
  isScrollCancel,
  resolvePlayReleaseAction,
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
        if (opts.mode === "play" || opts.mode === "draw-select") {
          event.preventDefault();
        }

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
          const moveKind = classifyPlayPointerMove(dx, dy);
          if (moveKind === "scroll-cancel") {
            session.scrollCancelled = true;
            clearHoldTimer();
            return;
          }
          if (moveKind === "swipe") {
            session.swipeIntent = true;
            clearHoldTimer();
          }
        } else if (opts.mode === "draw-select" && isScrollCancel(dx, dy)) {
          session.scrollCancelled = true;
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
          if (opts.mode === "play") {
            const action = resolvePlayReleaseAction(dx, dy, session);
            if (action === "tap") firePlay("tap");
            else if (action === "swipe-up") firePlay("swipe-up");
            else if (action === "swipe-flick") firePlay("swipe-flick");
          } else if (opts.mode === "draw-select" && !session.scrollCancelled && !isScrollCancel(dx, dy)) {
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
