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

export type AudioAuditTriggerType = "action" | "animation" | "procedural-only";

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
  event: SoundEventKey;
  result: AudioAuditResult;
  filename?: string;
  url?: string;
  fallbackReason?: string;
  tier?: number;
  variant?: string;
  timestamp: number;
}

const MAX_AUDIT_RECORDS = 300;

declare global {
  interface Window {
    __nblTableAudioAudit?: AudioAuditRecord[];
    resetTableAudioAudit?: () => void;
    getTableAudioAudit?: () => AudioAuditRecord[];
    printTableAudioAuditSummary?: () => void;
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

/** Extract basename from a resolved asset URL for audit output. */
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

export function recordTableAudioAudit(record: Omit<AudioAuditRecord, "timestamp">): void {
  if (typeof window === "undefined") return;
  const entry: AudioAuditRecord = {
    ...record,
    filename: record.filename ?? filenameFromAudioUrl(record.url),
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
export function installTableAudioAuditHelpers(): void {
  if (typeof window === "undefined") return;
  window.resetTableAudioAudit = resetTableAudioAudit;
  window.getTableAudioAudit = getTableAudioAudit;
  window.printTableAudioAuditSummary = printTableAudioAuditSummary;
}
