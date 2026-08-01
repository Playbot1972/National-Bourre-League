import { useEffect, useRef, useState } from "react";
import { isCardsDealtPhase } from "../handUi";

export type PlayNowModeBannerPhase = "pending" | "flashing" | "fading" | "done";

const FLASH_MS = 1800;
const FADE_MS = 400;

export function shouldStartPlayNowModeBanner(input: {
  playNowModeLabel?: string;
  watchOnly?: boolean;
  handNumber: number;
  phase: string | null | undefined;
  currentPhase: PlayNowModeBannerPhase;
}): boolean {
  if (!input.playNowModeLabel || input.watchOnly) return false;
  if (input.currentPhase !== "pending") return false;
  if (input.handNumber > 1) return false;
  return input.handNumber === 1 && isCardsDealtPhase(input.phase);
}

export function usePlayNowModeBannerIntro(options: {
  sessionId: string;
  handNumber: number;
  phase: string | null | undefined;
  playNowModeLabel?: string;
  watchOnly?: boolean;
}) {
  const [phase, setPhase] = useState<PlayNowModeBannerPhase>("pending");
  const trackedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!options.playNowModeLabel || options.watchOnly) {
      setPhase("done");
      return;
    }

    if (trackedSessionRef.current !== options.sessionId) {
      trackedSessionRef.current = options.sessionId;
      setPhase("pending");
    }
  }, [options.playNowModeLabel, options.watchOnly, options.sessionId]);

  useEffect(() => {
    if (phase === "done") return;
    if (options.handNumber > 1) {
      setPhase("done");
      return;
    }
    if (
      shouldStartPlayNowModeBanner({
        playNowModeLabel: options.playNowModeLabel,
        watchOnly: options.watchOnly,
        handNumber: options.handNumber,
        phase: options.phase,
        currentPhase: phase,
      })
    ) {
      setPhase("flashing");
    }
  }, [
    options.handNumber,
    options.phase,
    options.playNowModeLabel,
    options.watchOnly,
    phase,
  ]);

  useEffect(() => {
    if (phase !== "flashing") return;
    const timer = window.setTimeout(() => setPhase("fading"), FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fading") return;
    const timer = window.setTimeout(() => setPhase("done"), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const visible = phase === "flashing" || phase === "fading";

  return {
    visible,
    className: [
      "btable-session__mode-banner",
      phase === "flashing" ? "btable-session__mode-banner--intro" : "",
      phase === "fading" ? "btable-session__mode-banner--faded" : "",
    ]
      .filter(Boolean)
      .join(" "),
  };
}
