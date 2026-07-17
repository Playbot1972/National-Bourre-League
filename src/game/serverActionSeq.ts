import type { PublicHandState } from "./types";

/** Monotonic authoritative action counter on session.currentHand. */
export function initialServerActionSeq(): number {
  return 1;
}

/** Bump seq when persisting the next public hand snapshot. */
export function withServerActionSeq(
  nextPublicHand: PublicHandState,
  prevPublicHand?: PublicHandState | null,
): PublicHandState {
  const prevSeq = prevPublicHand?.serverActionSeq;
  const nextSeq = (prevSeq ?? 0) + 1;
  return {
    ...nextPublicHand,
    serverActionSeq: nextSeq,
  };
}
