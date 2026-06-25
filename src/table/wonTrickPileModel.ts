/** Won-trick pile placement — deterministic mini-stack beside each seat avatar. */

export interface WonTrickPileCardPlacement {
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

/** Compact fanned stack — each book offsets slightly for depth. */
export function wonTrickPilePlacement(
  trickKey: string,
  bookIndex: number,
): WonTrickPileCardPlacement {
  const h = hashString(`${trickKey}@book${bookIndex}`);
  const u1 = unit(h, 0);
  const u2 = unit(h, 9);
  const u3 = unit(h, 17);
  const signX = u1 >= 0.5 ? 1 : -1;
  const signR = u2 >= 0.5 ? 1 : -1;
  return {
    offsetX: signX * (1.5 + u1 * 2.5) + bookIndex * 2.2,
    offsetY: bookIndex * -1.8 + u2 * 1.2,
    rotation: signR * (4 + u3 * 5) + bookIndex * 2.5,
    scale: 0.88 - bookIndex * 0.02,
    zIndex: bookIndex + 1,
  };
}

export function wonTrickBookKey(input: {
  playerId: string;
  handNumber: number;
  trickNumber: number;
}): string {
  return `${input.playerId}:h${input.handNumber}:t${input.trickNumber}`;
}
