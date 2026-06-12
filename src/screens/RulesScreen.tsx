import { useState } from "react";
import {
  HOUSE_RULE_PLACEHOLDERS,
  STANDARD_RULES,
} from "../data/rules";
import "./RulesScreen.css";

type Tab = "standard" | "house";

export function RulesScreen() {
  const [tab, setTab] = useState<Tab>("standard");

  return (
    <div className="rules">
      <header className="rules__head">
        <p className="eyebrow">Reference</p>
        <h1>Bourré Rules</h1>
        <p className="rules__lede">
          The official standard rules, plus editable placeholders to capture how
          your table likes to play.
        </p>
        <div className="rules__tabs" role="tablist" aria-label="Rules type">
          <button
            role="tab"
            aria-selected={tab === "standard"}
            className={`rules__tab ${tab === "standard" ? "is-active" : ""}`}
            onClick={() => setTab("standard")}
          >
            Standard rules
          </button>
          <button
            role="tab"
            aria-selected={tab === "house"}
            className={`rules__tab ${tab === "house" ? "is-active" : ""}`}
            onClick={() => setTab("house")}
          >
            House rules
          </button>
        </div>
      </header>

      {tab === "standard" && (
        <div className="rules__grid">
          {STANDARD_RULES.map((section, i) => (
            <section className="panel rules__card" key={section.id}>
              <div className="rules__card-head">
                <span className="rules__num">{i + 1}</span>
                <h2>{section.title}</h2>
              </div>
              <p className="rules__summary">{section.summary}</p>
              <ul className="rules__points">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {tab === "house" && (
        <div className="rules__house">
          <p className="rules__house-note">
            These are placeholders — wire them up to your league settings later.
            Each table can override the standard rules below.
          </p>
          <div className="rules__grid">
            {HOUSE_RULE_PLACEHOLDERS.map((ph) => (
              <HouseRuleCard key={ph.id} title={ph.title} prompt={ph.prompt} examples={ph.examples} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface HouseRuleCardProps {
  title: string;
  prompt: string;
  examples: string[];
}

function HouseRuleCard({ title, prompt, examples }: HouseRuleCardProps) {
  return (
    <section className="panel rules__card rules__card--house">
      <div className="rules__card-head">
        <span className="rules__chip">House rule</span>
        <h2>{title}</h2>
      </div>
      <p className="rules__summary">{prompt}</p>
      <div className="rules__placeholder" aria-label={`${title} placeholder`}>
        <span className="rules__placeholder-label">Not set yet</span>
        <span className="rules__placeholder-hint">Add your table's rule here</span>
      </div>
      <ul className="rules__examples">
        {examples.map((ex) => (
          <li key={ex}>e.g. {ex}</li>
        ))}
      </ul>
    </section>
  );
}
