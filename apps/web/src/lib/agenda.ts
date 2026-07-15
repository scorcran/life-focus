/**
 * PURE agenda shaping for the read-only `/today` surface (Story 1.5, ADD-2).
 *
 * Turns the already-separated, already-merged list of mirror events into a
 * chronologically-ordered, today-filtered view model with DST-safe local time
 * strings and per-event context tags. It is the render-side seam:
 *
 *   - NO I/O. This module imports no `@life-focus/db`, host (`apps/*`), `pg`,
 *     `pg-boss`, or `next/*` — it receives plain data + `{ timeZone, now }` and
 *     returns a value (AD-1). All time math is via `Intl.DateTimeFormat` with the
 *     IANA `timeZone`; there is NO manual UTC-offset arithmetic (DST-safe).
 *
 * Mirror times are heterogeneous `text` (spec-1-4 contract):
 *   - all-day  → date-only `YYYY-MM-DD`, `allDay:true`, `endsAt` EXCLUSIVE
 *                (the first day NOT covered).
 *   - timed    → full UTC ISO (e.g. `2026-07-14T09:00:00.000Z`), `allDay:false`.
 */

/** The minimal event shape `shapeAgenda` needs (a structural subset of MirrorEvent). */
export interface AgendaSourceEvent {
  readonly externalId: string;
  readonly context: 'work' | 'personal';
  readonly summary: string | null;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly allDay: boolean;
}

/** One rendered agenda row. */
export interface AgendaItem {
  readonly externalId: string;
  readonly context: 'work' | 'personal';
  readonly title: string;
  readonly allDay: boolean;
  /** Local time label: `HH:MM AM/PM` for timed events, `All day` for all-day. */
  readonly timeLabel: string;
  /** Sort key — a comparable instant (ms since epoch). All-day sorts before timed. */
  readonly sortKey: number;
}

export interface ShapeAgendaOptions {
  /** IANA time zone for local rendering + today-filtering. */
  readonly timeZone: string;
  /** The instant "now" — its LOCAL date (in `timeZone`) is "today". */
  readonly now: Date;
}

export interface AgendaView {
  readonly items: readonly AgendaItem[];
}

/** Fallback title for an event with no summary (never blank; EXPERIENCE.md voice). */
const UNTITLED = 'Untitled event';

/** A well-formed date-only value `YYYY-MM-DD` (the all-day mirror-time shape). */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The local calendar date (`YYYY-MM-DD`) of an instant in `timeZone`.
 * `en-CA` formats as ISO `YYYY-MM-DD`, so no reassembly/offset math is needed.
 */
function localDate(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

/** Local `HH:MM AM/PM` label of a timed instant in `timeZone` (DST-safe via Intl). */
function localTimeLabel(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(instant);
}

/**
 * Add `days` to a `YYYY-MM-DD` date string, returning `YYYY-MM-DD`. Uses a
 * midday UTC anchor so the ±day step never crosses a boundary — this is pure
 * calendar arithmetic on a date-only value, independent of any zone/DST.
 */
function addDays(dateOnly: string, days: number): string {
  const anchor = new Date(`${dateOnly}T12:00:00.000Z`);
  // Defensive: a malformed date-only would make `.toISOString()` throw and take
  // the whole agenda down. Callers already skip non-`DATE_ONLY` all-day rows, so
  // this is belt-and-suspenders — return the input unchanged rather than throw.
  if (Number.isNaN(anchor.getTime())) return dateOnly;
  anchor.setUTCDate(anchor.getUTCDate() + days);
  return anchor.toISOString().slice(0, 10);
}

/**
 * Shape today's agenda from a merged, context-tagged event list.
 *
 * Filtering:
 *  - timed  → included iff its LOCAL date (in `timeZone`) equals today's local date.
 *  - all-day → included iff today's local date ∈ `[startsAt, endsAt)` (end EXCLUSIVE).
 *
 * Ordering: all-day events first (they have no clock time), then timed events by
 * their true instant. Ties break by title then externalId for stable output.
 */
export function shapeAgenda(
  events: readonly AgendaSourceEvent[],
  options: ShapeAgendaOptions,
): AgendaView {
  const { timeZone, now } = options;
  const today = localDate(now, timeZone);

  const items: AgendaItem[] = [];

  for (const ev of events) {
    const title = ev.summary && ev.summary.trim() !== '' ? ev.summary : UNTITLED;

    if (ev.allDay) {
      // All-day: date-only `YYYY-MM-DD`, end EXCLUSIVE. An all-day event with a
      // single-day span has endsAt = the day AFTER startsAt, so [start, end)
      // covers exactly the start day. Guard against a missing/degenerate end.
      const start = ev.startsAt.slice(0, 10);
      // Skip a malformed all-day date rather than let it crash the whole agenda
      // (the timed path already skips NaN instants — keep the two paths symmetric).
      if (!DATE_ONLY.test(start)) continue;
      const endRaw = ev.endsAt ? ev.endsAt.slice(0, 10) : '';
      const end = DATE_ONLY.test(endRaw) && endRaw > start ? endRaw : addDays(start, 1);
      if (today >= start && today < end) {
        items.push({
          externalId: ev.externalId,
          context: ev.context,
          title,
          allDay: true,
          timeLabel: 'All day',
          // Sort all-day rows before any timed row on the same day.
          sortKey: Number.NEGATIVE_INFINITY,
        });
      }
      continue;
    }

    // Timed: full UTC ISO → a real instant. Filter by LOCAL date (DST-safe).
    const instant = new Date(ev.startsAt);
    if (Number.isNaN(instant.getTime())) continue;
    if (localDate(instant, timeZone) !== today) continue;

    items.push({
      externalId: ev.externalId,
      context: ev.context,
      title,
      allDay: false,
      timeLabel: localTimeLabel(instant, timeZone),
      sortKey: instant.getTime(),
    });
  }

  items.sort((a, b) => {
    if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
    if (a.title !== b.title) return a.title < b.title ? -1 : 1;
    return a.externalId < b.externalId ? -1 : a.externalId > b.externalId ? 1 : 0;
  });

  return { items };
}

/**
 * The notice to show when the agenda list is empty. Three honest states — kept
 * distinct so a transient load failure is NEVER shown as "no calendars connected"
 * (that would be an actively false statement on the flagship trust surface):
 *  - `loadFailed` → degraded voice (EXPERIENCE.md): never "Error"/"Sync failed".
 *  - connected but nothing today → a plain, calm empty state.
 *  - nothing connected → the canonical cold-start invitation.
 */
export function agendaEmptyNotice(opts: {
  readonly loadFailed: boolean;
  readonly hasSources: boolean;
}): string {
  if (opts.loadFailed) {
    return 'Your calendar could not be loaded just now — recent events may be missing. Capture anything new manually.';
  }
  return opts.hasSources
    ? 'Nothing on your calendar today.'
    : 'Connect your calendars to generate your first plan. In the meantime, capture anything on your mind.';
}
