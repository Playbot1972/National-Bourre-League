import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildDiscardPileCard,
  discardCardKeysForDraw,
  type DiscardPileCard,
} from "../discardPileModel";
import {
  animateCardsToDiscardPile,
  animateOriginRectsToDiscardPile,
  killDiscardFlights,
  seatOriginRectsForDiscard,
} from "../animations/discardPileMotion";
import { readSeatPlayOrigin } from "../trickPlayFly";
import type { SerializedCard } from "../types";

export interface UseDiscardPileStateInput {
  handNumber: number;
  tableRootRef: React.RefObject<HTMLElement | null>;
}

export function useDiscardPileState({ handNumber, tableRootRef }: UseDiscardPileStateInput) {
  const [cards, setCards] = useState<DiscardPileCard[]>([]);
  const pileIndexRef = useRef(0);
  const handRef = useRef(handNumber);

  useEffect(() => {
    if (handRef.current === handNumber) return;
    handRef.current = handNumber;
    pileIndexRef.current = 0;
    killDiscardFlights();
    setCards([]);
  }, [handNumber]);

  const commitDiscardCards = useCallback(
    (entries: { id: string; playerId: string }[]) => {
      if (!entries.length) return;
      const built = entries.map((entry) =>
        buildDiscardPileCard({
          id: entry.id,
          playerId: entry.playerId,
          handNumber,
          pileIndex: pileIndexRef.current++,
        }),
      );
      setCards((prev) => [...prev, ...built]);
    },
    [handNumber],
  );

  return { cards, pileIndexRef, commitDiscardCards };
}

export interface RunHeroDiscardFlyInput {
  cardElements: HTMLElement[];
  cardKeys: string[];
  playerId: string;
  pileStartIndex: number;
  root: HTMLElement;
  onComplete: (committed: { id: string; playerId: string }[]) => void;
}

export function runHeroDiscardFly({
  cardElements,
  cardKeys,
  playerId,
  pileStartIndex,
  root,
  onComplete,
}: RunHeroDiscardFlyInput): void {
  const committed: { id: string; playerId: string }[] = [];
  animateCardsToDiscardPile(cardElements, cardKeys, pileStartIndex, {
    root,
    onCardComplete: (i) => {
      committed.push({ id: cardKeys[i], playerId });
    },
    onComplete: () => onComplete(committed),
  });
}

export interface RunBotDiscardFlyInput {
  playerId: string;
  handNumber: number;
  discardCount: number;
  pileStartIndex: number;
  root: HTMLElement;
  onComplete: (committed: { id: string; playerId: string }[]) => void;
}

export function runBotDiscardFly({
  playerId,
  handNumber,
  discardCount,
  pileStartIndex,
  root,
  onComplete,
}: RunBotDiscardFlyInput): void {
  const keys = discardCardKeysForDraw({
    playerId,
    handNumber,
    discardCount,
    pileStartIndex,
  });
  const origins = seatOriginRectsForDiscard(playerId, discardCount, root);
  if (!origins.length) {
    const seat = readSeatPlayOrigin(playerId);
    if (seat) {
      origins.push(
        ...Array.from({ length: discardCount }, (_, i) => ({
          ...seat,
          left: seat.left + i * 3,
          top: seat.top - i * 2,
        })),
      );
    }
  }
  if (!origins.length) {
    onComplete(keys.map((id) => ({ id, playerId })));
    return;
  }
  animateOriginRectsToDiscardPile(origins, keys, pileStartIndex, root, {
    onComplete: () => onComplete(keys.map((id) => ({ id, playerId }))),
  });
}

export function heroDiscardCardKeys(
  cards: SerializedCard[],
  indices: number[],
): string[] {
  return indices.map((i) => {
    const c = cards[i];
    return c ? `${c.rank}-${c.suit}` : `idx-${i}`;
  });
}

export function readHeroDiscardCardElements(
  handRoot: HTMLElement | null,
  pendingDiscardIndices: number[],
): HTMLElement[] {
  if (!handRoot) return [];
  const cardEls = [...handRoot.querySelectorAll<HTMLElement>(".hand__slot .pcard")];
  if (pendingDiscardIndices.length > 0) {
    return pendingDiscardIndices
      .map((i) => cardEls[i])
      .filter((el): el is HTMLElement => Boolean(el));
  }
  return [...handRoot.querySelectorAll<HTMLElement>(".hand__slot--draw-selected .pcard")];
}
