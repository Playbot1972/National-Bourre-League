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
  defaultText: string;
  examples: string[];
}

export const STANDARD_RULES: RuleSection[] = [
  {
    id: "setup",
    title: "Setup",
    summary: "Best with about 7 players; commonly played with 2–8 depending on house rules.",
    points: [
      "Standard 52-card deck, no jokers.",
      "Rank in each suit: A (high) through 2 (low).",
      "Before the first deal, each player posts an equal ante into the pot.",
    ],
  },
  {
    id: "deal",
    title: "Deal",
    summary: "Five cards each; the dealer's upcard sets trump for the hand.",
    points: [
      "Dealer gives each player 5 cards, one at a time.",
      "The dealer's fifth card is turned face up — its suit is trump.",
      "In the common version, that upcard counts as part of the dealer's hand.",
      "The deal passes to the left after each hand.",
    ],
  },
  {
    id: "play-pass",
    title: "Play or Pass",
    summary: "After the deal and trump reveal, each player decides whether to stay in or pass.",
    points: [
      "Cards are dealt and trump is revealed before anyone decides.",
      "Starting left of dealer, each player plays or passes.",
      "If you play, declare how many cards you will discard (0 = stay pat).",
      "If you pass, you take no further part and cannot win or lose more on that hand.",
      "If only one player chooses to play, that player wins the pot without playing out tricks.",
      "If the turned-up trump is an ace, the dealer must play.",
    ],
  },
  {
    id: "trick-play",
    title: "Trick-Taking — Play to Win",
    summary: "Follow suit, trump when void, and beat the high card when you legally can.",
    points: [
      "Left of dealer leads (or the next active player clockwise if they passed).",
      "Winner of each trick leads the next.",
      "Highest card of the led suit wins unless a trump is played — then highest trump wins.",
      "You must follow suit if you can.",
      "If you cannot follow suit, you must play a trump if you have one.",
      "Subject to following suit, you must beat the highest card so far when possible.",
      "If the trick is already trumped and you cannot follow suit, you must overtrump if able.",
      "If you have neither the led suit nor a trump, you may play any card.",
    ],
  },
  {
    id: "cinch",
    title: "Cinch Rule",
    summary: "A player with three sure tricks must lead or trump with their highest trump.",
    points: [
      "When leading with a cinch, lead your highest trump.",
      "When trumping with a cinch, play your highest trump.",
      "Playing last: normal follow-suit and trump rules still apply, but win if able.",
    ],
  },
  {
    id: "winning",
    title: "Winning the Pot",
    summary: "Most tricks wins — three tricks always wins outright.",
    points: [
      "After all five tricks, the player with more tricks than any other single player wins the pot.",
      "Three tricks always wins the pot outright.",
      "In some distributions, two tricks can win if no one else ties your count.",
    ],
  },
  {
    id: "split",
    title: "Tied Pot (Pagat)",
    summary: "A tie for most tricks ends the hand and carries the pot — it is not split.",
    points: [
      "If two or more players tie for most tricks, the hand ends with no outright winner.",
      "The full pot carries forward to the next deal.",
      "Enrollment opens for the next deal; seats may change between deals.",
      "Players seated in time may join that deal; tied leaders skip the ante for it.",
      "New antes and any penalties are added to the carried pot.",
    ],
  },
  {
    id: "bourre",
    title: "Bourré Penalty",
    summary: "Stay in and win zero tricks — you are bourré and match the pot.",
    points: [
      "A player who chose to play and won zero tricks is bourré.",
      "Formal rules: pay an amount equal to the whole pot into the next hand.",
      "Some local tables use a fixed penalty — agree before you start.",
      "This app defaults to matching the pot, with an optional 20× ante cap (LmT).",
    ],
  },
  {
    id: "antes-after",
    title: "Antes After a Hand",
    summary: "Who posts the next ante depends on how the last hand ended.",
    points: [
      "A player who paid a bourré penalty skips the normal ante on the next deal.",
      "Players tied for most tricks (carry or agreed split) skip the ante for that next deal.",
      "All other seated players ante as usual.",
    ],
  },
  {
    id: "reneges",
    title: "Reneges",
    summary: "Breaking play rules carries a pot-sized penalty if not corrected in time.",
    points: [
      "Reneging includes failing to follow suit, failing to trump when required, or failing to beat when able.",
      "If not corrected before the next player acts: pay an amount equal to the pot (like bourré).",
      "If corrected in time: substitute the correct card, but forfeit winning the pot and the next deal.",
    ],
  },
  {
    id: "draw",
    title: "The Draw",
    summary:
      "Standard rules allow up to all 5 discards. In larger games, the dealer may reshuffle previous discards to finish replacements.",
    points: [
      "Optional house-rule caps: 5 players → up to 5; 6 → 4; 7 → 3; 8 → 2–3 or enable reshuffle mode.",
      "Those caps are a convenience for live play, not the published Pagat default.",
    ],
  },
];

export const HOUSE_RULE_PLACEHOLDERS: HouseRulePlaceholder[] = [
  {
    id: "ante-amount",
    title: "Ante & Stakes",
    prompt: "Set the table's ante size, pot caps, and any minimum/maximum bets.",
    defaultText: "Equal ante each hand (set in room Bourré settings). LmT optional at 20× ante.",
    examples: [
      "Fixed ante of 1 chip per player each deal.",
      "Pot cap so penalties never exceed an agreed ceiling.",
    ],
  },
  {
    id: "must-play",
    title: "Forced Play",
    prompt: "Define when, if ever, a player is forced to stay in the hand.",
    defaultText: "Dealer must play when the turned trump is an ace.",
    examples: [
      "Dealer must always play.",
      "Holding the Ace of trump forces you to play.",
    ],
  },
  {
    id: "ties",
    title: "Tie & Carryover",
    prompt: "Decide how tied trick counts and leftover chips are resolved.",
    defaultText:
      "Tie for most tricks — pot carries to next deal; tied leaders skip that ante (Pagat; no split).",
    examples: [
      "Tied pots carry over and grow until won outright; seats may change between deals.",
      "Split evenly (local variant — not app default).",
    ],
  },
  {
    id: "deal-variations",
    title: "Deal & Draw",
    prompt: "Capture local twists on dealing, trump selection, and the draw.",
    defaultText: "5 cards each; dealer's last card face up is trump. Draw up to 5 (2–5 players).",
    examples: [
      "Standard: up to 5 discards; reshuffle discards if deck runs out.",
      "No draw round — play the hand as dealt.",
    ],
  },
];
