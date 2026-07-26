/**
 * Page/session lifecycle — tear down live Firestore + table listeners on navigation away.
 *
 * Browser extensions (MetaMask ObjectMultiplex, Grammarly, etc.) also attach
 * content-script streams on auth iframes; full pagehide cleanup reduces orphaned
 * multiplex traffic when the SPA navigates or reloads.
 */

/** @typedef {{ onPageHide?: (reason: string) => void }} SessionLifecycleHandlers */

/**
 * Register one-shot pagehide cleanup. Safe to call once at app boot.
 * @param {SessionLifecycleHandlers} handlers
 * @returns {() => void} unregister
 */
export function registerAppSessionLifecycle({ onPageHide } = {}) {
  if (typeof window === "undefined") return () => {};

  let tornDown = false;

  const run = (reason) => {
    if (tornDown) return;
    tornDown = true;
    try {
      onPageHide?.(reason);
    } catch (err) {
      console.warn("[session-lifecycle] pagehide cleanup failed:", err?.message ?? err);
    }
  };

  const onPageHideEvent = () => run("pagehide");
  window.addEventListener("pagehide", onPageHideEvent, { capture: true });

  return () => {
    window.removeEventListener("pagehide", onPageHideEvent, { capture: true });
  };
}
