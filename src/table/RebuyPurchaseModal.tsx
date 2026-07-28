import { useState } from "react";
import type { RebuyPurchaseConfig } from "./types";

type Props = {
  open: boolean;
  config: RebuyPurchaseConfig;
  onClose: () => void;
};

function badgeLabel(badge: RebuyPurchaseConfig["packs"][number]["badge"]) {
  if (badge === "popular") return "Popular";
  if (badge === "best_value") return "Best value";
  return null;
}

export function RebuyPurchaseModal({ open, config, onClose }: Props) {
  const [busyPackId, setBusyPackId] = useState<string | null>(null);
  const [freeBusy, setFreeBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  async function handlePurchase(packId: string) {
    setError(null);
    setSuccess(null);
    setBusyPackId(packId);
    try {
      await config.onPurchasePack(packId);
      const pack = config.packs.find((p) => p.id === packId);
      setSuccess(`${pack?.name ?? "Pack"} purchased — chips added to your stack.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Purchase failed";
      if (/cancel/i.test(message)) {
        setError("Purchase canceled.");
      } else {
        setError(message);
      }
    } finally {
      setBusyPackId(null);
    }
  }

  async function handleFreeRebuy() {
    if (!config.onFreeRebuy) return;
    setError(null);
    setSuccess(null);
    setFreeBusy(true);
    try {
      await config.onFreeRebuy();
      setSuccess("Rebuy complete — you can join the next hand.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not rebuy");
    } finally {
      setFreeBusy(false);
    }
  }

  return (
    <div className="rebuy-modal" data-testid="rebuy-modal" role="dialog" aria-modal="true" aria-labelledby="rebuy-modal-title">
      <button type="button" className="rebuy-modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="rebuy-modal__sheet">
        <header className="rebuy-modal__head">
          <h2 id="rebuy-modal-title">Get more chips</h2>
          <button type="button" className="rebuy-modal__close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>
        <p className="rebuy-modal__lede muted small">
          Purchases are verified before chips are added. Usable on your next deal when you&apos;re out.
        </p>

        {error ? (
          <p className="rebuy-modal__feedback rebuy-modal__feedback--error" role="alert" data-testid="rebuy-error">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rebuy-modal__feedback rebuy-modal__feedback--success" role="status" data-testid="rebuy-success">
            {success}
          </p>
        ) : null}

        <ul className="rebuy-pack-list">
          {config.packs.map((pack) => {
            const badge = badgeLabel(pack.badge);
            const busy = busyPackId === pack.id;
            return (
              <li key={pack.id}>
                <button
                  type="button"
                  className={`rebuy-pack${pack.badge ? ` rebuy-pack--${pack.badge}` : ""}`}
                  data-testid={`rebuy-pack-${pack.id}`}
                  disabled={busyPackId != null || freeBusy}
                  onClick={() => void handlePurchase(pack.id)}
                >
                  <span className="rebuy-pack__main">
                    <span className="rebuy-pack__name">{pack.name}</span>
                    <span className="rebuy-pack__chips">{pack.chipsLabel} chips</span>
                  </span>
                  <span className="rebuy-pack__price">{pack.priceLabel}</span>
                  {badge ? <span className={`rebuy-pack__badge rebuy-pack__badge--${pack.badge}`}>{badge}</span> : null}
                  {busy ? <span className="rebuy-pack__busy">Processing…</span> : null}
                </button>
              </li>
            );
          })}
        </ul>

        {config.freeRebuyEnabled && config.onFreeRebuy ? (
          <div className="rebuy-modal__free">
            <p className="muted small">House rule: one free rebuy to table buy-in.</p>
            <button
              type="button"
              className="btn btn--sm"
              data-testid="rebuy-free-button"
              disabled={freeBusy || busyPackId != null}
              onClick={() => void handleFreeRebuy()}
            >
              {freeBusy ? "Rebuying…" : `Free rebuy (${config.freeRebuyAmountLabel ?? "buy-in"})`}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
