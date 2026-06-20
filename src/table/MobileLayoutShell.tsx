import type { ReactNode } from "react";
import { useTableLayoutMode } from "./layout/useTableLayoutMode";

interface MobileLayoutShellProps {
  children: ReactNode;
}

/** Dedicated mobile gameplay frame — separate from desktop `DesktopLayoutShell`. */
export function MobileLayoutShell({ children }: MobileLayoutShellProps) {
  const layoutMode = useTableLayoutMode();
  const orientation = layoutMode === "mobile-landscape" ? "landscape" : "portrait";

  return (
    <div
      className={[
        "btable-mobile",
        `btable-mobile--${orientation}`,
      ].join(" ")}
      data-layout-mode={layoutMode}
    >
      <div className="btable-mobile__viewport">
        <div className="btable-mobile__frame">
          <div className="btable-mobile__layout">{children}</div>
        </div>
      </div>
    </div>
  );
}
