import type { Card, Rank, Suit } from "../types";
import { card } from "../types";

const RANKS: Rank[] = [
  "A",
  "K",
  "Q",
  "J",
  "10",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
];

const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

/** Standard 52-card deck (no jokers). */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(card(rank, suit));
    }
  }
  return deck;
}

/** Mulberry32 PRNG — deterministic shuffle when seed is provided. */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randomSeed(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] ?? Date.now();
  }
  return (Date.now() ^ (Math.random() * 0x100000000)) >>> 0;
}

/** Fisher–Yates shuffle. Optional seed for reproducible deals in tests. */
export function shuffleDeck(deck: Card[], seed?: number): Card[] {
  const out = [...deck];
  const rng = mulberry32(seed ?? randomSeed());
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
