import { describe, it, expect } from 'vitest';
import type { DomainEvent, PersonRow } from '../events/types.js';
import { projectPeople, reducePerson } from './person.js';

/** Build a persisted DomainEvent for projection tests. */
function evt(
  overrides: Partial<DomainEvent> & Pick<DomainEvent, 'eventType' | 'payload'>,
): DomainEvent {
  return {
    id: overrides.id ?? 'evt-1',
    eventSeq: overrides.eventSeq ?? 1,
    actor: overrides.actor ?? 'user-1',
    context: overrides.context ?? 'personal',
    causedBy: overrides.causedBy ?? null,
    compensatesEventId: overrides.compensatesEventId ?? null,
    erasureScope: overrides.erasureScope ?? null,
    createdAt: overrides.createdAt ?? '2026-07-14T00:00:00.000Z',
    ...overrides,
  };
}

/** A catalog-shaped PersonAdded payload with a user-asserted importance. */
function person(overrides: Record<string, unknown> = {}) {
  return {
    personId: 'p-1',
    name: 'Mom',
    relationshipType: 'Parent',
    importance: 'inner-circle',
    context: 'personal',
    createdAt: '2026-07-14T00:00:00.000Z',
    updatedAt: '2026-07-14T00:00:00.000Z',
    ...overrides,
  };
}

describe('reducePerson (Story 2.4 person + rhythm)', () => {
  it('folds all fields with no rhythm and no important dates', () => {
    const row = reducePerson(
      null,
      evt({ eventType: 'PersonAdded', payload: person({ importance: 'close' }) }),
    );
    expect(row?.id).toBe('p-1');
    expect(row?.name).toBe('Mom');
    expect(row?.relationshipType).toBe('Parent');
    expect(row?.importance).toBe('close');
    expect(row?.intention).toBeNull();
    expect(row?.importantDates).toEqual([]);
    expect(row?.context).toBe('personal');
    expect(row?.rhythm).toBeNull();
  });

  it('exposes a present rhythm as a flexible-intention linked to the person', () => {
    const row = reducePerson(
      null,
      evt({
        eventType: 'PersonAdded',
        payload: person({ rhythm: { frequency: 'weekly', daysOfWeek: ['sun'] } }),
      }),
    );
    expect(row?.rhythm).toEqual({
      protectionLevel: 'flexible-intention',
      frequency: 'weekly',
      daysOfWeek: ['sun'],
    });
  });

  it('accepts a weekly rhythm with an EMPTY weekday set (flexible window)', () => {
    const row = reducePerson(
      null,
      evt({
        eventType: 'PersonAdded',
        payload: person({ rhythm: { frequency: 'weekly', daysOfWeek: [] } }),
      }),
    );
    expect(row?.rhythm).toEqual({
      protectionLevel: 'flexible-intention',
      frequency: 'weekly',
      daysOfWeek: [],
    });
  });

  it('folds an intention and user-asserted important dates', () => {
    const row = reducePerson(
      null,
      evt({
        eventType: 'PersonAdded',
        payload: person({
          intention: 'Stay in touch weekly',
          importantDates: [{ label: 'Birthday', date: '03-14' }],
        }),
      }),
    );
    expect(row?.intention).toBe('Stay in touch weekly');
    expect(row?.importantDates).toEqual([{ label: 'Birthday', date: '03-14' }]);
  });

  it('ignores a PersonAdded missing a required identity/context/importance value (no malformed row)', () => {
    expect(
      reducePerson(null, evt({ eventType: 'PersonAdded', payload: person({ name: '   ' }) })),
    ).toBeNull();
    expect(
      reducePerson(
        null,
        evt({ eventType: 'PersonAdded', payload: person({ importance: undefined }) }),
      ),
    ).toBeNull();
    expect(
      reducePerson(
        null,
        evt({ eventType: 'PersonAdded', payload: person({ importance: 'best-friend' }) }),
      ),
    ).toBeNull();
    expect(
      reducePerson(null, evt({ eventType: 'PersonAdded', payload: person({ context: 'joint' }) })),
    ).toBeNull();
    expect(
      reducePerson(
        null,
        evt({ eventType: 'PersonAdded', payload: person({ relationshipType: '' }) }),
      ),
    ).toBeNull();
  });
});

describe('projectPeople (Story 2.4)', () => {
  it('latest-wins on a re-add of the same person id', () => {
    const rows = projectPeople([
      evt({ id: 'e1', eventSeq: 1, eventType: 'PersonAdded', payload: person({ importance: 'wider-circle' }) }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'PersonAdded',
        payload: person({ importance: 'inner-circle', name: 'Mum' }),
      }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.importance).toBe('inner-circle');
    expect(rows[0]?.name).toBe('Mum');
  });

  it('removes a person when its add is undone', () => {
    const rows = projectPeople([
      evt({ id: 'e1', eventSeq: 1, eventType: 'PersonAdded', payload: person() }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'PersonAddUndone',
        payload: { personId: 'p-1' },
        compensatesEventId: 'e1',
      }),
    ]);
    expect(rows).toEqual([]);
  });

  it('spans work + personal people in one projection (no context filter)', () => {
    const rows = projectPeople([
      evt({
        id: 'e1',
        eventSeq: 1,
        context: 'personal',
        eventType: 'PersonAdded',
        payload: person({ personId: 'p-personal', context: 'personal' }),
      }),
      evt({
        id: 'e2',
        eventSeq: 2,
        context: 'work',
        eventType: 'PersonAdded',
        payload: person({ personId: 'p-work', context: 'work', relationshipType: 'Manager' }),
      }),
    ]);
    expect(rows.map((r) => r.id).sort()).toEqual(['p-personal', 'p-work']);
    expect(rows.find((r) => r.id === 'p-work')?.context).toBe('work');
  });

  it('ignores unrelated event types (default case)', () => {
    const rows = projectPeople([
      evt({ eventType: 'OnboardingStarted', payload: { startedAt: 't0' } }),
    ]);
    expect(rows).toEqual([]);
  });

  it('is independent of compensatesEventId (rebuild purity)', () => {
    const events: DomainEvent[] = [
      evt({ id: 'e1', eventSeq: 1, eventType: 'PersonAdded', payload: person() }),
    ];
    const scrambled = events.map((e) => ({ ...e, compensatesEventId: 'nonsense' }));
    expect(projectPeople(scrambled)).toEqual(projectPeople(events));
  });

  it('never produces a numeric score/rating/rank/health field on a PersonRow (FR-12 / P5)', () => {
    const rows = projectPeople([
      evt({ eventType: 'PersonAdded', payload: person() }),
    ]);
    const row = rows[0] as PersonRow;
    const keys = Object.keys(row);
    for (const banned of ['score', 'rating', 'rank', 'health', 'priority']) {
      expect(keys).not.toContain(banned);
    }
    // The only "importance" is an opaque categorical string — not a number.
    expect(typeof row.importance).toBe('string');
    for (const value of Object.values(row)) {
      expect(typeof value).not.toBe('number');
    }
  });
});
