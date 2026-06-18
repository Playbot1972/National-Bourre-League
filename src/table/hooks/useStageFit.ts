import { useLayoutEffect, useRef } from "react";
import {
  computeStageFit,
  computeMobileLandscapeOverlayFit,
  isWithinViewport,
  rectFromDomRect,
  stabilizeHeroHeight,
  STAGE_SEAT_OVERFLOW_PAD,
  tableAspectForMobileViewport,
} from "../stageFit";
import { useTableTheme } from "../theme/useTableTheme";
import { useMobileTable } from "../useMobileTable";

interface UseStageFitOptions {
  aspect: number;
  enabled?: boolean;
  /** Resets hero peak budget when the hand changes. */
  sessionKey?: string;
}

function readSafePx(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const root = document.documentElement;
  const raw = getComputedStyle(root).getPropertyValue(name).trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Session chrome = everything in `.btable-session` outside the table shell (head, feedback, footer, …). */
function measureSessionChromePx(wrap: HTMLElement, nativeMobile: boolean): number {
  const session = wrap.closest<HTMLElement>(".btable-session");
  if (!session) return 0;

  const tableShell = session.querySelector<HTMLElement>(".btable-desktop");
  if (tableShell) {
    const sessionRect = session.getBoundingClientRect();
    const shellRect = tableShell.getBoundingClientRect();
    const extra = nativeMobile ? 4 : 0;
    return Math.max(0, sessionRect.height - shellRect.height) + extra;
  }

  let chrome = 0;
  const head = session.querySelector<HTMLElement>(".btable-session__head");
  const foot = session.querySelector<HTMLElement>(".btable-session__foot");
  const settle = session.querySelector<HTMLElement>(".btable-session__settle");
  const feedback = session.querySelector<HTMLElement>(".btable-session__feedback");
  if (feedback && feedback.offsetParent !== null) {
    chrome += feedback.getBoundingClientRect().height;
  }
  if (head) chrome += head.getBoundingClientRect().height;
  if (foot && foot.offsetParent !== null) chrome += foot.getBoundingClientRect().height;
  if (settle && settle.offsetParent !== null) chrome += settle.getBoundingClientRect().height;
  if (nativeMobile) chrome += 4;
  return chrome;
}

function stageFitHost(wrap: HTMLElement, nativeMobile: boolean): HTMLElement {
  const inOverlay = Boolean(wrap.closest(".table-play-overlay"));
  if (nativeMobile && inOverlay) {
    const main = wrap.closest<HTMLElement>(".table-play-overlay__main");
    if (main) return main;
  }
  const viewport = wrap.closest<HTMLElement>(".btable-desktop__viewport");
  if (viewport) return viewport;
  const main = wrap.closest<HTMLElement>(".table-play-overlay__main");
  if (main) return main;
  const session = wrap.closest<HTMLElement>(".btable-session");
  return session ?? wrap;
}

export function useStageFit({ aspect, enabled = true, sessionKey }: UseStageFitOptions) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const heroPeakRef = useRef(0);
  const chromePeakRef = useRef(0);
  const sessionKeyRef = useRef(sessionKey);
  const { settings } = useTableTheme();
  const nativeMobile = useMobileTable();

  useLayoutEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const wrap = wrapRef.current;
    if (!wrap) return;

    if (sessionKeyRef.current !== sessionKey) {
      sessionKeyRef.current = sessionKey;
      heroPeakRef.current = 0;
      chromePeakRef.current = 0;
    }

    const viewport =
      wrap.closest(".btable-desktop__viewport") ??
      wrap.closest(".table-play-overlay__main") ??
      wrap.closest(".btable-session");

    const visualViewport = window.visualViewport;

    const apply = () => {
      const inOverlay = Boolean(wrap.closest(".table-play-overlay"));
      const portrait =
        typeof window !== "undefined" &&
        window.matchMedia("(orientation: portrait)").matches;
      const host = stageFitHost(wrap, nativeMobile);
      const hostRect = host.getBoundingClientRect();
      const hero = wrap.querySelector<HTMLElement>(".hand-panel");
      const heroRect = hero?.getBoundingClientRect();
      const heroFloor =
        inOverlay && nativeMobile && portrait
          ? 100
          : inOverlay && !nativeMobile
            ? 120
            : nativeMobile
              ? 112
              : 148;
      const heroCap =
        inOverlay && nativeMobile && portrait
          ? 200
          : inOverlay && !nativeMobile
            ? 200
            : nativeMobile
              ? 210
              : 280;
      const measuredHero = heroRect?.height ?? 0;
      const stableHero = stabilizeHeroHeight(measuredHero, heroPeakRef.current, heroFloor);
      heroPeakRef.current = stableHero.peak;
      const heroMinHeight =
        inOverlay && nativeMobile && measuredHero > 0
          ? Math.min(Math.max(measuredHero, heroFloor), heroCap)
          : Math.min(stableHero.height, heroCap);

      const overflowPad = nativeMobile ? 22 : inOverlay && !nativeMobile ? 16 : STAGE_SEAT_OVERFLOW_PAD;
      const padX = readSafePx("--stage-fit-pad-x", nativeMobile ? 8 : 16) + overflowPad;
      const padY = readSafePx("--stage-fit-pad-y", nativeMobile ? 6 : 12) + overflowPad;
      const gap = readSafePx("--stage-fit-gap", nativeMobile ? 8 : 12);

      const vv = visualViewport;
      const availWidth = Math.min(hostRect.width, vv?.width ?? window.innerWidth);
      let availHeight = Math.min(hostRect.height, vv?.height ?? window.innerHeight);
      if (inOverlay && nativeMobile) {
        const measuredChrome = measureSessionChromePx(wrap, nativeMobile);
        chromePeakRef.current = Math.max(chromePeakRef.current, measuredChrome);
        availHeight = Math.max(160, availHeight - chromePeakRef.current);
      }

      const userScale = Math.max(0.85, Math.min(1.35, settings.tableScale || 1));
      const fitAspect = nativeMobile
        ? tableAspectForMobileViewport(aspect, { portrait })
        : aspect;

      const landscapeRow = inOverlay && nativeMobile && !portrait;
      const fit = landscapeRow
        ? {
            ...computeMobileLandscapeOverlayFit({
              availWidth,
              availHeight,
              aspect: fitAspect,
              userScale,
              padX,
              padY,
            }),
            stageWidth: 0,
            stageHeight: 0,
          }
        : computeStageFit({
            availWidth,
            availHeight,
            aspect: fitAspect,
            userScale,
            padX,
            padY,
            heroMinHeight,
            gap,
          });

      wrap.classList.toggle("btable-wrap--landscape-row", landscapeRow);

      const useContainPixels = nativeMobile || inOverlay;
      const layoutWidth = useContainPixels ? fit.displayStageWidth : fit.stageWidth;
      const layoutHeight = useContainPixels ? fit.displayStageHeight : fit.stageHeight;
      const transformScale =
        inOverlay && !nativeMobile
          ? userScale
          : nativeMobile
            ? 1
            : fit.effectiveScale;

      wrap.style.setProperty("--stage-fit-width", `${Math.round(layoutWidth)}px`);
      wrap.style.setProperty("--stage-fit-height", `${Math.round(layoutHeight)}px`);
      wrap.style.setProperty("--stage-fit-scale", String(fit.fitScale));
      wrap.style.setProperty("--stage-effective-scale", String(transformScale));

      const scaleTarget =
        wrap.closest<HTMLElement>(".btable-desktop__scale") ?? wrap.parentElement;
      scaleTarget?.style.setProperty("--stage-effective-scale", String(transformScale));

      if (localStorage.getItem("stageFitDebug") === "1") {
        const stage = wrap.querySelector<HTMLElement>(".table-stage");
        const seats = wrap.querySelectorAll<HTMLElement>(".bseat__avatar-wrap");
        const stageBounds = stage ? rectFromDomRect(stage.getBoundingClientRect()) : null;
        const viewportBounds = rectFromDomRect(document.documentElement.getBoundingClientRect());
        const seatOverflow = [...seats].filter((seat) => {
          const r = rectFromDomRect(seat.getBoundingClientRect());
          return !isWithinViewport(r, viewportBounds, 1);
        }).length;
        console.debug("[stage-fit]", {
          host: { w: hostRect.width, h: hostRect.height },
          hero: { measured: measuredHero, budget: heroMinHeight, peak: heroPeakRef.current },
          fit,
          stageBounds,
          seatOverflow,
          nativeMobile,
          inOverlay,
          portrait,
        });
      }
    };

    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    const hero = wrap.querySelector<HTMLElement>(".hand-panel");
    if (hero) ro.observe(hero);
    if (viewport instanceof HTMLElement) ro.observe(viewport);
    const session = wrap.closest(".btable-session");
    if (session instanceof HTMLElement) {
      ro.observe(session);
      const feedback = session.querySelector(".btable-session__feedback");
      if (feedback instanceof HTMLElement) ro.observe(feedback);
      const head = session.querySelector(".btable-session__head");
      if (head instanceof HTMLElement) ro.observe(head);
    }
    const main = wrap.closest(".table-play-overlay__main");
    if (main instanceof HTMLElement) ro.observe(main);
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
  }, [aspect, enabled, nativeMobile, sessionKey, settings.tableScale]);

  return wrapRef;
}
