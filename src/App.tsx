import { useState } from "react";
import { HomeScreen } from "./screens/HomeScreen";
import { RulesScreen } from "./screens/RulesScreen";
import { TutorialScreen } from "./screens/TutorialScreen";
import { PrivateRoomScreen } from "./screens/PrivateRoomScreen";
import "./App.css";

export type Screen = "home" | "rules" | "tutorial" | "room";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <div className="app">
      <header className="app__header">
        <button
          className="app__brand"
          onClick={() => setScreen("home")}
          aria-label="National Bourré League home"
        >
          <span className="app__brand-mark">♠</span>
          <span className="app__brand-text">
            National <em>Bourré</em> League
          </span>
        </button>
        <nav className="app__nav" aria-label="Primary">
          <button
            className={`app__nav-link ${screen === "rules" ? "is-active" : ""}`}
            onClick={() => setScreen("rules")}
          >
            Rules
          </button>
          <button
            className={`app__nav-link ${screen === "tutorial" ? "is-active" : ""}`}
            onClick={() => setScreen("tutorial")}
          >
            Tutorial
          </button>
          <button
            className={`app__nav-link ${screen === "room" ? "is-active" : ""}`}
            onClick={() => setScreen("room")}
          >
            Private Room
          </button>
          <a className="app__nav-link app__nav-link--external" href="/social/">
            Social
          </a>
        </nav>
      </header>

      <main className="app__main">
        {screen === "home" && <HomeScreen onNavigate={setScreen} />}
        {screen === "rules" && <RulesScreen />}
        {screen === "tutorial" && <TutorialScreen />}
        {screen === "room" && <PrivateRoomScreen />}
      </main>

      <footer className="app__footer">
        <span>National Bourré League · learn the Louisiana classic</span>
      </footer>
    </div>
  );
}
