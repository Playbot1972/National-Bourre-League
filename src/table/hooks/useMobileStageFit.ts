import { useLayoutEffect, useRef } from "react";
import {
  computeMobileLandscapeOverlayFit,
  computeStageFit,
  landscapeStageShareForPlayers,
  stabilizeHeroHeight,
} from "../stageFit";
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
  const mobileShell = session.querySelector<HTMLElement>(".btable-mobile");
  if (!mobileShell) return 0;
  const sessionRect = session.getBoundingClientRect();
  const shellRect = mobileShell.getBoundingClientRect();
  const above = Math.max(0, shellRect.top - sessionRect.top);
  const below = Math.max(0, sessionRect.bottom - shellRect.bottom);
  return above + below;
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
      const stableHero = stabilizeHeroHeight(measuredHero, heroPeakRef.current, heroFloor);
      heroPeakRef.current = stableHero.peak;
      const heroMinHeight = Math.min(
        measuredHero > 0 ? Math.max(measuredHero, heroFloor) : stableHero.height,
        heroCap,
      );

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
        const chrome = measureMobileChromePx(wrap);
        availHeight = Math.max(140, availHeight - chrome);
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

    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    const hero = wrap.querySelector<HTMLElement>(".btable-mobile-hero-dock");
    if (hero) ro.observe(hero);
    const host = stageFitHost(wrap);
    if (host instanceof HTMLElement) ro.observe(host);
    const session = wrap.closest(".btable-session");
    if (session instanceof HTMLElement) {
      ro.observe(session);
      const head = session.querySelector(".btable-session__head");
      if (head instanceof HTMLElement) ro.observe(head);
      const feedback = session.querySelector(".btable-session__feedback");
      if (feedback instanceof HTMLElement) ro.observe(feedback);
    }
    apply();
    window.addEventListener("orientationchange", apply);
    visualViewport?.addEventListener("resize", apply);
    visualViewport?.addEventListener("scroll", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", apply);
      visualViewport?.removeEventListener("resize", apply);
      visualViewport?.removeEventListener("scroll", apply);
    };
  }, [aspect, layoutMode, portrait, sessionKey, settings.tableScale]);

  return wrapRef;
}
