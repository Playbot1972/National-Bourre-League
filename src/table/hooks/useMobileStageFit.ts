import { useLayoutEffect, useRef } from "react";
import {
  computeMobileLandscapeOverlayFit,
  computeStageFit,
  landscapeStageShareForPlayers,
  resolveHeroBudget,
  resolveSessionChromeBudget,
  SESSION_CHROME_FLOOR_PX,
} from "../stageFit";
import {
  isDealPresentationActive,
  isTrickCollectionActive,
} from "../presentationMotionBusy";
import { useTableLayoutMode } from "../layout/useTableLayoutMode";
import { useTableTheme } from "../theme/useTableTheme";

interface UseMobileStageFitOptions {
  aspect: number;
  sessionKey?: string;
}

function readSafePx(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function measureMobileChromePx(wrap: HTMLElement): number {
  const session = wrap.closest<HTMLElement>(".btable-session");
  if (!session) return 0;
  const headRow = session.querySelector<HTMLElement>(".btable-session__head-row");
  const status = session.querySelector<HTMLElement>(".btable-session__status");
  let chrome = 0;
  if (headRow) chrome += headRow.getBoundingClientRect().height;
  if (status) chrome += status.getBoundingClientRect().height;
  chrome += 24;
  const mobileShell = session.querySelector<HTMLElement>(".btable-mobile");
  if (mobileShell) {
    const sessionRect = session.getBoundingClientRect();
    const shellRect = mobileShell.getBoundingClientRect();
    const above = Math.max(0, shellRect.top - sessionRect.top);
    const below = Math.max(0, sessionRect.bottom - shellRect.bottom);
    return Math.max(chrome, above + below) + 4;
  }
  return chrome + 4;
}

function stageFitHost(wrap: HTMLElement): HTMLElement {
  const viewport = wrap.closest<HTMLElement>(".btable-mobile__viewport");
  if (viewport) return viewport;
  const main = wrap.closest<HTMLElement>(".table-play-overlay__main");
  if (main) return main;
  const session = wrap.closest<HTMLElement>(".btable-session");
  return session ?? wrap;
}

/** Mobile-only contain-fit — separate from desktop `useStageFit`. */
export function useMobileStageFit({ aspect, sessionKey }: UseMobileStageFitOptions) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const heroPeakRef = useRef(0);
  const chromePeakRef = useRef(0);
  const sessionKeyRef = useRef(sessionKey);
  const layoutMode = useTableLayoutMode();
  const { settings } = useTableTheme();
  const portrait = layoutMode === "mobile-portrait";

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (sessionKeyRef.current !== sessionKey) {
      sessionKeyRef.current = sessionKey;
      heroPeakRef.current = 0;
      chromePeakRef.current = 0;
    }

    const visualViewport = window.visualViewport;

    const apply = () => {
      const host = stageFitHost(wrap);
      const hostRect = host.getBoundingClientRect();
      const hero = wrap.querySelector<HTMLElement>(".btable-mobile-hero-dock");
      const heroRect = hero?.getBoundingClientRect();
      const inOverlay = Boolean(wrap.closest(".table-play-overlay"));

      const heroFloor = portrait ? 104 : 92;
      const heroCap = portrait ? 210 : 168;
      const measuredHero = heroRect?.height ?? 0;
      const stableHero = resolveHeroBudget(
        measuredHero,
        heroPeakRef.current,
        heroFloor,
        heroCap,
      );
      heroPeakRef.current = stableHero.peak;
      const heroMinHeight = stableHero.height;

      const playerCount = parseInt(
        getComputedStyle(wrap).getPropertyValue("--player-count").trim(),
        10,
      ) || 4;
      const lowCount = playerCount <= 4;
      const landscapeRow = !portrait;

      const padX =
        (landscapeRow && lowCount
          ? readSafePx("--mobile-fit-pad-x", 4)
          : readSafePx("--mobile-fit-pad-x", 8)) + (landscapeRow && inOverlay ? 4 : 12);
      const padY =
        (landscapeRow && lowCount
          ? readSafePx("--mobile-fit-pad-y", 2)
          : readSafePx("--mobile-fit-pad-y", 6)) + (landscapeRow && inOverlay ? 4 : 10);
      const gap = readSafePx("--mobile-fit-gap", portrait ? 8 : 6);

      const vv = visualViewport;
      const availWidth = Math.min(hostRect.width, vv?.width ?? window.innerWidth);
      let availHeight = Math.min(hostRect.height, vv?.height ?? window.innerHeight);

      if (inOverlay) {
        const measuredChrome = measureMobileChromePx(wrap);
        const stableChrome = resolveSessionChromeBudget(
          measuredChrome,
          chromePeakRef.current,
          SESSION_CHROME_FLOOR_PX,
        );
        chromePeakRef.current = stableChrome.peak;
        availHeight = Math.max(140, availHeight - stableChrome.height);
      }

      const userScale = Math.max(0.85, Math.min(1.35, settings.tableScale || 1));

      const fit = landscapeRow
        ? {
            ...computeMobileLandscapeOverlayFit({
              availWidth,
              availHeight,
              aspect,
              userScale: 1,
              padX,
              padY,
              stageShare: landscapeStageShareForPlayers(playerCount),
            }),
            stageWidth: 0,
            stageHeight: 0,
          }
        : computeStageFit({
            availWidth,
            availHeight,
            aspect,
            userScale: 1,
            padX,
            padY,
            heroMinHeight,
            gap,
          });

      const maxW = Math.max(0, availWidth - padX * 2);
      const maxStageH = landscapeRow
        ? Math.max(0, availHeight - padY * 2)
        : Math.max(120, availHeight - padY * 2 - heroMinHeight - gap);
      const layoutWidth = Math.min(fit.displayStageWidth * userScale, maxW);
      const layoutHeight = Math.min(fit.displayStageHeight * userScale, maxStageH);

      wrap.classList.toggle("btable-mobile-wrap--landscape-row", landscapeRow);
      wrap.classList.toggle("btable-mobile-wrap--low-count", lowCount);
      wrap.dataset.layout = portrait ? "portrait" : "landscape";

      wrap.style.setProperty("--stage-fit-width", `${Math.round(layoutWidth)}px`);
      wrap.style.setProperty("--stage-fit-height", `${Math.round(layoutHeight)}px`);
      wrap.style.setProperty("--stage-fit-scale", String(fit.fitScale));
      wrap.style.setProperty("--stage-effective-scale", "1");
    };

    let rafId: number | null = null;
    const scheduleApply = () => {
      if (isDealPresentationActive() || isTrickCollectionActive()) return;
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        apply();
      });
    };

    const ro = new ResizeObserver(scheduleApply);
    const hero = wrap.querySelector<HTMLElement>(".btable-mobile-hero-dock");
    if (hero) ro.observe(hero);
    const host = stageFitHost(wrap);
    if (host instanceof HTMLElement) ro.observe(host);
    scheduleApply();
    const onViewportChange = () => scheduleApply();
    window.addEventListener("orientationchange", onViewportChange);
    visualViewport?.addEventListener("resize", onViewportChange);
    visualViewport?.addEventListener("scroll", onViewportChange);
    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("orientationchange", onViewportChange);
      visualViewport?.removeEventListener("resize", onViewportChange);
      visualViewport?.removeEventListener("scroll", onViewportChange);
    };
  }, [aspect, layoutMode, portrait, sessionKey, settings.tableScale]);

  return wrapRef;
}
