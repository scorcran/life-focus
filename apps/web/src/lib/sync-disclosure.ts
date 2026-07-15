/**
 * Per-source last-sync disclosure (Story 1.5).
 *
 * Extracted from `settings/connections/page.tsx` so the copy-sensitive degraded
 * voice lives in ONE place and every surface that shows sync health (the
 * connections screen AND the `/today` agenda) reuses it — they cannot diverge.
 *
 * Rules (EXPERIENCE.md + a11y floor):
 *  - Status is conveyed by ICON + TEXT, never color alone.
 *  - Degraded framing uses the "Last synced … — reconnect to keep this calendar
 *    current." voice. It NEVER says "Error" or "Sync failed" — in the visible
 *    text OR the screen-reader `label`.
 *
 * Pure formatting only — no I/O.
 */
import type { SourceRecord } from '@life-focus/db';

/** Format an ISO timestamp for the last-sync disclosure. */
export function formatSyncTime(iso: string | null): string {
  if (!iso) return 'not yet synced';
  const d = new Date(iso);
  // A malformed timestamp must never surface a raw "Invalid Date" to the user;
  // fall back to the same honest phrasing as a missing timestamp.
  if (Number.isNaN(d.getTime())) return 'not yet synced';
  return d.toLocaleString();
}

/** The rendered disclosure for a source: icon, screen-reader label, visible text. */
export interface SyncDisclosure {
  readonly icon: string;
  readonly label: string;
  readonly text: string;
}

/**
 * Sync disclosure per source. Status conveyed by ICON + TEXT (never color
 * alone; a11y floor). Degraded-state voice per EXPERIENCE.md — never "Error".
 */
export function syncDisclosure(source: SourceRecord): SyncDisclosure {
  if (source.status === 'revoked' || source.lastSyncStatus === 'failed') {
    // Degraded voice per EXPERIENCE.md: never "Error"/"Sync failed" — in the
    // visible text OR the screen-reader label (status by icon + text, a11y floor).
    return {
      icon: '⚠',
      label: `Needs reconnect — last synced ${formatSyncTime(source.lastSyncedAt)}`,
      text: `Last synced ${formatSyncTime(source.lastSyncedAt)} — reconnect to keep this calendar current.`,
    };
  }
  if (source.lastSyncStatus === 'ok') {
    return {
      icon: '✓',
      label: `Synced — last synced ${formatSyncTime(source.lastSyncedAt)}`,
      text: `Last synced ${formatSyncTime(source.lastSyncedAt)}.`,
    };
  }
  return {
    icon: '◷',
    label: 'Connected — awaiting first sync',
    text: 'Connected — awaiting first sync.',
  };
}
