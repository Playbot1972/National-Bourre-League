// Poll deployed build metadata and prompt when a newer build is available.
import { BUILD_ID, VERSION_LABEL } from "./version.js";

const $ = (sel, root = document) => root.querySelector(sel);

function shouldCheckForUpdates() {
  const host = location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

function showUpdateBanner() {
  if (document.getElementById("app-update-banner")) return;
  const banner = document.createElement("div");
  banner.id = "app-update-banner";
  banner.className = "app-update-banner";
  banner.setAttribute("role", "status");
  banner.innerHTML =
    '<span>A new version is available.</span><button type="button" class="btn btn--small">Reload</button>';
  banner.querySelector("button")?.addEventListener("click", () => location.reload());
  document.body.appendChild(banner);
}

export function mountVersionFooter(versionLabel, stampedAt) {
  const versionEl = $("#app-version");
  if (!versionEl) return;
  versionEl.textContent = versionLabel;
  versionEl.title = `National Bourré League ${VERSION_LABEL} · built ${stampedAt}`;
}

export async function checkForDeployedUpdate() {
  if (!shouldCheckForUpdates()) return;
  try {
    const res = await fetch(`./version.js?check=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return;
    const body = await res.text();
    const remoteBuildId = body.match(/BUILD_ID\s*=\s*"([^"]+)"/)?.[1];
    if (!remoteBuildId || remoteBuildId === BUILD_ID) return;
    showUpdateBanner();
  } catch {
    // Network errors should not block the app.
  }
}

export function startVersionUpdateWatcher() {
  if (!shouldCheckForUpdates()) return;
  const run = () => {
    checkForDeployedUpdate().catch(() => {});
  };
  run();
  window.addEventListener("focus", run);
  window.setInterval(run, 5 * 60 * 1000);
}
