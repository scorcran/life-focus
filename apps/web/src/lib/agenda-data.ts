/**
 * Host-side agenda loader for `/today` (Story 1.5).
 *
 * This is host glue (AD-1): it may import the injected stores + the broker. It
 *  1. reads EACH context separately via `mirror.readMirrorEvents(context)` — the
 *     work/personal separation is structural, never a combined query (SEC-1);
 *  2. emits `checkCrossContextOutput(ledger, ctx, 'joint', {isPlanningArtifact})`
 *     for every context that CONTRIBUTES to the joint view, so a real
 *     `CrossContextAccessAudited` audit row is appended per context (AC-14);
 *  3. merges the already-separated lists and delegates all ordering/formatting to
 *     the PURE `shapeAgenda` (no time math or I/O here);
 *  4. also returns `listSources()` for the per-source sync disclosure.
 *
 * A direct `work`→`personal` output is NEVER requested (it would be blocked). The
 * combined agenda is a planning-layer artifact, so each context is *output into*
 * `'joint'`.
 */
import { checkCrossContextOutput } from '@life-focus/broker';
import type { LedgerStore } from '@life-focus/ledger';
import type { MirrorStore, SourceRecord } from '@life-focus/db';
import { shapeAgenda, type AgendaSourceEvent, type AgendaView } from './agenda.js';

/** The two source contexts whose events compose the joint agenda (AD-5). */
const SOURCE_CONTEXTS = ['work', 'personal'] as const;

export interface AgendaStores {
  readonly mirror: MirrorStore;
  readonly ledger: LedgerStore;
}

export interface LoadAgendaOptions {
  /** The instant "now" — its local date (in `timeZone`) is "today". */
  readonly now: Date;
  /** IANA time zone for local rendering + today-filtering. */
  readonly timeZone: string;
}

export interface LoadedAgenda extends AgendaView {
  /** Connected sources for the per-source last-sync disclosure. */
  readonly sources: readonly SourceRecord[];
}

/**
 * Load today's joint agenda + the connected sources.
 *
 * Reads each context separately (SEC-1), audits each contributing context's
 * output into the joint view (AC-14), merges, then shapes.
 */
export async function loadAgenda(
  stores: AgendaStores,
  options: LoadAgendaOptions,
): Promise<LoadedAgenda> {
  const { mirror, ledger } = stores;

  const merged: AgendaSourceEvent[] = [];

  for (const context of SOURCE_CONTEXTS) {
    // SEC-1: each context is fetched by its OWN read; the view merges
    // already-separated lists (never a combined cross-context query).
    const events = await mirror.readMirrorEvents(context);

    if (events.length > 0) {
      // AC-14: this context contributes to the joint planning artifact, so its
      // output into 'joint' is audited (allowed + a CrossContextAccessAudited row).
      await checkCrossContextOutput(ledger, context, 'joint', { isPlanningArtifact: true });
    }

    for (const ev of events) {
      merged.push({
        externalId: ev.externalId,
        context,
        summary: ev.summary,
        startsAt: ev.startsAt,
        endsAt: ev.endsAt,
        allDay: ev.allDay,
      });
    }
  }

  const sources = await mirror.listSources();
  const view = shapeAgenda(merged, { timeZone: options.timeZone, now: options.now });

  return { items: view.items, sources };
}
