import { describe, it, expect } from 'vitest';
import { shapeAgenda, agendaEmptyNotice, type AgendaSourceEvent } from './agenda.js';

const TZ = 'America/New_York';

function ev(overrides: Partial<AgendaSourceEvent> = {}): AgendaSourceEvent {
  return {
    externalId: 'e1',
    context: 'work',
    summary: 'Event',
    startsAt: '2026-07-14T13:00:00.000Z',
    endsAt: '2026-07-14T14:00:00.000Z',
    allDay: false,
    ...overrides,
  };
}

describe('shapeAgenda (pure, no I/O — runs offline)', () => {
  it('includes a timed event on today and formats its local time', () => {
    // 13:00Z on 2026-07-14 is 09:00 in New York (EDT, -04:00).
    const now = new Date('2026-07-14T15:00:00.000Z');
    const { items } = shapeAgenda([ev({ startsAt: '2026-07-14T13:00:00.000Z' })], { timeZone: TZ, now });
    expect(items).toHaveLength(1);
    expect(items[0]!.timeLabel).toBe('9:00 AM');
    expect(items[0]!.allDay).toBe(false);
    expect(items[0]!.context).toBe('work');
  });

  it('carries the per-event context tag', () => {
    const now = new Date('2026-07-14T15:00:00.000Z');
    const { items } = shapeAgenda(
      [
        ev({ externalId: 'w', context: 'work', startsAt: '2026-07-14T13:00:00.000Z' }),
        ev({ externalId: 'p', context: 'personal', startsAt: '2026-07-14T14:00:00.000Z' }),
      ],
      { timeZone: TZ, now },
    );
    expect(items.map((i) => `${i.externalId}:${i.context}`)).toEqual(['w:work', 'p:personal']);
  });

  it('shows an all-day event today as "All day" with no tz shift', () => {
    const now = new Date('2026-07-04T18:00:00.000Z');
    const { items } = shapeAgenda(
      [ev({ allDay: true, startsAt: '2026-07-04', endsAt: '2026-07-05', summary: 'Holiday' })],
      { timeZone: TZ, now },
    );
    expect(items).toHaveLength(1);
    expect(items[0]!.timeLabel).toBe('All day');
    expect(items[0]!.allDay).toBe(true);
  });

  it('treats all-day endsAt as EXCLUSIVE — not shown on the end date', () => {
    // Event covers Jul 4 only (endsAt = Jul 5). "Today" = Jul 5 must exclude it.
    const now = new Date('2026-07-05T18:00:00.000Z');
    const { items } = shapeAgenda(
      [ev({ allDay: true, startsAt: '2026-07-04', endsAt: '2026-07-05' })],
      { timeZone: TZ, now },
    );
    expect(items).toHaveLength(0);
  });

  it('includes an all-day event on a middle day of a multi-day span (end exclusive)', () => {
    // Jul 4 → Jul 7 exclusive covers Jul 4,5,6. Jul 6 included; Jul 7 excluded.
    const spanning = ev({ allDay: true, startsAt: '2026-07-04', endsAt: '2026-07-07' });
    const jul6 = shapeAgenda([spanning], { timeZone: TZ, now: new Date('2026-07-06T18:00:00.000Z') });
    const jul7 = shapeAgenda([spanning], { timeZone: TZ, now: new Date('2026-07-07T18:00:00.000Z') });
    expect(jul6.items).toHaveLength(1);
    expect(jul7.items).toHaveLength(0);
  });

  it('formats a timed event correctly across the US spring-forward DST gap', () => {
    // 2026-03-08 is US spring-forward (02:00 → 03:00 local). At 14:30Z the offset
    // has already shifted to EDT (-04:00), so local time is 10:30 AM — proving the
    // DST-safe Intl path (a naive -05:00 would wrongly show 9:30 AM).
    const now = new Date('2026-03-08T15:00:00.000Z');
    const { items } = shapeAgenda(
      [ev({ startsAt: '2026-03-08T14:30:00.000Z', endsAt: '2026-03-08T15:30:00.000Z' })],
      { timeZone: TZ, now },
    );
    expect(items).toHaveLength(1);
    expect(items[0]!.timeLabel).toBe('10:30 AM');
  });

  it('DST: an early-morning event before the gap still renders with the pre-gap offset', () => {
    // 06:30Z on 2026-03-08 is 01:30 AM EST (-05:00, before the 02:00 gap).
    const now = new Date('2026-03-08T15:00:00.000Z');
    const { items } = shapeAgenda(
      [ev({ startsAt: '2026-03-08T06:30:00.000Z', endsAt: '2026-03-08T07:30:00.000Z' })],
      { timeZone: TZ, now },
    );
    expect(items[0]!.timeLabel).toBe('1:30 AM');
  });

  it('excludes events not on today (local date)', () => {
    const now = new Date('2026-07-14T15:00:00.000Z');
    const { items } = shapeAgenda(
      [ev({ startsAt: '2026-07-13T13:00:00.000Z' }), ev({ startsAt: '2026-07-15T13:00:00.000Z' })],
      { timeZone: TZ, now },
    );
    expect(items).toHaveLength(0);
  });

  it('excludes a late-UTC timed event that is a PRIOR local day in the target zone', () => {
    // 2026-07-14T02:00Z is 2026-07-13 22:00 in New York → NOT today (Jul 14).
    const now = new Date('2026-07-14T15:00:00.000Z');
    const { items } = shapeAgenda([ev({ startsAt: '2026-07-14T02:00:00.000Z' })], { timeZone: TZ, now });
    expect(items).toHaveLength(0);
  });

  it('merges a mixed-context list, all-day first then chronological timed', () => {
    const now = new Date('2026-07-14T15:00:00.000Z');
    const { items } = shapeAgenda(
      [
        ev({ externalId: 'noon', context: 'work', startsAt: '2026-07-14T16:00:00.000Z' }),
        ev({ externalId: 'allday', context: 'personal', allDay: true, startsAt: '2026-07-14', endsAt: '2026-07-15' }),
        ev({ externalId: 'morning', context: 'personal', startsAt: '2026-07-14T13:00:00.000Z' }),
      ],
      { timeZone: TZ, now },
    );
    expect(items.map((i) => i.externalId)).toEqual(['allday', 'morning', 'noon']);
  });

  it('falls back to a titled label when summary is null or blank', () => {
    const now = new Date('2026-07-14T15:00:00.000Z');
    const { items } = shapeAgenda(
      [ev({ summary: null, startsAt: '2026-07-14T13:00:00.000Z' })],
      { timeZone: TZ, now },
    );
    expect(items[0]!.title).toBe('Untitled event');
  });

  it('respects a non-US timezone for today-filtering', () => {
    // 23:00Z Jul 14 is Jul 15 01:00 in Europe/London (BST +01:00).
    const now = new Date('2026-07-15T09:00:00.000Z');
    const { items } = shapeAgenda(
      [ev({ startsAt: '2026-07-14T23:00:00.000Z' })],
      { timeZone: 'Europe/London', now },
    );
    expect(items).toHaveLength(1);
    expect(items[0]!.timeLabel).toBe('12:00 AM');
  });

  it('skips a malformed all-day row instead of crashing the whole agenda', () => {
    // A single bad all-day date must not take down the good rows (the all-day
    // path is now NaN-guarded, symmetric with the timed path).
    const now = new Date('2026-07-14T15:00:00.000Z');
    const { items } = shapeAgenda(
      [
        ev({ externalId: 'bad', allDay: true, startsAt: 'not-a-date', endsAt: '' }),
        ev({ externalId: 'good', startsAt: '2026-07-14T13:00:00.000Z' }),
      ],
      { timeZone: TZ, now },
    );
    expect(items.map((i) => i.externalId)).toEqual(['good']);
  });
});

describe('agendaEmptyNotice (honest empty/degraded states)', () => {
  it('shows a degraded notice on load failure — never the "no calendars" copy', () => {
    const notice = agendaEmptyNotice({ loadFailed: true, hasSources: false });
    expect(notice.toLowerCase()).not.toContain('connect your calendars');
    // Degraded voice: never "Error"/"Sync failed".
    expect(notice.toLowerCase()).not.toContain('error');
    expect(notice.toLowerCase()).not.toContain('failed');
    expect(notice).toContain('Capture anything new manually');
  });

  it('shows a calm empty state when connected but nothing today', () => {
    expect(agendaEmptyNotice({ loadFailed: false, hasSources: true })).toBe(
      'Nothing on your calendar today.',
    );
  });

  it('shows the cold-start invitation when nothing is connected', () => {
    expect(agendaEmptyNotice({ loadFailed: false, hasSources: false })).toContain(
      'Connect your calendars',
    );
  });
});
