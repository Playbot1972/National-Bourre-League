/**
 * Room detail panel HTML builders — presentation only, no subscriptions.
 * Callers pass formatting helpers and live state via a deps object.
 */

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildAddPlayerFormHtml() {
  return `<form class="add-player-form" id="add-player-form" data-testid="add-player-form">
         <input class="text-input" id="add-player-name" placeholder="Guest name (optional for robots)" aria-label="Add player name" data-testid="add-player-name" />
         <label class="add-player-robot">
           <input type="checkbox" id="add-player-robot" data-testid="add-player-robot" checked />
           Robot — auto I&apos;m in &amp; play to win (name optional)
         </label>
         <button type="submit" class="btn btn--sm" id="session-add-player-pill" data-testid="session-add-player-pill">Add to roster</button>
       </form>`;
}

export function buildSessionResultsHtml(s, escape = escapeHtml) {
  if (!Array.isArray(s.results)) return "";
  return `<div class="session-results">
           <h5>Ape Score results</h5>
           <ul>
             ${[...s.results]
               .sort((a, b) => a.placement - b.placement)
               .map(
                 (r) =>
                   `<li><span class="place">#${r.placement}</span> ${escape(r.displayName)}
                      → Ape Score <strong>${r.apeScore}</strong>
                      <span class="momentum ${r.momentum >= 0 ? "up" : "down"}">${r.momentum >= 0 ? "▲" : "▼"} ${Math.abs(r.momentum)}</span></li>`,
               )
               .join("")}
           </ul>
         </div>`;
}

export function buildGameSetupStakesHtml(
  isOwner,
  roomBuyInAmount,
  roomAnteAmount,
  bourreSettings,
  { escapeHtml: escape = escapeHtml, renderAnteSelectOptionsHtml, formatRiskStake, formatAnteStake },
) {
  if (isOwner) {
    return `<div class="game-setup-stakes bourre-settings-form" data-testid="game-setup-stakes">
      <label class="bourre-settings__row">
        <span class="bourre-settings__label">Buy-in</span>
        <input
          type="number"
          class="text-input bourre-settings__amount"
          id="room-buy-in-amount"
          min="1"
          step="1"
          value="${roomBuyInAmount}"
          aria-label="Room buy-in amount"
        />
      </label>
      <label class="bourre-settings__row">
        <span class="bourre-settings__label">Ante</span>
        <select class="num-select" id="room-ante-amount" aria-label="Per-hand ante amount">
          ${renderAnteSelectOptionsHtml(roomAnteAmount, escape)}
        </select>
      </label>
      <label class="bourre-settings__row bourre-settings__lim">
        <input type="checkbox" id="room-lim-enabled" ${bourreSettings.limEnabled ? "checked" : ""} />
        <span>LmT</span>
        <span class="muted small">Pot cap 20× ante</span>
      </label>
      <label class="bourre-settings__row bourre-settings__lim">
        <input type="checkbox" id="room-rebuy-enabled" ${bourreSettings.rebuyEnabled ? "checked" : ""} />
        <span>Rebuy</span>
        <span class="muted small">Top-up when bankroll hits zero</span>
      </label>
      <p class="muted small">Buy-in is each player&apos;s starting stack; ante feeds the pot each hand.</p>
    </div>`;
  }
  return `<ul class="kv game-setup-stakes game-setup-stakes--readonly">
    <li><span>Buy-in</span><span>${escape(formatRiskStake(bourreSettings.buyInAmount))}</span></li>
    <li><span>Ante</span><span>${escape(formatAnteStake(bourreSettings.anteAmount))}</span></li>
    <li><span>LmT</span><span>${bourreSettings.limEnabled ? "On" : "Off"}</span></li>
  </ul>`;
}

export function buildSetupRosterHtml(
  sessionObj,
  isOwner,
  {
    roster,
    scores,
    members,
    buyIn,
    escapeHtml: escape = escapeHtml,
    formatRiskStake,
    scoreBankroll,
  },
) {
  if (!sessionObj || sessionObj.status === "final") {
    return `<p class="muted small game-setup-roster__empty">Open a table to build your roster.</p>`;
  }
  if (roster.length === 0) {
    return `<p class="muted small game-setup-roster__empty">No players yet — add guests or robots below.</p>`;
  }
  return `<ul class="game-setup-roster" data-testid="game-setup-roster">
    ${roster
      .map((entry) => {
        const sc = scores.find((s) => s.playerId === entry.playerId);
        const robot = entry.isRobot;
        const guest = !robot && !members.some((m) => m.userId === entry.playerId);
        const roleLabel = robot ? "robot" : guest ? "guest" : "player";
        const chips = sc != null ? formatRiskStake(scoreBankroll(sc, buyIn)) : null;
        const canRemove =
          isOwner && sessionObj.status !== "final" && (robot || guest) && entry.playerId;
        return `<li class="game-setup-roster__row" data-testid="setup-roster-entry">
          <span class="dot${robot ? " dot--robot" : guest ? " dot--guest" : ""}"></span>
          <span class="game-setup-roster__name">${escape(entry.displayName)}</span>
          <em class="game-setup-roster__role">${escape(roleLabel)}</em>
          ${chips ? `<span class="game-setup-roster__chips muted small">${escape(chips)}</span>` : ""}
          ${
            canRemove
              ? `<button type="button" class="btn btn--sm btn--danger game-setup-roster__remove" data-remove-session-player="${escape(entry.playerId)}" data-remove-session-name="${escape(entry.displayName)}" aria-label="Remove ${escape(entry.displayName)}">Remove</button>`
              : ""
          }
        </li>`;
      })
      .join("")}
  </ul>`;
}

export function buildSessionLiveStatusHtml(
  s,
  {
    tableReadyPlayerCount,
    tablePlayOpen,
    formatAnteStake,
    escapeHtml: escape = escapeHtml,
    getSessionEnrollment,
    getSessionCurrentHand,
  },
) {
  if (!s || s.status === "final" || tableReadyPlayerCount(s) < 2) return "";
  const enrollment = getSessionEnrollment(s);
  const handNum = (s.handCount ?? 0) + 1;
  let status = `Hand #${handNum} · ante ${formatAnteStake(s.handStake ?? 1)}`;
  if (enrollment?.active) {
    status += tablePlayOpen ? " · join window open" : " · join window open — return to table";
  } else {
    const phase = getSessionCurrentHand(s)?.phase;
    if (phase === "draw") status += " · draw phase";
    else if (phase === "play") status += " · live play";
    else status += " · tap Play to deal";
  }
  return `<div class="session-live-card">
      <p class="session-live-card__status">${escape(status)}</p>
      <p class="muted small session-live-card__hint">
        Cards and enrollment are in the table view. Hand results and session controls stay here.
      </p>
    </div>`;
}
