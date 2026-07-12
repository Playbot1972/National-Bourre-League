import { useEffect, useState } from "react";
import { HomeScreen } from "./screens/HomeScreen";
import { RulesScreen } from "./screens/RulesScreen";
import { TutorialScreen } from "./screens/TutorialScreen";
import { PrivateRoomScreen } from "./screens/PrivateRoomScreen";
import { AudioManager } from "./audio/AudioManager";
import { BUILD_ID, BUILD_STAMPED_AT, VERSION_DISPLAY_LABEL, VERSION_LABEL } from "./version";
import { getStoredTheme, initTheme, saveTheme, type ThemeMode } from "./theme";
import { unlockAudio } from "./table/feedback/audio";
import "./App.css";

export type Screen = "home" | "rules" | "tutorial" | "room";

const SOCIAL_BASE = "/social/";
const VALID_SCREENS = new Set<Screen>(["home", "rules", "tutorial", "room"]);

const MAIN_NAV: { label: string; href: string; active?: boolean }[] = [
  { label: "Tutorial", href: "/", active: true },
  { label: "Home", href: `${SOCIAL_BASE}#home` },
  { label: "Rules", href: `${SOCIAL_BASE}#rules` },
  { label: "Rooms", href: `${SOCIAL_BASE}#rooms` },
  { label: "Leaderboard", href: `${SOCIAL_BASE}#leaderboard` },
  { label: "Leagues", href: `${SOCIAL_BASE}#leagues` },
];

function screenFromLocation(): Screen {
  const view = new URLSearchParams(window.location.search).get("view");
  if (view && VALID_SCREENS.has(view as Screen)) {
    return view as Screen;
  }
  return "home";
}

function shouldCheckForUpdates() {
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(screenFromLocation);
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (screen === "home") {
      if (!params.has("view")) return;
      params.delete("view");
      const qs = params.toString();
      const next = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", next);
      return;
    }
    if (params.get("view") === screen) return;
    params.set("view", screen);
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [screen]);

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
        <nav className="app__nav app__nav--primary" aria-label="Primary">
          {MAIN_NAV.map((item) => (
            <a
              key={item.label}
              className={`app__nav-link${item.active ? " is-active" : ""}`}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="theme-toggle"
          style={{ marginRight: "0.5rem" }}
          onClick={() => {
            void unlockAudio();
            AudioManager.get().play("card-select");
          }}
          title="Temporary: test card-select.wav"
        >
          🔊 Test sound
        </button>
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
        id="app-version"
        className="app-version"
        aria-label="App version"
        title={`National Bourré League ${VERSION_LABEL} · built ${BUILD_STAMPED_AT}`}
      >
        {VERSION_DISPLAY_LABEL}
      </div>
    </div>
  );
}
