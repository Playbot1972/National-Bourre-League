import { useEffect, useState } from "react";

/** Touch-first phones — not a scaled-down desktop page. */
export const MOBILE_TABLE_MEDIA = "(max-width: 900px), ((hover: none) and (pointer: coarse))";

export function useMobileTable(): boolean {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_TABLE_MEDIA).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_TABLE_MEDIA);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return mobile;
}
