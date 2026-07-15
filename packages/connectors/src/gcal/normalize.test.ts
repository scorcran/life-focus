import { describe, it, expect } from 'vitest';
import { normalizeEvent, type GoogleEvent } from './normalize.js';
import type { MirrorEvent, CancelledEvent } from './types.js';

function asMirror(r: MirrorEvent | CancelledEvent | null): MirrorEvent {
  if (r === null || 'cancelledExternalId' in r) {
    throw new Error('expected a MirrorEvent');
  }
  return r;
}

describe('normalizeEvent (ADD-2, pure — no network/Docker)', () => {
  it('timed, DST-spanning event → ISO-8601 UTC (offset determines the instant)', () => {
    // US DST began 2026-03-08. -05:00 offset given explicitly → 06:30Z.
    const ev: GoogleEvent = {
      id: 'e-timed',
      status: 'confirmed',
      summary: 'Standup',
      start: { dateTime: '2026-03-08T01:30:00-05:00', timeZone: 'America/New_York' },
      end: { dateTime: '2026-03-08T02:00:00-05:00', timeZone: 'America/New_York' },
    };
    const m = asMirror(normalizeEvent(ev, { context: 'work' }));
    expect(m.startsAt).toBe('2026-03-08T06:30:00.000Z');
    expect(m.endsAt).toBe('2026-03-08T07:00:00.000Z');
    expect(m.allDay).toBe(false);
    expect(m.context).toBe('work');
  });

  it('timed event with a +offset in a different tz converts correctly', () => {
    const ev: GoogleEvent = {
      id: 'e-tz',
      start: { dateTime: '2026-07-04T09:00:00+02:00' },
      end: { dateTime: '2026-07-04T10:00:00+02:00' },
    };
    const m = asMirror(normalizeEvent(ev, { context: 'personal' }));
    expect(m.startsAt).toBe('2026-07-04T07:00:00.000Z');
    expect(m.endsAt).toBe('2026-07-04T08:00:00.000Z');
  });

  it('all-day event → date-only bounds, allDay=true, no tz shift', () => {
    const ev: GoogleEvent = {
      id: 'e-allday',
      summary: 'Holiday',
      start: { date: '2026-07-04' },
      end: { date: '2026-07-05' },
    };
    const m = asMirror(normalizeEvent(ev, { context: 'personal' }));
    expect(m.startsAt).toBe('2026-07-04');
    expect(m.endsAt).toBe('2026-07-05');
    expect(m.allDay).toBe(true);
  });

  it('recurring instance → one mirror row carrying recurringEventId', () => {
    const ev: GoogleEvent = {
      id: 'e-recur_20260710T130000Z',
      summary: 'Weekly sync',
      recurringEventId: 'e-recur',
      start: { dateTime: '2026-07-10T13:00:00Z' },
      end: { dateTime: '2026-07-10T13:30:00Z' },
    };
    const m = asMirror(normalizeEvent(ev, { context: 'work' }));
    expect(m.externalId).toBe('e-recur_20260710T130000Z');
    expect(m.recurringEventId).toBe('e-recur');
    expect(m.startsAt).toBe('2026-07-10T13:00:00.000Z');
  });

  it('cancelled instance → { cancelledExternalId } removal signal', () => {
    const ev: GoogleEvent = {
      id: 'e-recur_20260717T130000Z',
      status: 'cancelled',
      recurringEventId: 'e-recur',
    };
    const r = normalizeEvent(ev, { context: 'work' });
    expect(r).toEqual({ cancelledExternalId: 'e-recur_20260717T130000Z' });
  });

  it('event without an id is skipped (null)', () => {
    expect(normalizeEvent({ start: { date: '2026-07-04' } }, { context: 'work' })).toBeNull();
  });

  it('event without usable start/end bounds is skipped (null)', () => {
    expect(normalizeEvent({ id: 'e-x' }, { context: 'work' })).toBeNull();
  });

  it('summary is optional (null) — no bodies/attendees are read (NFR-6)', () => {
    const ev: GoogleEvent = {
      id: 'e-nosummary',
      start: { dateTime: '2026-07-04T09:00:00Z' },
      end: { dateTime: '2026-07-04T10:00:00Z' },
    };
    const m = asMirror(normalizeEvent(ev, { context: 'work' }));
    expect(m.summary).toBeNull();
  });
});
