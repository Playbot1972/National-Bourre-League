/** Max cards a player may discard during the draw round. */
export function maxDrawDiscards(
  participantCount: number,
  dealingRule?: string | null,
): number {
  const rule = (dealingRule ?? "").toLowerCase();
  if (rule.includes("no draw")) return 0;

  const n = Math.max(2, participantCount || 2);
  if (n >= 8) return 2;
  if (n >= 7) return 3;
  if (n >= 6) return 4;
  if (rule.includes("up to 4")) return 4;
  return 5;
}
