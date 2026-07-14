/** Explicit hand identity for presentation/server-sync gates (testable). */
export function hasValidHandNumber(handNumber: unknown): handNumber is number {
  return typeof handNumber === "number" && Number.isFinite(handNumber);
}

export function hasValidSessionId(sessionId: unknown): sessionId is string {
  return typeof sessionId === "string" && sessionId.length > 0;
}

export function buildHandPresentationKey(
  sessionId: string,
  handNumber: number,
): string {
  return `${sessionId}-hand-${handNumber}`;
}

export function resolveHandPresentationKey(
  sessionId: unknown,
  handNumber: unknown,
): string | null {
  if (!hasValidSessionId(sessionId) || !hasValidHandNumber(handNumber)) return null;
  return buildHandPresentationKey(sessionId, handNumber);
}
