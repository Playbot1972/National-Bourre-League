export interface RuleSection {
  id: string;
  title: string;
  summary: string;
  points: string[];
}

export interface HouseRulePlaceholder {
  id: string;
  title: string;
  prompt: string;
  examples: string[];
}

export const STANDARD_RULES: RuleSection[] = [
  {
    id: "objective",
    title: "Objective",
    summary:
      "Bourré (also spelled Booray) is a trick-taking gambling game. Win the most of the five tricks to take the pot.",
    points: [
      "Each deal uses a standard 52-card deck; 2–7 players is typical.",
      "Win more tricks than anyone else in the hand to scoop the pot.",
      "If you stay in but win zero tricks you are \"bourréed\" and must match the pot.",
    ],
  },
  {
    id: "ranking",
    title: "Card Ranking & Trump",
    summary:
      "Aces are high. One suit is named trump for the deal and beats every non-trump card.",
    points: [
      "Rank within a suit: A (high), K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2 (low).",
      "Trump is set by flipping the dealer's last card; that suit outranks all others.",
      "The Ace of trump is the single most powerful card in the deal.",
    ],
  },
  {
    id: "ante-deal",
    title: "Ante & Deal",
    summary:
      "Everyone antes an equal amount to seed the pot, then receives five cards.",
    points: [
      "All players ante the agreed amount before the deal.",
      "Deal five cards to each player, one or in batches, clockwise.",
      "The dealer reveals the trump suit after the deal is complete.",
    ],
  },
  {
    id: "play-fold",
    title: "Play or Fold",
    summary:
      "After seeing your hand and trump, decide whether to play for the pot or fold.",
    points: [
      "Folding (\"passing\") costs nothing more — you simply sit out the hand.",
      "Playing commits you: win a trick or risk being bourréed.",
      "Players declare in turn so later players see how many opponents remain.",
    ],
  },
  {
    id: "draw",
    title: "The Draw",
    summary:
      "Active players may discard unwanted cards and draw replacements from the stock.",
    points: [
      "Discard any number of cards and draw the same number back to five.",
      "Use the draw to chase trump or shed weak off-suit cards.",
      "Once everyone has drawn, the hand is locked for trick play.",
    ],
  },
  {
    id: "trick-play",
    title: "Trick Play — \"Play to Win\"",
    summary:
      "Bourré's defining rule: you must always try to win the trick if you legally can.",
    points: [
      "Follow suit if you can, and you must beat the current high card when able (\"head\" it).",
      "If you cannot follow suit, you must play a trump if you hold one.",
      "Only when you have neither the led suit nor a trump may you throw off any card.",
      "The highest trump wins; if no trump is played, the highest card of the led suit wins.",
      "The winner of each trick leads the next.",
    ],
  },
  {
    id: "scoring",
    title: "Winning the Pot & Being Bourréed",
    summary:
      "The player taking the most tricks wins the pot; staying in without a trick is costly.",
    points: [
      "Most tricks wins the whole pot (3+ of 5 guarantees it).",
      "A player who plays but wins no trick is bourréed and matches the current pot.",
      "The bourré match funds the next hand; anyone who took at least one trick skips ante on that deal.",
      "Ties for most tricks usually split the pot or carry it to the next deal (table choice).",
    ],
  },
];

export const HOUSE_RULE_PLACEHOLDERS: HouseRulePlaceholder[] = [
  {
    id: "ante-amount",
    title: "Ante & Stakes",
    prompt: "Set the table's ante size, pot caps, and any minimum/maximum bets.",
    examples: [
      "Fixed ante of 1 chip per player each deal.",
      "Pot cap so penalties never exceed an agreed ceiling.",
    ],
  },
  {
    id: "must-play",
    title: "Forced Play Variations",
    prompt: "Define when, if ever, a player is forced to stay in the hand.",
    examples: [
      "Dealer must always play.",
      "Holding the Ace of trump forces you to play.",
    ],
  },
  {
    id: "ties",
    title: "Tie & Split Pots",
    prompt: "Decide how tied trick counts and leftover chips are resolved.",
    examples: [
      "Tied pots carry over and grow until won outright.",
      "Split evenly with odd chip to the elder hand.",
    ],
  },
  {
    id: "deal-variations",
    title: "Deal & Draw Variations",
    prompt: "Capture local twists on dealing, trump selection, and the draw.",
    examples: [
      "No draw round — play the hand as dealt.",
      "Trump chosen by the player to the dealer's left.",
    ],
  },
];
