import { describe, it, expect } from 'vitest';
import type { DomainEvent, GoalRow } from '../events/types.js';
import { projectGoals, reduceGoal } from './goal.js';

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

/** A catalog-shaped GoalAdded payload with a 3×45 protected weekly allocation. */
function goal(overrides: Record<string, unknown> = {}) {
  return {
    goalId: 'g-1',
    title: 'Learn to paint',
    nextAction: 'Buy a starter watercolor set',
    allocation: { frequency: 'weekly', sessionsPerWeek: 3, minutesPerSession: 45 },
    context: 'personal',
    createdAt: '2026-07-14T00:00:00.000Z',
    updatedAt: '2026-07-14T00:00:00.000Z',
    ...overrides,
  };
}

describe('reduceGoal (Story 2.5 goal + protected allocation)', () => {
  it('folds all fields and exposes the allocation as a protected-priority intention', () => {
    const row = reduceGoal(null, evt({ eventType: 'GoalAdded', payload: goal() }));
    expect(row?.id).toBe('g-1');
    expect(row?.title).toBe('Learn to paint');
    expect(row?.nextAction).toBe('Buy a starter watercolor set');
    expect(row?.context).toBe('personal');
    expect(row?.displacementCount).toBe(0);
    expect(row?.allocation).toEqual({
      protectionLevel: 'protected-priority',
      frequency: 'weekly',
      sessionsPerWeek: 3,
      minutesPerSession: 45,
    });
  });

  it('ignores a GoalAdded missing a required title/nextAction/context (no malformed row)', () => {
    expect(reduceGoal(null, evt({ eventType: 'GoalAdded', payload: goal({ title: '   ' }) }))).toBeNull();
    expect(
      reduceGoal(null, evt({ eventType: 'GoalAdded', payload: goal({ nextAction: '' }) })),
    ).toBeNull();
    expect(
      reduceGoal(null, evt({ eventType: 'GoalAdded', payload: goal({ context: 'joint' }) })),
    ).toBeNull();
  });

  it('ignores a GoalAdded with an invalid allocation (out of range / non-integer)', () => {
    for (const bad of [
      { frequency: 'weekly', sessionsPerWeek: 0, minutesPerSession: 45 },
      { frequency: 'weekly', sessionsPerWeek: 8, minutesPerSession: 45 },
      { frequency: 'weekly', sessionsPerWeek: 3, minutesPerSession: 0 },
      { frequency: 'weekly', sessionsPerWeek: 3, minutesPerSession: 481 },
      { frequency: 'weekly', sessionsPerWeek: 2.5, minutesPerSession: 45 },
      { frequency: 'monthly', sessionsPerWeek: 3, minutesPerSession: 45 },
      undefined,
    ]) {
      expect(
        reduceGoal(null, evt({ eventType: 'GoalAdded', payload: goal({ allocation: bad }) })),
      ).toBeNull();
    }
  });

  it('increments displacementCount only on an existing goal', () => {
    const added = reduceGoal(null, evt({ eventType: 'GoalAdded', payload: goal() }));
    const once = reduceGoal(added, evt({ eventType: 'GoalAllocationDisplaced', payload: { goalId: 'g-1' } }));
    expect(once?.displacementCount).toBe(1);
    const twice = reduceGoal(once, evt({ eventType: 'GoalAllocationDisplaced', payload: { goalId: 'g-1' } }));
    expect(twice?.displacementCount).toBe(2);
    // A displacement before an add creates no row.
    expect(
      reduceGoal(null, evt({ eventType: 'GoalAllocationDisplaced', payload: { goalId: 'g-1' } })),
    ).toBeNull();
  });

  it('folds a GoalAddUndone to removed', () => {
    const added = reduceGoal(null, evt({ eventType: 'GoalAdded', payload: goal() }));
    expect(reduceGoal(added, evt({ eventType: 'GoalAddUndone', payload: { goalId: 'g-1' } }))).toBeNull();
  });

  it('leaves current untouched for unrelated event types (default case)', () => {
    const added = reduceGoal(null, evt({ eventType: 'GoalAdded', payload: goal() }));
    const after = reduceGoal(added, evt({ eventType: 'OnboardingStarted', payload: { startedAt: 't0' } }));
    expect(after).toBe(added);
  });
});

describe('projectGoals (Story 2.5)', () => {
  it('latest-wins on a re-add of the same goal id', () => {
    const rows = projectGoals([
      evt({ id: 'e1', eventSeq: 1, eventType: 'GoalAdded', payload: goal({ title: 'Old' }) }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'GoalAdded', payload: goal({ title: 'New' }) }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.title).toBe('New');
  });

  it('folds displacements onto the goal (2× → count 2, neutral count only)', () => {
    const rows = projectGoals([
      evt({ id: 'e1', eventSeq: 1, eventType: 'GoalAdded', payload: goal() }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'GoalAllocationDisplaced', payload: { goalId: 'g-1' } }),
      evt({ id: 'e3', eventSeq: 3, eventType: 'GoalAllocationDisplaced', payload: { goalId: 'g-1' } }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.displacementCount).toBe(2);
  });

  it('ignores a displacement that arrives before the add and after an undo (no resurrection)', () => {
    const before = projectGoals([
      evt({ id: 'e0', eventSeq: 0, eventType: 'GoalAllocationDisplaced', payload: { goalId: 'g-1' } }),
      evt({ id: 'e1', eventSeq: 1, eventType: 'GoalAdded', payload: goal() }),
    ]);
    expect(before).toHaveLength(1);
    expect(before[0]?.displacementCount).toBe(0);

    const afterUndo = projectGoals([
      evt({ id: 'e1', eventSeq: 1, eventType: 'GoalAdded', payload: goal() }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'GoalAddUndone', payload: { goalId: 'g-1' } }),
      evt({ id: 'e3', eventSeq: 3, eventType: 'GoalAllocationDisplaced', payload: { goalId: 'g-1' } }),
    ]);
    expect(afterUndo).toEqual([]);
  });

  it('removes a goal when its add is undone', () => {
    const rows = projectGoals([
      evt({ id: 'e1', eventSeq: 1, eventType: 'GoalAdded', payload: goal() }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'GoalAddUndone',
        payload: { goalId: 'g-1' },
        compensatesEventId: 'e1',
      }),
    ]);
    expect(rows).toEqual([]);
  });

  it('spans work + personal goals in one projection (no context filter)', () => {
    const rows = projectGoals([
      evt({
        id: 'e1',
        eventSeq: 1,
        context: 'personal',
        eventType: 'GoalAdded',
        payload: goal({ goalId: 'g-personal', context: 'personal' }),
      }),
      evt({
        id: 'e2',
        eventSeq: 2,
        context: 'work',
        eventType: 'GoalAdded',
        payload: goal({ goalId: 'g-work', context: 'work' }),
      }),
    ]);
    expect(rows.map((r) => r.id).sort()).toEqual(['g-personal', 'g-work']);
    expect(rows.find((r) => r.id === 'g-work')?.context).toBe('work');
  });

  it('ignores unrelated event types (default case)', () => {
    const rows = projectGoals([evt({ eventType: 'OnboardingStarted', payload: { startedAt: 't0' } })]);
    expect(rows).toEqual([]);
  });

  it('is independent of compensatesEventId (rebuild purity)', () => {
    const events: DomainEvent[] = [
      evt({ id: 'e1', eventSeq: 1, eventType: 'GoalAdded', payload: goal() }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'GoalAddUndone',
        payload: { goalId: 'g-1' },
        compensatesEventId: 'e1',
      }),
    ];
    const scrambled = events.map((e) => ({ ...e, compensatesEventId: 'nonsense' }));
    expect(projectGoals(scrambled)).toEqual(projectGoals(events));
  });

  it('never produces a numeric score/rating/rank/health field on a GoalRow (FR-40 / P5)', () => {
    const rows = projectGoals([
      evt({ eventType: 'GoalAdded', payload: goal() }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'GoalAllocationDisplaced', payload: { goalId: 'g-1' } }),
    ]);
    const row = rows[0] as GoalRow;
    const keys = Object.keys(row);
    for (const banned of ['score', 'rating', 'rank', 'health', 'grade', 'priority']) {
      expect(keys).not.toContain(banned);
    }
    // displacementCount is the only number, and it is a plain factual count.
    expect(row.displacementCount).toBe(1);
    expect(typeof row.displacementCount).toBe('number');
  });
});
