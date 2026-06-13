import { useMemo, useState } from "react";
import "./PrivateRoomScreen.css";

interface Player {
  id: string;
  name: string;
  score: number;
  riskPoints: number;
}

/** US bill denominations — thematic stake labels only, no money movement. */
const RISK_STAKE_OPTIONS = [1, 2, 5, 10, 20, 50, 100];

function riskStakeOptionsFor(current: number) {
  const options = [...RISK_STAKE_OPTIONS];
  if (!options.includes(current)) {
    options.push(current);
    options.sort((a, b) => a - b);
  }
  return options;
}

function formatRiskStake(amount: number) {
  return `$${amount}`;
}

function generateInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

let nextId = 1;
const makeId = () => `p${nextId++}`;

const SEED_PLAYERS: Player[] = [
  { id: makeId(), name: "You (host)", score: 0, riskPoints: 1 },
  { id: makeId(), name: "Marie", score: 0, riskPoints: 1 },
  { id: makeId(), name: "Thibodeaux", score: 0, riskPoints: 2 },
];

export function PrivateRoomScreen() {
  const [inviteCode, setInviteCode] = useState(generateInviteCode);
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState<Player[]>(SEED_PLAYERS);
  const [newName, setNewName] = useState("");
  const [notes, setNotes] = useState("");

  const totalRisk = useMemo(
    () => players.reduce((sum, p) => sum + p.riskPoints, 0),
    [players],
  );
  const leaderScore = useMemo(
    () => players.reduce((max, p) => Math.max(max, p.score), 0),
    [players],
  );

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
    } catch {
      // Clipboard may be unavailable; the code is still shown on screen.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const regenerate = () => {
    setInviteCode(generateInviteCode());
    setCopied(false);
  };

  const addPlayer = () => {
    const name = newName.trim();
    if (!name) return;
    setPlayers((prev) => [
      ...prev,
      { id: makeId(), name, score: 0, riskPoints: 1 },
    ]);
    setNewName("");
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustScore = (id: string, delta: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, score: Math.max(0, p.score + delta) } : p,
      ),
    );
  };

  const setScore = (id: string, value: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, score: Number.isFinite(value) ? Math.max(0, value) : 0 } : p,
      ),
    );
  };

  const setRisk = (id: string, value: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, riskPoints: value } : p)),
    );
  };

  const resetScores = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
  };

  return (
    <div className="room">
      <header className="room__head">
        <p className="eyebrow">Private room</p>
        <h1>Table lobby</h1>
        <p className="room__lede">
          Invite friends, keep score, and track per-player stakes for a friendly game.
        </p>
        <p className="room__memory" role="note">
          In-memory only — nothing is saved. Refreshing the page clears the room.
        </p>
      </header>

      <div className="room__grid">
        <section className="panel room__invite" aria-label="Invite code">
          <span className="room__panel-title">Invite code</span>
          <div className="room__code" aria-live="polite">
            {inviteCode}
          </div>
          <div className="room__invite-actions">
            <button className="btn btn--primary" onClick={copyCode}>
              {copied ? "Copied ✓" : "Copy code"}
            </button>
            <button className="btn" onClick={regenerate}>
              Regenerate
            </button>
          </div>
          <p className="room__invite-hint">
            Share this code so friends can join your private table.
          </p>
        </section>

        <section className="panel room__stats" aria-label="Room stats">
          <span className="room__panel-title">Room at a glance</span>
          <ul className="room__stat-list">
            <li>
              <span className="room__stat-num">{players.length}</span>
              <span className="room__stat-label">players</span>
            </li>
            <li>
              <span className="room__stat-num">{leaderScore}</span>
              <span className="room__stat-label">leading score</span>
            </li>
            <li>
              <span className="room__stat-num">{totalRisk}</span>
              <span className="room__stat-label">total at stake</span>
            </li>
          </ul>
        </section>
      </div>

      <section className="panel room__players" aria-label="Players and scorekeeping">
        <div className="room__players-head">
          <span className="room__panel-title">Players &amp; scorekeeping</span>
          <button className="room__reset" onClick={resetScores}>
            Reset scores
          </button>
        </div>

        <div className="room__add">
          <input
            className="room__input"
            type="text"
            placeholder="Add a player by name"
            value={newName}
            aria-label="New player name"
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addPlayer();
            }}
          />
          <button className="btn btn--primary" onClick={addPlayer} disabled={!newName.trim()}>
            Add player
          </button>
        </div>

        <ul className="room__list">
          <li className="room__row room__row--header" aria-hidden="true">
            <span>Player</span>
            <span>Score</span>
            <span>Risk stake</span>
            <span></span>
          </li>
          {players.length === 0 && (
            <li className="room__empty">No players yet — add someone to start.</li>
          )}
          {players.map((p) => {
            const isLeader = p.score > 0 && p.score === leaderScore;
            return (
              <li className={`room__row ${isLeader ? "is-leader" : ""}`} key={p.id}>
                <span className="room__player-name">
                  {p.name}
                  {isLeader && <span className="room__leader-tag">Lead</span>}
                </span>

                <span className="room__score">
                  <button
                    className="room__step"
                    onClick={() => adjustScore(p.id, -1)}
                    aria-label={`Decrease ${p.name} score`}
                  >
                    −
                  </button>
                  <input
                    className="room__score-input"
                    type="number"
                    min={0}
                    value={p.score}
                    aria-label={`${p.name} score`}
                    onChange={(e) => setScore(p.id, parseInt(e.target.value, 10))}
                  />
                  <button
                    className="room__step"
                    onClick={() => adjustScore(p.id, 1)}
                    aria-label={`Increase ${p.name} score`}
                  >
                    +
                  </button>
                </span>

                <span className="room__risk">
                  <select
                    className="room__select"
                    value={p.riskPoints}
                    aria-label={`${p.name} risk stake`}
                    onChange={(e) => setRisk(p.id, parseInt(e.target.value, 10))}
                  >
                    {riskStakeOptionsFor(p.riskPoints).map((n) => (
                      <option key={n} value={n}>
                        {formatRiskStake(n)}
                      </option>
                    ))}
                  </select>
                </span>

                <span className="room__row-actions">
                  <button
                    className="room__remove"
                    onClick={() => removePlayer(p.id)}
                    aria-label={`Remove ${p.name}`}
                  >
                    ✕
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel room__notes" aria-label="Side notes">
        <label className="room__panel-title" htmlFor="room-notes">
          Side notes only — no money movement
        </label>
        <textarea
          id="room-notes"
          className="room__notes-field"
          rows={4}
          placeholder="Jot down reminders, seating, or house-rule tweaks. This is not a ledger."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <p className="room__notes-hint">
          For fun and record-keeping only. The app does not track or move money.
        </p>
      </section>
    </div>
  );
}
