import type { ReactNode } from "react";
import { useTableTheme } from "./theme/useTableTheme";
import { useMobileTable } from "./useMobileTable";

interface DesktopLayoutShellProps {
  children: ReactNode;
}

/** Desktop-first scaling wrapper; tiled mode scaffolds future multi-table grids. */
export function DesktopLayoutShell({ children }: DesktopLayoutShellProps) {
  const { settings } = useTableTheme();
  const tiled = settings.layoutMode === "tiled";
  const nativeMobile = useMobileTable();

  return (
    <div
      className={[
        "btable-desktop",
        tiled ? "btable-desktop--tiled" : "btable-desktop--single",
        nativeMobile ? "btable-desktop--native-mobile" : "",
      ].join(" ")}
    >
      <div className="btable-desktop__viewport">
        <div className="btable-desktop__scale">{children}</div>
        {tiled && (
          <div className="btable-desktop__tile-placeholder muted small" aria-hidden="true">
            <span>Multi-room tile slot</span>
            <span>Monitor additional tables here in a future release</span>
          </div>
        )}
      </div>
    </div>
  );
}
