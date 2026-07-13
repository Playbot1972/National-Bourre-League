import type { Screen } from "../App";
import { Hand } from "../components/Hand";
import { card } from "../types";
import "./HomeScreen.css";

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

const SHOWCASE = [
  card("A", "spades"),
  card("K", "hearts"),
  card("Q", "clubs"),
  card("J", "diamonds"),
  card("10", "spades"),
];

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="home">
      <section className="home__hero">
        <p className="eyebrow">Louisiana's trick-taking classic</p>
        <h1 className="home__title">
          Master <em>Bourré</em> the elegant way
        </h1>
        <p className="home__lede">
          Learn the standard rules, capture your table's house rules, and play
          through an interactive hand with step-by-step explanations.
        </p>
        <div className="home__cta">
          <button className="btn btn--primary" onClick={() => onNavigate("tutorial")}>
            Start the tutorial
          </button>
          <button className="btn" onClick={() => onNavigate("rules")}>
            Read the rules
          </button>
        </div>
        <div className="home__cards" aria-hidden="true">
          <Hand cards={SHOWCASE} size="lg" fan />
        </div>
      </section>

      <section className="home__features">
        <article className="panel home__feature">
          <span className="home__feature-icon">♣</span>
          <h2>Rules screen</h2>
          <p>
            A clear reference for standard Bourré — objective, trump, the draw,
            and the all-important “play to win” rule.
          </p>
          <button className="home__feature-link" onClick={() => onNavigate("rules")}>
            View rules →
          </button>
        </article>
        <article className="panel home__feature">
          <span className="home__feature-icon">♦</span>
          <h2>House rules</h2>
          <p>
            Placeholders for ante size, forced play, tie handling, and deal
            variations so every table can record its own customs.
          </p>
          <button className="home__feature-link" onClick={() => onNavigate("rules")}>
            Customize →
          </button>
        </article>
        <article className="panel home__feature">
          <span className="home__feature-icon">♥</span>
          <h2>Interactive tutorial</h2>
          <p>
            Walk a full hand with elegant card visuals, then make a real play
            decision and get instant feedback.
          </p>
          <button className="home__feature-link" onClick={() => onNavigate("tutorial")}>
            Play through →
          </button>
        </article>
        <article className="panel home__feature">
          <span className="home__feature-icon">♠</span>
          <h2>Private room</h2>
          <p>
            Spin up a private table with an invite code, a player list,
            scorekeeping, and per-player risk points.
          </p>
          <a className="home__feature-link" href="/social/#rooms-practice">
            Open practice room →
          </a>
        </article>
        <article className="panel home__feature">
          <span className="home__feature-icon">🦍</span>
          <h2>Social &amp; Ape Score</h2>
          <p>
            Sign in for persistent private rooms, leagues, and the TrueSkill
            leaderboard — bragging rights only, never money.
          </p>
          <a className="home__feature-link" href="/social/">
            Go to social app →
          </a>
        </article>
      </section>
    </div>
  );
}
