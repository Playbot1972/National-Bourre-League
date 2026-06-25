import { useLayoutEffect, useRef, type RefObject } from "react";
import type { SerializedCard } from "../types";
import { GSAP_DURATIONS } from "./motionTokens";
import {
  animateDrawReceive,
  animateFoldOut,
  animatePlayLift,
  animateStandPat,
  dealCardsFromDeck,
  killCardMotion,
  readDeckOrigin,
} from "./cardMotion";
import {
  heroDiscardCardKeys,
  readHeroDiscardCardElements,
  runHeroDiscardFly,
} from "../hooks/useDiscardPileState";
import { initCardMotion } from "./initMotion";

function cardKey(card: SerializedCard): string {
  return `${card.rank}-${card.suit}`;
}

function handCards(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return [...root.querySelectorAll<HTMLElement>(".hand__slot .pcard")];
}

export interface HeroCardMotionOptions {
  dealing: boolean;
  dealStaggerMs: number;
  drawAnimSubPhase: "discard" | "receive" | "done" | null;
  pendingDiscardIndices: number[];
  standPatPulse: boolean;
  foldOutPulse: boolean;
  playingIndex: number | null;
  cards: SerializedCard[];
  handNumber?: number;
  playerId?: string | null;
  tableRootRef?: RefObject<HTMLElement | null>;
  pileIndexRef?: RefObject<number>;
  onDiscardCommitted?: (entries: { id: string; playerId: string }[]) => void;
}

export function useHeroCardMotion(
  handRootRef: RefObject<HTMLElement | null>,
  {
    dealing,
    dealStaggerMs,
    drawAnimSubPhase,
    pendingDiscardIndices,
    standPatPulse,
    foldOutPulse,
    playingIndex,
    cards,
    handNumber = 0,
    playerId = null,
    tableRootRef,
    pileIndexRef,
    onDiscardCommitted,
  }: HeroCardMotionOptions,
): void {
  const cardKeysBeforeDrawRef = useRef<string[]>([]);
  const dealtRef = useRef(false);
  const playLiftRef = useRef<number | null>(null);
  const discardFlyKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    initCardMotion(handRootRef.current?.closest(".btable-wrap") ?? document);
  }, [handRootRef]);

  useLayoutEffect(() => {
    if (!dealing || cards.length === 0) {
      dealtRef.current = false;
      return;
    }
    if (dealtRef.current) return;
    const root = handRootRef.current;
    const cardEls = handCards(root);
    if (!cardEls.length) return;
    dealtRef.current = true;
    const deck = readDeckOrigin(root ?? document);
    if (!deck) return;
    const staggerSec = Math.max(0.04, dealStaggerMs / 1000);
    dealCardsFromDeck(cardEls, deck, staggerSec);
  }, [dealing, cards.length, dealStaggerMs, handRootRef]);

  useLayoutEffect(() => {
    if (drawAnimSubPhase === "discard") {
      cardKeysBeforeDrawRef.current = cards.map(cardKey);
      const root = handRootRef.current;
      const tableRoot = tableRootRef?.current ?? root?.closest(".btable-wrap");
      const targets = readHeroDiscardCardElements(root, pendingDiscardIndices);
      const flyKey = `${handNumber}:${playerId}:discard:${targets.length}:${pendingDiscardIndices.join(",")}`;
      if (!targets.length || !tableRoot || !playerId || discardFlyKeyRef.current === flyKey) {
        return;
      }
      discardFlyKeyRef.current = flyKey;
      const keys = heroDiscardCardKeys(cards, pendingDiscardIndices.length
        ? pendingDiscardIndices
        : targets.map((_, i) => i));
      const pileStart = pileIndexRef?.current ?? 0;
      runHeroDiscardFly({
        cardElements: targets,
        cardKeys: keys,
        playerId,
        pileStartIndex: pileStart,
        root: tableRoot as HTMLElement,
        onComplete: (committed) => {
          if (pileIndexRef) pileIndexRef.current += committed.length;
          onDiscardCommitted?.(committed);
        },
      });
      return;
    }

    if (drawAnimSubPhase === "receive") {
      discardFlyKeyRef.current = null;
      const root = handRootRef.current;
      const cardEls = handCards(root);
      const prev = new Set(cardKeysBeforeDrawRef.current);
      const newCards = cards
        .map((c, i) => ({ key: cardKey(c), el: cardEls[i] }))
        .filter((row): row is { key: string; el: HTMLElement } => Boolean(row.el) && !prev.has(row.key))
        .map((row) => row.el);
      const deck = readDeckOrigin(root ?? document);
      if (newCards.length && deck) animateDrawReceive(newCards, deck);
      return;
    }

    if (drawAnimSubPhase === "done" || drawAnimSubPhase === null) {
      discardFlyKeyRef.current = null;
      cardKeysBeforeDrawRef.current = cards.map(cardKey);
    }
  }, [
    drawAnimSubPhase,
    cards,
    pendingDiscardIndices,
    handRootRef,
    handNumber,
    playerId,
    tableRootRef,
    pileIndexRef,
    onDiscardCommitted,
  ]);

  useLayoutEffect(() => {
    if (!standPatPulse) return;
    const targets = handCards(handRootRef.current);
    if (targets.length) animateStandPat(targets);
  }, [standPatPulse, handRootRef]);

  useLayoutEffect(() => {
    if (!foldOutPulse) return;
    const targets = handCards(handRootRef.current);
    if (targets.length) animateFoldOut(targets);
  }, [foldOutPulse, handRootRef]);

  useLayoutEffect(() => {
    const root = handRootRef.current;
    const cardEls = handCards(root);
    if (playingIndex === null) {
      if (playLiftRef.current !== null) {
        const prev = cardEls[playLiftRef.current];
        if (prev) killCardMotion(prev);
        playLiftRef.current = null;
      }
      return;
    }
    if (playLiftRef.current === playingIndex) return;
    if (playLiftRef.current !== null) {
      const prev = cardEls[playLiftRef.current];
      if (prev) killCardMotion(prev);
    }
    const target = cardEls[playingIndex];
    if (target) {
      animatePlayLift(target);
      playLiftRef.current = playingIndex;
    }
  }, [playingIndex, cards, handRootRef]);

  useLayoutEffect(
    () => () => {
      for (const el of handCards(handRootRef.current)) killCardMotion(el);
    },
    [handRootRef],
  );
}

export function dealMotionWindowMs(cardCount: number, dealStaggerMs: number): number {
  const stagger = dealStaggerMs / 1000;
  const lastStart = Math.max(cardCount - 1, 0) * stagger;
  return Math.round((lastStart + GSAP_DURATIONS.deal) * 1000);
}
