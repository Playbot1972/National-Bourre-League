import { useMemo, useState } from "react";
import { Hand } from "../components/Hand";
import { PlayingCard, type CardState } from "../components/PlayingCard";
import { TUTORIAL_STEPS, type StepVisual } from "../data/tutorial";
import { type Card } from "../types";
import "./TutorialScreen.css";

export function TutorialScreen() {
  const [index, setIndex] = useState(0);
  const step = TUTORIAL_STEPS[index];
  const total = TUTORIAL_STEPS.length;
  const atStart = index === 0;
  const atEnd = index === total - 1;

  const goNext = () => setIndex((i) => Math.min(i + 1, total - 1));
  const goPrev = () => setIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="tut">
      <header className="tut__head">
        <p className="eyebrow">Interactive tutorial</p>
        <h1>Play a hand of Bourré</h1>
        <ProgressDots total={total} current={index} onPick={setIndex} />
      </header>

      <section className="panel tut__stage" key={step.id}>
        <span className="tut__phase">{step.phase}</span>
        <h2 className="tut__title">{step.title}</h2>

        <div className="tut__visual">
          <StepVisualView visual={step.visual} />
        </div>

        <div className="tut__narration">
          {step.narration.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <nav className="tut__controls" aria-label="Tutorial navigation">
        <button className="btn" onClick={goPrev} disabled={atStart}>
          ← Back
        </button>
        <span className="tut__counter">
          Step {index + 1} of {total}
        </span>
        {atEnd ? (
          <button className="btn btn--primary" onClick={() => setIndex(0)}>
            Restart ↺
          </button>
        ) : (
          <button className="btn btn--primary" onClick={goNext}>
            Next →
          </button>
        )}
      </nav>
    </div>
  );
}

function ProgressDots({
  total,
  current,
  onPick,
}: {
  total: number;
  current: number;
  onPick: (i: number) => void;
}) {
  return (
    <div className="tut__dots" role="tablist" aria-label="Tutorial steps">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === current}
          aria-label={`Go to step ${i + 1}`}
          className={`tut__dot ${i === current ? "is-active" : ""} ${
            i < current ? "is-done" : ""
          }`}
          onClick={() => onPick(i)}
        />
      ))}
    </div>
  );
}

function StepVisualView({ visual }: { visual: StepVisual }) {
  switch (visual.kind) {
    case "intro":
      return <IntroVisual />;
    case "deal":
    case "decision":
      return (
        <DealVisual
          hand={visual.hand}
          trump={visual.trump}
          recommendation={
            visual.kind === "decision" ? visual.recommendation : undefined
          }
        />
      );
    case "draw":
      return <DrawVisual visual={visual} />;
    case "trick":
      return <TrickVisual visual={visual} />;
    case "interactive-trick":
      return <InteractiveTrick visual={visual} />;
    case "summary":
      return <SummaryVisual />;
    default:
      return null;
  }
}

function TrumpBadge({ trumpCard }: { trumpCard: Card }) {
  return (
    <div className="tut__trump">
      <span className="tut__trump-label">Trump</span>
      <PlayingCard card={trumpCard} size="sm" state="trump" />
    </div>
  );
}

function IntroVisual() {
  return (
    <div className="tut__intro">
      <PlayingCard card={{ rank: "A", suit: "spades" }} size="lg" state="trump" />
      <PlayingCard card={{ rank: "K", suit: "hearts" }} size="lg" />
      <PlayingCard card={{ rank: "Q", suit: "clubs" }} size="lg" />
      <PlayingCard faceDown size="lg" />
    </div>
  );
}

function DealVisual({
  hand,
  trump,
  recommendation,
}: {
  hand: Card[];
  trump: Card;
  recommendation?: string;
}) {
  const isTrump = (c: Card) => c.suit === trump.suit;
  return (
    <div className="tut__deal">
      <TrumpBadge trumpCard={trump} />
      <div className="tut__yourhand">
        <span className="tut__hand-label">Your hand</span>
        <Hand
          cards={hand}
          size="lg"
          stateFor={(c) => (isTrump(c) ? "trump" : "default")}
          badgeFor={(c) => (isTrump(c) ? "Trump" : undefined)}
        />
      </div>
      {recommendation && <p className="tut__reco">{recommendation}</p>}
    </div>
  );
}

function DrawVisual({
  visual,
}: {
  visual: Extract<StepVisual, { kind: "draw" }>;
}) {
  const { before, after, discardIdx, trump } = visual;
  const isTrump = (c: Card) => c.suit === trump.suit;
  return (
    <div className="tut__draw">
      <TrumpBadge trumpCard={trump} />
      <div className="tut__draw-row">
        <span className="tut__hand-label">Discard the dimmed card</span>
        <Hand
          cards={before}
          size="md"
          stateFor={(_, i) => (discardIdx.includes(i) ? "muted" : "default")}
          badgeFor={(_, i) => (discardIdx.includes(i) ? "Discard" : undefined)}
        />
      </div>
      <div className="tut__draw-arrow" aria-hidden="true">
        ↓ draw ↓
      </div>
      <div className="tut__draw-row">
        <span className="tut__hand-label">New hand — three trump</span>
        <Hand
          cards={after}
          size="md"
          stateFor={(c, i) =>
            i === discardIdx[0] ? "winner" : isTrump(c) ? "trump" : "default"
          }
          badgeFor={(_, i) => (i === discardIdx[0] ? "New" : undefined)}
        />
      </div>
    </div>
  );
}

function TrickVisual({
  visual,
}: {
  visual: Extract<StepVisual, { kind: "trick" }>;
}) {
  const { plays, trump } = visual;
  return (
    <div className="tut__trick">
      <TrumpBadge trumpCard={trump} />
      <div className="tut__trick-plays">
        {plays.map((play) => (
          <figure className="tut__play" key={`${play.player}-${play.card.rank}-${play.card.suit}`}>
            <figcaption className="tut__play-player">{play.player}</figcaption>
            <PlayingCard
              card={play.card}
              size="lg"
              state={play.winner ? "winner" : "default"}
              badge={play.winner ? "Wins" : undefined}
            />
            {play.note && <span className="tut__play-note">{play.note}</span>}
          </figure>
        ))}
      </div>
    </div>
  );
}

function InteractiveTrick({
  visual,
}: {
  visual: Extract<StepVisual, { kind: "interactive-trick" }>;
}) {
  const { trump, ledCard, ledBy, hand, legalIdx, bestIdx, explain } = visual;
  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const isCorrect = picked === bestIdx;
  const isLegal = picked !== null && legalIdx.includes(picked);

  const feedback = useMemo(() => {
    if (picked === null) return null;
    return explain[picked];
  }, [picked, explain]);

  const stateFor = (_c: Card, i: number): CardState => {
    if (solved && i === bestIdx) return "winner";
    if (picked === i) return isLegal ? "selected" : "muted";
    return "default";
  };

  const handlePick = (i: number) => {
    setPicked(i);
    if (i === bestIdx) setSolved(true);
  };

  return (
    <div className="tut__interactive">
      <TrumpBadge trumpCard={trump} />
      <div className="tut__led">
        <span className="tut__hand-label">{ledBy} leads</span>
        <PlayingCard card={ledCard} size="lg" badge="Led" />
      </div>

      <div className="tut__pick">
        <span className="tut__hand-label">Tap a card to play</span>
        <Hand cards={hand} size="lg" stateFor={stateFor} onCardClick={(_, i) => handlePick(i)} />
      </div>

      {feedback && (
        <p
          className={`tut__feedback ${
            isCorrect ? "is-correct" : isLegal ? "is-ok" : "is-wrong"
          }`}
          role="status"
        >
          {isCorrect ? "✓ " : isLegal ? "• " : "✗ "}
          {feedback}
        </p>
      )}
    </div>
  );
}

function SummaryVisual() {
  return (
    <div className="tut__summary">
      <div className="tut__score">
        <span className="tut__score-num">3</span>
        <span className="tut__score-label">tricks won of 5</span>
      </div>
      <div className="tut__summary-cards" aria-hidden="true">
        <PlayingCard card={{ rank: "A", suit: "hearts" }} size="md" state="winner" />
        <PlayingCard card={{ rank: "10", suit: "spades" }} size="md" state="winner" />
        <PlayingCard card={{ rank: "K", suit: "spades" }} size="md" state="winner" />
      </div>
      <p className="tut__pot">You take the pot! 🏆</p>
    </div>
  );
}
