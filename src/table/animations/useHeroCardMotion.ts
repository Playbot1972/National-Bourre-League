import { useLayoutEffect, useRef, type RefObject } from "react";
import type { SerializedCard } from "../types";
import { GSAP_DURATIONS } from "./motionTokens";
import {
  animateDrawReceive,
  animateFoldOut,
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
  drawAnimSubPhase: "ring" | "discard" | "receive" | "done" | null;
  drawDiscardCount?: number;
  drawReplaceCount?: number;
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
  skipHeroDealMotion?: boolean;
}

export function useHeroCardMotion(
  handRootRef: RefObject<HTMLElement | null>,
  {
    dealing,
    dealStaggerMs,
    drawAnimSubPhase,
    drawDiscardCount = 0,
    drawReplaceCount = 0,
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
    skipHeroDealMotion = false,
  }: HeroCardMotionOptions,
): void {
  const cardKeysBeforeDrawRef = useRef<string[]>([]);
  const dealtRef = useRef(false);
  const playLiftRef = useRef<number | null>(null);
  const discardFlyKeyRef = useRef<string | null>(null);
  const receiveFlyKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    initCardMotion(handRootRef.current?.closest(".btable-wrap") ?? document);
  }, [handRootRef]);

  useLayoutEffect(() => {
    if (skipHeroDealMotion) {
      dealtRef.current = true;
      return;
    }
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
  }, [dealing, cards.length, dealStaggerMs, handRootRef, skipHeroDealMotion]);

  useLayoutEffect(() => {
    if (drawAnimSubPhase === "discard") {
      if (drawDiscardCount <= 0) return;
      receiveFlyKeyRef.current = null;
      cardKeysBeforeDrawRef.current = cards.map(cardKey);
      const root = handRootRef.current;
      const tableRoot = tableRootRef?.current ?? root?.closest(".btable-wrap");
      const targets = readHeroDiscardCardElements(root, pendingDiscardIndices);
      if (!targets.length || !tableRoot || !playerId) {
        return;
      }
      const flyKey = `${handNumber}:${playerId}:discard:${targets.length}:${pendingDiscardIndices.join(",")}`;
      if (discardFlyKeyRef.current === flyKey) {
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
      if (drawReplaceCount <= 0) return;
      discardFlyKeyRef.current = null;
      const root = handRootRef.current;
      const cardEls = handCards(root);
      const prev = new Set(cardKeysBeforeDrawRef.current);
      const replacements = cards
        .map((c, i) => ({ key: cardKey(c), el: cardEls[i] }))
        .filter((row): row is { key: string; el: HTMLElement } => Boolean(row.el) && !prev.has(row.key));
      if (!replacements.length) return;
      const receiveKeys = replacements
        .map((row) => row.key)
        .sort()
        .join(",");
      const flyKey = `${handNumber}:${playerId ?? ""}:receive:${drawReplaceCount}:${receiveKeys}`;
      if (receiveFlyKeyRef.current === flyKey) return;
      receiveFlyKeyRef.current = flyKey;
      const deck = readDeckOrigin(root ?? document);
      if (deck) animateDrawReceive(replacements.map((row) => row.el), deck);
      return;
    }

    if (drawAnimSubPhase === "done" || drawAnimSubPhase === null) {
      discardFlyKeyRef.current = null;
      receiveFlyKeyRef.current = null;
      cardKeysBeforeDrawRef.current = cards.map(cardKey);
    }
  }, [
    drawAnimSubPhase,
    drawDiscardCount,
    drawReplaceCount,
    cards,
    pendingDiscardIndices,
    handRootRef,
    handNumber,
    playerId,
    tableRootRef,
    pileIndexRef,
    onDiscardCommitted,
    skipHeroDealMotion,
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
      // CSS .pcard--playing owns transform during submit — clear any GSAP lift first.
      killCardMotion(target);
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
