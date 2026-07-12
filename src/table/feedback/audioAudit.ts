/** Dev-only table audio diagnostics — enable with localStorage `nbl-table-audio-debug=1`. */

import type { SoundEventKey } from "./soundPacks";

export type TableAudioFallbackReason =
  | "no-asset"
  | "audio-locked"
  | "probe-failed"
  | "bad-content-type"
  | "preload-failed"
  | "play-rejected"
  | "media-error"
  | "procedural-only"
  | "deduped"
  | "skipped-muted";

export type AudioAuditTriggerType = "action" | "animation" | "outcome";

export type AudioAuditResult =
  | "asset-played"
  | "procedural-fallback"
  | "procedural-only"
  | "asset-preload-failed"
  | "asset-play-rejected"
  | "asset-network-error"
  | "bad-content-type"
  | "no-asset"
  | "skipped-muted"
  | "deduped";

export interface AudioAuditRecord {
  triggerType: AudioAuditTriggerType;
  action?: string;
  source?: string;
  /** Canonical event key (e.g. cardSelect, draw). */
  event: SoundEventKey;
  result: AudioAuditResult;
  /** Resolved on-disk filename before play (from registry). */
  resolvedFile?: string;
  /** Filename actually played when result is asset-played. */
  filename?: string;
  url?: string;
  assetId?: string;
  /** True when procedural Web Audio played instead of a hosted WAV. */
  usedFallback?: boolean;
  fallbackReason?: string;
  tier?: number;
  variant?: string;
  timestamp: number;
}

const MAX_AUDIT_RECORDS = 300;

export interface AudioPlayMonitorRecord {
  src: string;
  filename?: string;
  volume?: number;
  timestamp: number;
}

declare global {
  interface Window {
    __nblTableAudioAudit?: AudioAuditRecord[];
    __nblAudioPlayMonitor?: AudioPlayMonitorRecord[];
    resetTableAudioAudit?: () => void;
    getTableAudioAudit?: () => AudioAuditRecord[];
    printTableAudioAuditSummary?: () => void;
    resetAudioPlayMonitor?: () => void;
    getAudioPlayMonitor?: () => AudioPlayMonitorRecord[];
  }
}

export function isTableAudioDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem("nbl-table-audio-debug") === "1") return true;
  } catch {
    /* private mode */
  }
  return Boolean(import.meta.env?.DEV);
}

export function logTableAudio(
  message: string,
  detail?: Record<string, unknown>,
): void {
  if (!isTableAudioDebugEnabled()) return;
  if (detail) {
    console.info("[table-audio]", message, detail);
  } else {
    console.info("[table-audio]", message);
  }
}

function auditBuffer(): AudioAuditRecord[] {
  if (typeof window === "undefined") return [];
  if (!window.__nblTableAudioAudit) {
    window.__nblTableAudioAudit = [];
  }
  return window.__nblTableAudioAudit;
}

export function filenameFromAudioUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const pathname = new URL(url, "http://local").pathname;
    const base = pathname.split("/").pop();
    return base || undefined;
  } catch {
    const parts = url.split("/");
    return parts[parts.length - 1] || undefined;
  }
}

/** Whether an audit row indicates procedural/placeholder audio was used. */
export function isProceduralAuditResult(result: AudioAuditResult): boolean {
  return result === "procedural-fallback" || result === "procedural-only";
}

export function recordTableAudioAudit(record: Omit<AudioAuditRecord, "timestamp">): void {
  if (typeof window === "undefined") return;
  const entry: AudioAuditRecord = {
    ...record,
    filename: record.filename ?? filenameFromAudioUrl(record.url),
    resolvedFile: record.resolvedFile ?? record.filename ?? filenameFromAudioUrl(record.url),
    usedFallback:
      record.usedFallback ??
      (record.result != null && isProceduralAuditResult(record.result)),
    timestamp: Date.now(),
  };
  const buf = auditBuffer();
  buf.push(entry);
  if (buf.length > MAX_AUDIT_RECORDS) {
    buf.splice(0, buf.length - MAX_AUDIT_RECORDS);
  }
  logTableAudio("audit", entry as unknown as Record<string, unknown>);
}

export function resetTableAudioAudit(): void {
  if (typeof window === "undefined") return;
  window.__nblTableAudioAudit = [];
  logTableAudio("audit-reset");
}

export function getTableAudioAudit(): AudioAuditRecord[] {
  return [...auditBuffer()];
}

export interface AudioAuditSummaryGroup {
  action?: string;
  source?: string;
  triggerType: AudioAuditTriggerType;
  event: SoundEventKey;
  results: Record<string, number>;
  filenames: string[];
  count: number;
}

export function summarizeTableAudioAudit(
  records: AudioAuditRecord[] = getTableAudioAudit(),
): AudioAuditSummaryGroup[] {
  const groups = new Map<string, AudioAuditSummaryGroup>();

  for (const row of records) {
    const key = [
      row.action ?? row.source ?? row.event,
      row.triggerType,
      row.event,
    ].join("|");
    let group = groups.get(key);
    if (!group) {
      group = {
        action: row.action ?? row.source,
        source: row.source,
        triggerType: row.triggerType,
        event: row.event,
        results: {},
        filenames: [],
        count: 0,
      };
      groups.set(key, group);
    }
    group.count += 1;
    group.results[row.result] = (group.results[row.result] ?? 0) + 1;
    if (row.filename && !group.filenames.includes(row.filename)) {
      group.filenames.push(row.filename);
    }
  }

  return [...groups.values()];
}

export function printTableAudioAuditSummary(): void {
  if (typeof window === "undefined") return;
  const groups = summarizeTableAudioAudit();
  if (!groups.length) {
    console.info("[table-audio] audit summary: (empty)");
    return;
  }
  console.info("[table-audio] audit summary:");
  for (const g of groups) {
    const label = g.action ?? g.event;
    const resultParts = Object.entries(g.results)
      .map(([k, n]) => `${k} x${n}`)
      .join(", ");
    const files = g.filenames.length ? g.filenames.join(", ") : "(none)";
    console.info(
      `  ${label}\n    triggerType: ${g.triggerType}\n    event: ${g.event}\n    results: ${resultParts}\n    filenames: ${files}`,
    );
  }
}

/** Install DevTools helpers on window (idempotent). */
export function recordAudioPlayMonitor(record: Omit<AudioPlayMonitorRecord, "timestamp">): void {
  if (typeof window === "undefined") return;
  if (!window.__nblAudioPlayMonitor) {
    window.__nblAudioPlayMonitor = [];
  }
  window.__nblAudioPlayMonitor.push({
    ...record,
    filename: record.filename ?? filenameFromAudioUrl(record.src),
    timestamp: Date.now(),
  });
}

export function resetAudioPlayMonitor(): void {
  if (typeof window === "undefined") return;
  window.__nblAudioPlayMonitor = [];
}

export function getAudioPlayMonitor(): AudioPlayMonitorRecord[] {
  if (typeof window === "undefined") return [];
  return [...(window.__nblAudioPlayMonitor ?? [])];
}

export function installTableAudioAuditHelpers(): void {
  if (typeof window === "undefined") return;
  window.resetTableAudioAudit = resetTableAudioAudit;
  window.getTableAudioAudit = getTableAudioAudit;
  window.printTableAudioAuditSummary = printTableAudioAuditSummary;
  window.resetAudioPlayMonitor = resetAudioPlayMonitor;
  window.getAudioPlayMonitor = getAudioPlayMonitor;
}
