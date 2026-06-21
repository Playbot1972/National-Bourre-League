import { useLayoutEffect, useRef, type RefObject } from "react";
import type { SerializedCard } from "../types";
import { GSAP_DURATIONS } from "./motionTokens";
import {
  animateDrawDiscard,
  animateDrawReceive,
  animateFoldOut,
  animatePlayLift,
  animateStandPat,
  animateTrumpMerge,
  dealCardsFromDeck,
  killCardMotion,
  readDeckOrigin,
} from "./cardMotion";
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
  trumpMergeActive: boolean;
  revealedTrumpIndex: number | null;
  playingIndex: number | null;
  cards: SerializedCard[];
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
    trumpMergeActive,
    revealedTrumpIndex,
    playingIndex,
    cards,
  }: HeroCardMotionOptions,
): void {
  const cardKeysBeforeDrawRef = useRef<string[]>([]);
  const dealtRef = useRef(false);
  const playLiftRef = useRef<number | null>(null);

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
      const cardEls = handCards(root);
      const targets =
        pendingDiscardIndices.length > 0
          ? pendingDiscardIndices
              .map((i) => cardEls[i])
              .filter((el): el is HTMLElement => Boolean(el))
          : [...root?.querySelectorAll<HTMLElement>(".hand__slot--draw-selected .pcard") ?? []];
      if (targets.length) animateDrawDiscard(targets);
      return;
    }

    if (drawAnimSubPhase === "receive") {
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
      cardKeysBeforeDrawRef.current = cards.map(cardKey);
    }
  }, [drawAnimSubPhase, cards, pendingDiscardIndices, handRootRef]);

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
    if (!trumpMergeActive || revealedTrumpIndex === null) return;
    const root = handRootRef.current;
    const cardEls = handCards(root);
    const target = cardEls[revealedTrumpIndex];
    if (target) animateTrumpMerge(target);
  }, [trumpMergeActive, revealedTrumpIndex, handRootRef]);

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
