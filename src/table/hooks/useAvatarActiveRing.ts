import { useEffect, useState } from "react";

/** Visual-only active-turn ring duration — does not trigger game actions. */
export const AVATAR_ACTIVE_RING_MS = 15_000;

export interface AvatarActiveRingState {
  /** 0–1 fraction for SVG ring progress; 0 when inactive or elapsed. */
  fraction: number;
  /** True while the ring should render on the avatar. */
  visible: boolean;
}

/**
 * Client-side visual countdown for the yellow avatar ring.
 * Listens to active-actor state only — never dispatches pass/play on expiry.
 */
export function useAvatarActiveRing(active: boolean): AvatarActiveRingState {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!active) {
      setStartedAt(null);
      return;
    }
    setStartedAt(Date.now());
  }, [active]);

  useEffect(() => {
    if (!active || startedAt == null) return;
    const tick = () => setNowMs(Date.now());
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [active, startedAt]);

  if (!active || startedAt == null) {
    return { fraction: 0, visible: false };
  }

  const msLeft = Math.max(0, AVATAR_ACTIVE_RING_MS - (nowMs - startedAt));
  if (msLeft <= 0) {
    return { fraction: 0, visible: false };
  }

  return {
    fraction: msLeft / AVATAR_ACTIVE_RING_MS,
    visible: true,
  };
}
