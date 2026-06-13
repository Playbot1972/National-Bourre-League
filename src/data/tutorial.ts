import { card, type Card, type Suit } from "../types";

export interface TrickPlay {
  player: string;
  card: Card;
  note?: string;
  winner?: boolean;
}

export type StepVisual =
  | { kind: "intro" }
  | { kind: "deal"; hand: Card[]; trump: Card }
  | { kind: "decision"; hand: Card[]; trump: Card; recommendation: string }
  | {
      kind: "draw";
      before: Card[];
      discardIdx: number[];
      after: Card[];
      trump: Card;
    }
  | { kind: "trick"; trump: Card; leadSuit: Suit; plays: TrickPlay[] }
  | {
      kind: "interactive-trick";
      trump: Card;
      ledCard: Card;
      ledBy: string;
      hand: Card[];
      legalIdx: number[];
      bestIdx: number;
      explain: Record<number, string>;
    }
  | { kind: "summary" };

export interface TutorialStep {
  id: string;
  phase: string;
  title: string;
  narration: string[];
  visual: StepVisual;
}

const TRUMP: Card = card("9", "spades");

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    phase: "Warm-up",
    title: "Welcome to the Bourré table",
    narration: [
      "We'll walk through a single hand of Bourré from ante to showdown.",
      "Spades is trump for this whole lesson — trump beats every other suit.",
      "Use Next and Back to move through each step at your own pace.",
    ],
    visual: { kind: "intro" },
  },
  {
    id: "deal",
    phase: "Step 1 · Deal",
    title: "Everyone antes and gets five cards",
    narration: [
      "All players ante into the pot, then the dealer gives everyone five cards.",
      "The dealer flips the trump card — here it is the 9♠, so Spades is trump.",
      "This is your hand. Notice you hold two spades: trump cards are gold-framed.",
    ],
    visual: {
      kind: "deal",
      trump: TRUMP,
      hand: [
        card("A", "hearts"),
        card("K", "spades"),
        card("7", "spades"),
        card("Q", "diamonds"),
        card("4", "clubs"),
      ],
    },
  },
  {
    id: "decision",
    phase: "Step 2 · Play or Fold",
    title: "Decide whether to play",
    narration: [
      "Look for trump strength and high cards before committing.",
      "You hold the K♠ and 7♠ (two trump) plus the A♥ — a strong, winning-looking hand.",
      "With trump like this you should play. Fold only weak hands to avoid being bourréed.",
    ],
    visual: {
      kind: "decision",
      trump: TRUMP,
      recommendation:
        "Recommended: PLAY — two trump cards plus an off-suit Ace can win multiple tricks.",
      hand: [
        card("A", "hearts"),
        card("K", "spades"),
        card("7", "spades"),
        card("Q", "diamonds"),
        card("4", "clubs"),
      ],
    },
  },
  {
    id: "draw",
    phase: "Step 3 · The Draw",
    title: "Swap weak cards",
    narration: [
      "You may discard cards and draw replacements to improve the hand.",
      "Here we toss the 4♣ — a low off-suit card that is unlikely to win a trick.",
      "We draw the 10♠, giving us three trump. Discarded cards are dimmed.",
    ],
    visual: {
      kind: "draw",
      trump: TRUMP,
      discardIdx: [4],
      before: [
        card("A", "hearts"),
        card("K", "spades"),
        card("7", "spades"),
        card("Q", "diamonds"),
        card("4", "clubs"),
      ],
      after: [
        card("A", "hearts"),
        card("K", "spades"),
        card("7", "spades"),
        card("Q", "diamonds"),
        card("10", "spades"),
      ],
    },
  },
  {
    id: "trick-follow",
    phase: "Step 4 · Trick play",
    title: "Follow suit and \"head\" the trick",
    narration: [
      "An opponent leads the Q♥. You must follow the led suit (hearts) if you can.",
      "You hold the A♥ — the highest heart — so the rule forces you to play it and win.",
      "Bourré makes you try to win whenever you legally can; you can't duck with a low card.",
    ],
    visual: {
      kind: "trick",
      trump: TRUMP,
      leadSuit: "hearts",
      plays: [
        { player: "West", card: card("Q", "hearts"), note: "Leads hearts" },
        { player: "North", card: card("8", "hearts"), note: "Follows low" },
        {
          player: "You",
          card: card("A", "hearts"),
          note: "Must head it — highest heart",
          winner: true,
        },
      ],
    },
  },
  {
    id: "trick-trump",
    phase: "Step 5 · Trick play",
    title: "Out of suit? You must trump",
    narration: [
      "Now West leads the K♦. You have no diamonds, so you cannot follow suit.",
      "Because you hold trump, the rules force you to play a trump (Spades) to try to win.",
      "Your 10♠ beats the off-suit diamonds and takes the trick.",
    ],
    visual: {
      kind: "trick",
      trump: TRUMP,
      leadSuit: "diamonds",
      plays: [
        { player: "West", card: card("K", "diamonds"), note: "Leads diamonds" },
        { player: "North", card: card("J", "diamonds"), note: "Follows suit" },
        {
          player: "You",
          card: card("10", "spades"),
          note: "Void in diamonds — must trump",
          winner: true,
        },
      ],
    },
  },
  {
    id: "interactive",
    phase: "Step 6 · Your turn",
    title: "You play: pick the legal winning card",
    narration: [
      "West leads the J♣. You are void in clubs, so you must play a trump if you have one.",
      "Tap the card you think the rules require. Illegal plays are blocked with an explanation.",
      "Find the trump that legally wins the trick.",
    ],
    visual: {
      kind: "interactive-trick",
      trump: TRUMP,
      ledCard: card("J", "clubs"),
      ledBy: "West",
      hand: [card("K", "spades"), card("7", "spades"), card("Q", "diamonds")],
      legalIdx: [0, 1],
      bestIdx: 0,
      explain: {
        0: "Correct! You're void in clubs, so you must trump. K♠ is your strongest trump and wins the trick.",
        1: "Legal — you trumped in. It wins here, but K♠ is the stronger trump to commit.",
        2: "Illegal: you hold trump (Spades), so you can't throw off the Q♦. Bourré forces you to trump when void in the led suit.",
      },
    },
  },
  {
    id: "showdown",
    phase: "Step 7 · Showdown",
    title: "Most tricks takes the pot",
    narration: [
      "You won three of the five tricks — a majority — so you scoop the entire pot.",
      "Any player who stayed in but won zero tricks is \"bourréed\" and must match the pot.",
      "That penalty is what makes the \"play to win\" rule so important. You're ready to play!",
    ],
    visual: { kind: "summary" },
  },
];
