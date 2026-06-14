// rules-content.js — Bourré reference copy for the social app rules page.

export const STANDARD_RULE_SECTIONS = [
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
      "The dealer's fifth card is turned face up to set trump — it is not led to the first trick.",
      "That flipped card stays in the dealer's hand and is played on the dealer's normal turn.",
      "The deal passes to the left after each hand.",
    ],
  },
  {
    id: "play-pass",
    title: "Play or Pass",
    summary: "Each player decides whether to stay in for the pot or pass for that hand.",
    points: [
      "Starting left of dealer, each player plays or passes.",
      "If you pass, you take no further part and cannot win or lose more on that hand.",
      "If you play, you may stand pat or discard and draw replacements from the undealt deck.",
      "Standard rules allow discarding up to all 5 cards; some tables cap draws (see House rules).",
      "If only one player chooses to play, that player wins the pot without playing out tricks.",
      "If the turned-up trump is an ace, the dealer must play.",
    ],
  },
  {
    id: "tricks",
    title: "Trick-Taking",
    summary: "Follow suit, trump when void, and play to win when you legally can.",
    points: [
      "Left of dealer leads the first trick (or the next active player clockwise if they passed).",
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
    title: "Split Pot",
    summary: "A tie for most tricks does not split the pot — it carries over.",
    points: [
      "If two or more players tie for most tricks, the pot is not shared.",
      "The pot stays and carries to the next hand.",
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
      "Some local tables use a fixed penalty (e.g. two chips) — agree before you start.",
      "This app defaults to matching the pot, with an optional 20× ante cap (LmT).",
    ],
  },
  {
    id: "antes-after",
    title: "Antes After a Hand",
    summary: "Who posts the next ante depends on how the last hand ended.",
    points: [
      "A player who paid a bourré penalty does not post the normal ante on the next hand.",
      "Players tied for most tricks in a split pot also skip the next ante.",
      "All other players ante as usual.",
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
];

export const APP_DEFAULT_TEMPLATE = {
  title: "National Bourré League defaults",
  summary: "Practical defaults this app uses for scoring and room settings.",
  points: [
    "52-card deck, 5 cards each.",
    "Dealer's last card face up sets trump and counts in the dealer's hand.",
    "Players may pass or play; plurality of tricks wins the pot.",
    "Tied most-tricks counts carry the pot to the next hand.",
    "Bourré penalty equals the pot; enable LmT for a 20× ante cap with overflow carry.",
    "Players who took at least one trick skip ante on the next deal; bourré'd players skip too.",
    "Privacy: pot, round state, and winners are public; personal net and ledger are private.",
  ],
};

export const DISCARD_RULES = {
  title: "The Draw — official vs. optional caps",
  official:
    "Standard rules allow players to discard up to all 5 cards. In larger games, replacement cards may require the dealer to reshuffle previously discarded and passed cards (except the current player's discards) to finish dealing.",
  houseRuleNote:
    "Hosts can optionally cap discards by player count for simpler live play. This is a convenience, not the published Pagat default.",
  optionalCaps: [
    { players: "5", maxDiscards: "5" },
    { players: "6", maxDiscards: "4" },
    { players: "7", maxDiscards: "3" },
    { players: "8", maxDiscards: "2–3 (or enable reshuffle mode)" },
  ],
};

export const COMMON_VARIATIONS = [
  "Pot limit: winner and bourré pay only up to a cap (this app: LmT at 20× ante).",
  "Double ante: all players ante, and players who stay in pay an extra chip.",
  "Separate trump card: a sixth card sets trump and may or may not belong to the dealer.",
  "Simultaneous play/pass declaration instead of one at a time.",
  "Draw limits: some groups allow up to 4 discards rather than 5.",
];

export const HOUSE_RULE_CATEGORIES = [
  {
    id: "ante",
    title: "Ante & Stakes",
    defaultText: "Equal ante each hand before deal — set in room Bourré settings.",
    examples: ["Fixed ante of 1 chip per player each deal.", "LmT: pot cap at 20× ante."],
  },
  {
    id: "forced-play",
    title: "Forced Play",
    defaultText: "Dealer must play when the turned trump is an ace.",
    examples: ["Dealer must always play.", "Ace of trump forces you to play."],
  },
  {
    id: "ties",
    title: "Ties & Carryover",
    defaultText: "Tie for most tricks — pot carries to the next hand (no split).",
    examples: ["Carry until won outright.", "Split evenly (local variant — not app default)."],
  },
  {
    id: "dealing",
    title: "Deal & Draw",
    defaultText: "5 cards each; dealer's last card face up is trump. Draw up to 4 (house simplifier).",
    examples: [
      "Standard: up to 5 discards; reshuffle discards if deck runs out.",
      "Optional caps by player count (see Draw section).",
    ],
  },
];
