import { useEffect, useState } from "react";
import { getTableAudioAudit, isTableAudioDebugEnabled, type AudioAuditRecord } from "./audioAudit";

const VISIBLE_ROWS = 20;

function formatRow(row: AudioAuditRecord): string {
  const file = row.filename ?? "—";
  const reason = row.fallbackReason ? ` (${row.fallbackReason})` : "";
  return `${row.event} → ${file} [${row.result}]${reason}`;
}

/** Last 20 audio audit rows — visible when `localStorage nbl-table-audio-debug=1`. */
export function SoundAuditPanel() {
  const [rows, setRows] = useState<AudioAuditRecord[]>([]);

  useEffect(() => {
    if (!isTableAudioDebugEnabled()) return;
    const refresh = () => setRows(getTableAudioAudit().slice(-VISIBLE_ROWS));
    refresh();
    const id = window.setInterval(refresh, 500);
    return () => window.clearInterval(id);
  }, []);

  if (!isTableAudioDebugEnabled()) return null;

  return (
    <div
      className="btable-sound-audit muted small"
      data-testid="sound-audit-panel"
      aria-live="polite"
    >
      <div className="btable-sound-audit__title">Audio audit (last {VISIBLE_ROWS})</div>
      <ol className="btable-sound-audit__list" reversed>
        {[...rows].reverse().map((row, idx) => (
          <li
            key={`${row.timestamp}-${row.event}-${idx}`}
            className={
              row.result === "asset-played"
                ? "btable-sound-audit__ok"
                : row.result.includes("procedural")
                  ? "btable-sound-audit__fallback"
                  : undefined
            }
          >
            {formatRow(row)}
          </li>
        ))}
      </ol>
    </div>
  );
}
