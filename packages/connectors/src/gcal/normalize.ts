/**
 * PURE normalization of Google Calendar events → MirrorEvent (Story 1.4, ADD-2).
 *
 * No I/O, no imports of db/host/http — this is the ADD-2 seam, tested as
 * ordinary unit tests without network or Docker. We request `singleEvents=true`
 * upstream so Google expands recurrences into instances; this module handles:
 *  - all-day (`start.date`) vs timed (`start.dateTime` + offset → UTC);
 *  - recurring-instance identity (`recurringEventId`);
 *  - cancellations (`status:'cancelled'` → removal signal).
 */
import type { EventContext } from '@life-focus/ledger';
import type { MirrorEvent, CancelledEvent } from './types.js';

/** A Google Calendar event date/time (one of `date` OR `dateTime` is present). */
export interface GoogleEventDateTime {
  readonly date?: string; // 'YYYY-MM-DD' for all-day
  readonly dateTime?: string; // RFC3339 with offset for timed
  readonly timeZone?: string;
}

/** The subset of a Google Calendar event we read (no bodies/attendees, NFR-6). */
export interface GoogleEvent {
  readonly id?: string;
  readonly status?: string;
  readonly summary?: string;
  readonly start?: GoogleEventDateTime;
  readonly end?: GoogleEventDateTime;
  readonly recurringEventId?: string;
  readonly updated?: string;
}

/**
 * Normalize one Google event.
 *  - Returns `{ cancelledExternalId }` for a cancelled instance (remove from mirror).
 *  - Returns `null` for an unusable event (no id, or no start/end bounds).
 *  - Returns a `MirrorEvent` otherwise.
 *
 * Timed events are converted to ISO-8601 UTC (DST-safe: the offset in the
 * dateTime string fully determines the instant, so `new Date(...).toISOString()`
 * yields the correct UTC moment across a DST transition). All-day events keep
 * their date-only bounds with `allDay=true` and no spurious timezone shift.
 */
export function normalizeEvent(
  event: GoogleEvent,
  opts: { context: EventContext },
): MirrorEvent | CancelledEvent | null {
  const externalId = event.id;
  if (typeof externalId !== 'string' || externalId.length === 0) {
    return null;
  }

  if (event.status === 'cancelled') {
    return { cancelledExternalId: externalId };
  }

  const start = normalizeBound(event.start);
  const end = normalizeBound(event.end);
  if (start === null || end === null) {
    // No usable time bounds — cannot place on a plan; skip.
    return null;
  }
  // All-day vs timed must be consistent across start/end; Google guarantees it,
  // but if they disagree treat as all-day only when BOTH are date-only.
  const allDay = start.allDay && end.allDay;

  return {
    externalId,
    context: opts.context,
    summary: typeof event.summary === 'string' ? event.summary : null,
    startsAt: start.value,
    endsAt: end.value,
    allDay,
    status: typeof event.status === 'string' ? event.status : 'confirmed',
    recurringEventId:
      typeof event.recurringEventId === 'string' ? event.recurringEventId : null,
    updatedAt: typeof event.updated === 'string' ? event.updated : null,
  };
}

interface NormalizedBound {
  readonly value: string;
  readonly allDay: boolean;
}

/**
 * Normalize one date/time bound.
 *  - `date` (all-day) → the date string unchanged (no tz shift), `allDay=true`.
 *  - `dateTime` (timed) → ISO-8601 UTC instant, `allDay=false`.
 *  - neither / unparseable → null.
 */
function normalizeBound(bound: GoogleEventDateTime | undefined): NormalizedBound | null {
  if (!bound) return null;
  if (typeof bound.date === 'string' && bound.date.length > 0) {
    // All-day: preserve the calendar date exactly; do NOT construct a Date
    // (which would apply the runner's tz and can shift the day).
    return { value: bound.date, allDay: true };
  }
  if (typeof bound.dateTime === 'string' && bound.dateTime.length > 0) {
    const ms = Date.parse(bound.dateTime);
    if (Number.isNaN(ms)) return null;
    return { value: new Date(ms).toISOString(), allDay: false };
  }
  return null;
}
