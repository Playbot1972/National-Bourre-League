import { useEffect, useState } from "react";
import { useMobileTable } from "../useMobileTable";

export type TableLayoutMode = "desktop" | "mobile-portrait" | "mobile-landscape";

const PORTRAIT_MEDIA = "(orientation: portrait)";

export function useTableLayoutMode(): TableLayoutMode {
  const nativeMobile = useMobileTable();
  const [portrait, setPortrait] = useState(
    () => typeof window !== "undefined" && window.matchMedia(PORTRAIT_MEDIA).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(PORTRAIT_MEDIA);
    const sync = () => setPortrait(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!nativeMobile) return "desktop";
  return portrait ? "mobile-portrait" : "mobile-landscape";
}
