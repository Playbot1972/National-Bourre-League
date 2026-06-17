import { useLayoutEffect, useRef } from "react";
import { computeStageFit, isWithinViewport, rectFromDomRect, stabilizeHeroHeight, STAGE_SEAT_OVERFLOW_PAD } from "../stageFit";
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

export function useStageFit({ aspect, enabled = true, sessionKey }: UseStageFitOptions) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const heroPeakRef = useRef(0);
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
    }

    const viewport =
      wrap.closest(".btable-desktop__viewport") ??
      wrap.closest(".table-play-overlay__main") ??
      wrap.closest(".btable-session");

    const apply = () => {
      const host = viewport instanceof HTMLElement ? viewport : wrap;
      const hostRect = host.getBoundingClientRect();
      const hero = wrap.querySelector<HTMLElement>(".hand-panel");
      const heroRect = hero?.getBoundingClientRect();
      const heroFloor = nativeMobile ? 132 : 148;
      const heroCap = nativeMobile ? 220 : 280;
      const measuredHero = heroRect?.height ?? 0;
      const stableHero = stabilizeHeroHeight(measuredHero, heroPeakRef.current, heroFloor);
      heroPeakRef.current = stableHero.peak;
      const heroMinHeight = Math.min(stableHero.height, heroCap);

      const padX = readSafePx("--stage-fit-pad-x", nativeMobile ? 10 : 16) + STAGE_SEAT_OVERFLOW_PAD;
      const padY = readSafePx("--stage-fit-pad-y", nativeMobile ? 8 : 12) + STAGE_SEAT_OVERFLOW_PAD;
      const gap = readSafePx("--stage-fit-gap", 12);

      const vv = window.visualViewport;
      const availWidth = Math.min(hostRect.width, vv?.width ?? window.innerWidth);
      const availHeight = Math.min(hostRect.height, vv?.height ?? window.innerHeight);

      const userScale = nativeMobile ? 1 : settings.tableScale;
      const fit = computeStageFit({
        availWidth,
        availHeight,
        aspect,
        userScale,
        padX,
        padY,
        heroMinHeight,
        gap,
      });

      wrap.style.setProperty("--stage-fit-width", `${Math.round(fit.stageWidth)}px`);
      wrap.style.setProperty("--stage-fit-height", `${Math.round(fit.stageHeight)}px`);
      wrap.style.setProperty("--stage-fit-scale", String(fit.fitScale));
      wrap.style.setProperty("--stage-effective-scale", String(fit.effectiveScale));

      const scaleTarget =
        wrap.closest<HTMLElement>(".btable-desktop__scale") ?? wrap.parentElement;
      scaleTarget?.style.setProperty("--stage-effective-scale", String(fit.effectiveScale));

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
        });
      }
    };

    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    const hero = wrap.querySelector<HTMLElement>(".hand-panel");
    if (hero) ro.observe(hero);
    if (viewport instanceof HTMLElement) ro.observe(viewport);
    apply();
    window.addEventListener("orientationchange", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", apply);
    };
  }, [aspect, enabled, nativeMobile, sessionKey, settings.tableScale]);

  return wrapRef;
}
