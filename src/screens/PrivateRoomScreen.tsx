import { useMemo, useState } from "react";
import "./PrivateRoomScreen.css";

const RISK_STAKE_OPTIONS = [1, 2, 5, 10, 20, 50, 100, 500, 1000, 5000, 10000];
const BOURRE_TRICKS_TO_WIN = 3;
const MAX_TRICKS_PER_HAND = 5;

function riskStakeOptionsFor(current: number) {
  const options = [...RISK_STAKE_OPTIONS];
  if (!options.includes(current)) {
    options.push(current);
    options.sort((a, b) => a - b);
  }
  return options;
}

function formatRiskStake(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

function formatNet(amount: number) {
  if (amount > 0) return `+${formatRiskStake(amount)}`;
  if (amount < 0) return `−${formatRiskStake(Math.abs(amount))}`;
  return formatRiskStake(0);
}

interface Player {
  id: string;
  name: string;
  handsWon: number;
  net: number;
}

interface HandRecord {
  handNumber: number;
  winnerId: string;
  participantIds: string[];
  pot: number;
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
  { id: makeId(), name: "You (host)", handsWon: 0, net: 0 },
  { id: makeId(), name: "Marie", handsWon: 0, net: 0 },
  { id: makeId(), name: "Thibodeaux", handsWon: 0, net: 0 },
];

export function PrivateRoomScreen() {
  const [inviteCode, setInviteCode] = useState(generateInviteCode);
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState<Player[]>(SEED_PLAYERS);
  const [newName, setNewName] = useState("");
  const [notes, setNotes] = useState("");
  const [handStake, setHandStake] = useState(1);
  const [handStakeLocked, setHandStakeLocked] = useState(false);
  const [hands, setHands] = useState<HandRecord[]>([]);
  const [tricksThisHand, setTricksThisHand] = useState<Record<string, number>>({});
  const [winnerId, setWinnerId] = useState(SEED_PLAYERS[0]?.id ?? "");
  const [participants, setParticipants] = useState<Set<string>>(
    () => new Set(SEED_PLAYERS.map((p) => p.id)),
  );

  const handCount = hands.length;
  const leaderHands = useMemo(
    () => players.reduce((max, p) => Math.max(max, p.handsWon), 0),
    [players],
  );

  const potPreview = useMemo(() => {
    const count = participants.size;
    return formatRiskStake(handStake * count);
  }, [handStake, participants]);

  const applyHandWin = (winningId: string, participantIds: string[]) => {
    const pot = handStake * participantIds.length;
    const handNumber = handCount + 1;

    setPlayers((prev) =>
      prev.map((p) => {
        if (!participantIds.includes(p.id)) return p;
        const delta = p.id === winningId ? handStake * (participantIds.length - 1) : -handStake;
        return {
          ...p,
          net: p.net + delta,
          handsWon: p.handsWon + (p.id === winningId ? 1 : 0),
        };
      }),
    );
    setHands((prev) => [{ handNumber, winnerId: winningId, participantIds, pot }, ...prev]);
    setTricksThisHand({});
    setHandStakeLocked(true);
  };

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
    const id = makeId();
    setPlayers((prev) => [...prev, { id, name, handsWon: 0, net: 0 }]);
    setParticipants((prev) => new Set([...prev, id]));
    setNewName("");
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setParticipants((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setTricksThisHand((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (winnerId === id) {
      setWinnerId(players.find((p) => p.id !== id)?.id ?? "");
    }
  };

  const adjustHandTrick = (id: string, delta: number) => {
    const current = tricksThisHand[id] ?? 0;
    const next = Math.max(0, Math.min(MAX_TRICKS_PER_HAND, current + delta));
    if (next === current) return;

    if (next >= BOURRE_TRICKS_TO_WIN) {
      const participantIds = players.map((p) => p.id);
      applyHandWin(id, participantIds);
      return;
    }

    setTricksThisHand((prev) => ({ ...prev, [id]: next }));
  };

  const toggleParticipant = (id: string) => {
    setParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const recordHand = () => {
    const participantIds = players.filter((p) => participants.has(p.id)).map((p) => p.id);
    if (participantIds.length < 2) return;
    if (!participantIds.includes(winnerId)) return;
    applyHandWin(winnerId, participantIds);
  };

  const resetScores = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, handsWon: 0, net: 0 })));
    setHands([]);
    setTricksThisHand({});
    setHandStakeLocked(false);
  };

  return (
    <div className="room">
      <header className="room__head">
        <p className="eyebrow">Private room</p>
        <h1>Table lobby</h1>
        <p className="room__lede">
          Invite friends, record hands, and track per-hand stakes for a friendly game.
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
              <span className="room__stat-num">{handCount}</span>
              <span className="room__stat-label">hands played</span>
            </li>
            <li>
              <span className="room__stat-num">{leaderHands}</span>
              <span className="room__stat-label">most hands won</span>
            </li>
          </ul>
        </section>
      </div>

      <section className="panel room__session" aria-label="Session scorekeeping">
        <div className="room__session-stake">
          <span className="room__panel-title">Hand stake (per hand)</span>
          {handStakeLocked ? (
            <p className="room__stake-locked">
              <strong>{formatRiskStake(handStake)}</strong>
              <span className="room__stake-badge">Locked</span>
            </p>
          ) : (
            <select
              className="room__select"
              value={handStake}
              aria-label="Hand stake for this session"
              onChange={(e) => setHandStake(parseInt(e.target.value, 10))}
            >
              {riskStakeOptionsFor(handStake).map((n) => (
                <option key={n} value={n}>
                  {formatRiskStake(n)}
                </option>
              ))}
            </select>
          )}
          <p className="room__stake-hint">Host sets stake · locks after the first hand.</p>
        </div>

        {players.length >= 2 && (
          <div className="room__record-hand">
            <span className="room__panel-title">Record hand #{handCount + 1} manually</span>
            <p className="room__stake-hint">
              Or use + on tricks this hand — {BOURRE_TRICKS_TO_WIN} tricks auto-wins the pot.
            </p>
            <label className="room__record-field">
              Winner
              <select
                className="room__select"
                value={winnerId}
                aria-label="Hand winner"
                onChange={(e) => setWinnerId(e.target.value)}
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="room__participants">
              <legend>In this hand</legend>
              {players.map((p) => (
                <label key={p.id} className="room__participant">
                  <input
                    type="checkbox"
                    checked={participants.has(p.id)}
                    onChange={() => toggleParticipant(p.id)}
                  />
                  {p.name}
                </label>
              ))}
            </fieldset>
            <p className="room__pot-preview">Pot this hand: {potPreview}</p>
            <button
              className="btn btn--primary"
              onClick={recordHand}
              disabled={participants.size < 2}
            >
              Record hand
            </button>
          </div>
        )}
      </section>

      <section className="panel room__players" aria-label="Players and scorekeeping">
        <div className="room__players-head">
          <span className="room__panel-title">Players &amp; scorekeeping</span>
          <button className="room__reset" onClick={resetScores}>
            Reset session
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
            <span>Hands</span>
            <span>This hand</span>
            <span>Net</span>
            <span></span>
          </li>
          {players.length === 0 && (
            <li className="room__empty">No players yet — add someone to start.</li>
          )}
          {players.map((p) => {
            const isLeader = p.handsWon > 0 && p.handsWon === leaderHands;
            const handTricks = tricksThisHand[p.id] ?? 0;
            const netClass =
              p.net > 0 ? "room__net--up" : p.net < 0 ? "room__net--down" : "";
            return (
              <li className={`room__row ${isLeader ? "is-leader" : ""}`} key={p.id}>
                <span className="room__player-name">
                  {p.name}
                  {isLeader && <span className="room__leader-tag">Lead</span>}
                </span>

                <span className="room__hands-won">{p.handsWon}</span>

                <span className="room__score">
                  <button
                    className="room__step"
                    onClick={() => adjustHandTrick(p.id, -1)}
                    aria-label={`Decrease ${p.name} tricks this hand`}
                  >
                    −
                  </button>
                  <input
                    className="room__score-input"
                    type="number"
                    min={0}
                    max={MAX_TRICKS_PER_HAND}
                    value={handTricks}
                    readOnly
                    aria-label={`${p.name} tricks this hand`}
                  />
                  <button
                    className="room__step"
                    onClick={() => adjustHandTrick(p.id, 1)}
                    aria-label={`Increase ${p.name} tricks this hand`}
                  >
                    +
                  </button>
                </span>

                <span className={`room__net ${netClass}`}>{formatNet(p.net)}</span>

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

        {hands.length > 0 && (
          <div className="room__hand-history">
            <span className="room__panel-title">Hand history</span>
            <ul>
              {hands.slice(0, 8).map((h) => {
                const winner = players.find((p) => p.id === h.winnerId);
                return (
                  <li key={h.handNumber}>
                    <span className="room__hand-num">#{h.handNumber}</span>
                    {winner?.name ?? "Unknown"} won {formatRiskStake(h.pot)}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
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
          Informational ledger only. The app does not track or move money.
        </p>
      </section>
    </div>
  );
}
