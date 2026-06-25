/** Central discard pile model — deterministic messy placement per card. */

export interface DiscardPileCard {
  id: string;
  playerId: string;
  handNumber: number;
  pileIndex: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unit(hash: number, salt: number): number {
  return ((hash >>> salt) & 0xffff) / 0xffff;
}

/** Deterministic ±12–18px offset, ±7–9° rotation, scale 0.94–0.98. */
export function discardPilePlacement(
  cardKey: string,
  pileIndex: number,
): Pick<DiscardPileCard, "offsetX" | "offsetY" | "rotation" | "scale" | "zIndex"> {
  const h = hashString(`${cardKey}@${pileIndex}`);
  const u1 = unit(h, 0);
  const u2 = unit(h, 7);
  const u3 = unit(h, 14);
  const u4 = unit(h, 21);
  const signX = u1 >= 0.5 ? 1 : -1;
  const signY = u2 >= 0.5 ? 1 : -1;
  const signR = u3 >= 0.5 ? 1 : -1;
  return {
    offsetX: signX * (12 + u1 * 6),
    offsetY: signY * (12 + u2 * 6),
    rotation: signR * (7 + u3 * 2),
    scale: 0.94 + u4 * 0.04,
    zIndex: pileIndex + 1,
  };
}

export function buildDiscardPileCard(input: {
  id: string;
  playerId: string;
  handNumber: number;
  pileIndex: number;
}): DiscardPileCard {
  const placement = discardPilePlacement(input.id, input.pileIndex);
  return { ...input, ...placement };
}

export function discardCardKeysForDraw(input: {
  playerId: string;
  handNumber: number;
  discardCount: number;
  pileStartIndex: number;
  heroCardKeys?: string[];
}): string[] {
  const keys: string[] = [];
  for (let i = 0; i < input.discardCount; i++) {
    const heroKey = input.heroCardKeys?.[i];
    keys.push(
      heroKey ??
        `${input.playerId}:h${input.handNumber}:d${input.pileStartIndex + i}`,
    );
  }
  return keys;
}
