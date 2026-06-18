// rules-view.js — render the public Bourré rules reference page.

import {
  STANDARD_RULE_SECTIONS,
  APP_DEFAULT_TEMPLATE,
  DISCARD_RULES,
  COMMON_VARIATIONS,
  HOUSE_RULE_CATEGORIES,
} from "./rules-content.js";

let activeTab = "standard";

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[ch],
  );
}

function renderStandardTab() {
  const sections = STANDARD_RULE_SECTIONS.map(
    (section, i) => `
      <article class="rules-card subpanel">
        <div class="rules-card__head">
          <span class="rules-card__num">${i + 1}</span>
          <h3>${escapeHtml(section.title)}</h3>
        </div>
        <p class="rules-card__summary">${escapeHtml(section.summary)}</p>
        <ul class="rules-card__points">
          ${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </article>`,
  ).join("");

  const drawBlock = `
    <article class="rules-card subpanel rules-card--wide">
      <div class="rules-card__head">
        <span class="rules-card__chip">Draw</span>
        <h3>${escapeHtml(DISCARD_RULES.title)}</h3>
      </div>
      <p class="rules-card__summary">${escapeHtml(DISCARD_RULES.official)}</p>
      <p class="muted small">${escapeHtml(DISCARD_RULES.houseRuleNote)}</p>
      <table class="rules-table">
        <thead>
          <tr><th scope="col">Players</th><th scope="col">Optional max discards</th></tr>
        </thead>
        <tbody>
          ${DISCARD_RULES.optionalCaps
            .map(
              (row) =>
                `<tr><td>${escapeHtml(row.players)}</td><td>${escapeHtml(row.maxDiscards)}</td></tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </article>`;

  const variations = `
    <article class="rules-card subpanel rules-card--wide">
      <div class="rules-card__head">
        <span class="rules-card__chip">Variations</span>
        <h3>Common table variations</h3>
      </div>
      <ul class="rules-card__points">
        ${COMMON_VARIATIONS.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>`;

  return `<div class="rules-grid">${sections}${drawBlock}${variations}</div>`;
}

function renderHouseTab() {
  const template = `
    <article class="rules-card subpanel rules-card--wide rules-card--highlight">
      <div class="rules-card__head">
        <span class="rules-card__chip">App default</span>
        <h3>${escapeHtml(APP_DEFAULT_TEMPLATE.title)}</h3>
      </div>
      <p class="rules-card__summary">${escapeHtml(APP_DEFAULT_TEMPLATE.summary)}</p>
      <ul class="rules-card__points">
        ${APP_DEFAULT_TEMPLATE.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
      </ul>
      <p class="muted small">
        Room owners set buy-in and LmT under <strong>Bourré settings</strong> in each private room.
        <a href="#rooms">Open your rooms</a> to configure a table.
      </p>
    </article>`;

  const categories = HOUSE_RULE_CATEGORIES.map(
    (cat) => `
      <article class="rules-card subpanel">
        <div class="rules-card__head">
          <span class="rules-card__chip">House rule</span>
          <h3>${escapeHtml(cat.title)}</h3>
        </div>
        <div class="rules-default">
          <span class="rules-default__label">App default</span>
          <p>${escapeHtml(cat.defaultText)}</p>
        </div>
        <ul class="rules-card__examples">
          ${cat.examples.map((ex) => `<li>e.g. ${escapeHtml(ex)}</li>`).join("")}
        </ul>
      </article>`,
  ).join("");

  return `
    <p class="rules-house-note muted">
      Tables can override standard rules. These defaults match what new rooms start with in this app.
    </p>
    ${template}
    <div class="rules-grid">${categories}</div>`;
}

function renderRulesBody() {
  return activeTab === "standard" ? renderStandardTab() : renderHouseTab();
}

function renderRulesShell() {
  return `
    <header class="rules-head">
      <p class="eyebrow">Reference</p>
      <h2>Bourré rules</h2>
      <p class="rules-lede">
        Standard trick-taking rules from published sources, plus the house-rule template this app uses
        for scoring, pot caps, and privacy.
      </p>
      <div class="rules-tabs" role="tablist" aria-label="Rules type">
        <button type="button" role="tab" class="rules-tab ${activeTab === "standard" ? "is-active" : ""}" data-rules-tab="standard" aria-selected="${activeTab === "standard"}">
          Standard rules
        </button>
        <button type="button" role="tab" class="rules-tab ${activeTab === "house" ? "is-active" : ""}" data-rules-tab="house" aria-selected="${activeTab === "house"}">
          House rules &amp; app defaults
        </button>
      </div>
    </header>
    <div id="rules-body">${renderRulesBody()}</div>`;
}

let bound = false;

export function renderRulesView(root) {
  if (!root) return;
  root.innerHTML = renderRulesShell();

  if (!bound) {
    bound = true;
    root.addEventListener("click", (e) => {
      const tabBtn = e.target.closest("[data-rules-tab]");
      if (!tabBtn || !root.contains(tabBtn)) return;
      const next = tabBtn.dataset.rulesTab;
      if (next !== "standard" && next !== "house") return;
      activeTab = next;
      const body = root.querySelector("#rules-body");
      if (body) body.innerHTML = renderRulesBody();
      root.querySelectorAll("[data-rules-tab]").forEach((btn) => {
        const isActive = btn.dataset.rulesTab === activeTab;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
      });
    });
  }
}
