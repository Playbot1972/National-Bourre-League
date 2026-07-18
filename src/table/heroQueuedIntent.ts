/** Scoped invalidation for hero preselect / queued play submit on match-key change. */

const listeners = new Set<(matchKey: string) => void>();

export function invalidateQueuedHeroIntentOlderThan(matchKey: string): void {
  for (const listener of listeners) listener(matchKey);
}

export function subscribeHeroQueuedIntentInvalidation(
  listener: (matchKey: string) => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
