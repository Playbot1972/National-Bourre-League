import { useEffect, useState } from "react";
import { HomeScreen } from "./screens/HomeScreen";
import { RulesScreen } from "./screens/RulesScreen";
import { TutorialScreen } from "./screens/TutorialScreen";
import { PrivateRoomScreen } from "./screens/PrivateRoomScreen";
import { BUILD_ID, BUILD_STAMPED_AT, VERSION_LABEL } from "./version";
import { getStoredTheme, initTheme, saveTheme, type ThemeMode } from "./theme";
import "./App.css";

export type Screen = "home" | "rules" | "tutorial" | "room";

function shouldCheckForUpdates() {
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    if (!shouldCheckForUpdates()) return;

    let cancelled = false;

    async function checkForUpdate() {
      try {
        const res = await fetch(`/build-meta.json?check=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const meta = (await res.json()) as { buildId?: string };
        if (!cancelled && meta.buildId && meta.buildId !== BUILD_ID) {
          setUpdateAvailable(true);
        }
      } catch {
        // Ignore network errors during background update checks.
      }
    }

    checkForUpdate();
    const onFocus = () => {
      checkForUpdate();
    };
    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(checkForUpdate, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    saveTheme(next);
    setTheme(next);
  };

  return (
    <div className="app">
      {updateAvailable ? (
        <div className="app-update-banner" role="status">
          <span>A new version is available.</span>
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      ) : null}
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
        <div className="app__header-actions">
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
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-pressed={theme === "light"}
            aria-label={
              theme === "light"
                ? "Switch to dark mode"
                : "Switch to light mode (US currency)"
            }
            title={theme === "light" ? "Dark mode" : "Light mode · US currency"}
          >
            <span className="theme-toggle__icon" aria-hidden="true">
              {theme === "light" ? "☾" : "☀"}
            </span>
          </button>
        </div>
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
      <div
        className="app-version"
        aria-label="App version"
        title={`National Bourré League ${VERSION_LABEL} · built ${BUILD_STAMPED_AT}`}
      >
        {VERSION_LABEL}
      </div>
    </div>
  );
}
