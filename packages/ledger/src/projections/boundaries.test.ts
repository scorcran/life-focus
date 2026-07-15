import { describe, it, expect } from 'vitest';
import type { DomainEvent } from '../events/types.js';
import { projectBoundaries } from './boundaries.js';

/** Build a persisted DomainEvent for projection tests. */
function evt(
  overrides: Partial<DomainEvent> & Pick<DomainEvent, 'eventType' | 'payload'>,
): DomainEvent {
  return {
    id: overrides.id ?? 'evt-1',
    eventSeq: overrides.eventSeq ?? 1,
    actor: overrides.actor ?? 'user-1',
    context: overrides.context ?? 'joint',
    causedBy: overrides.causedBy ?? null,
    compensatesEventId: overrides.compensatesEventId ?? null,
    erasureScope: overrides.erasureScope ?? null,
    createdAt: overrides.createdAt ?? '2026-07-14T00:00:00.000Z',
    ...overrides,
  };
}

describe('projectBoundaries', () => {
  it('fresh account: no events → null (unset)', () => {
    expect(projectBoundaries([])).toBeNull();
  });

  it('BoundariesSet persists the times', () => {
    const b = projectBoundaries([
      evt({
        eventType: 'BoundariesSet',
        payload: {
          workdayStart: '09:00',
          hardStop: '16:30',
          sleepStart: '22:30',
          sleepEnd: '06:30',
          updatedAt: '2026-07-14T09:00:00.000Z',
        },
      }),
    ]);
    expect(b).toEqual({
      workdayStart: '09:00',
      hardStop: '16:30',
      sleepStart: '22:30',
      sleepEnd: '06:30',
      updatedAt: '2026-07-14T09:00:00.000Z',
    });
  });

  it('is latest-wins (a later set fully replaces the prior)', () => {
    const b = projectBoundaries([
      evt({
        id: 'e1',
        eventSeq: 1,
        eventType: 'BoundariesSet',
        payload: {
          workdayStart: '08:00',
          hardStop: '16:00',
          sleepStart: '22:00',
          sleepEnd: '06:00',
          updatedAt: 't1',
        },
      }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'BoundariesSet',
        payload: {
          workdayStart: '09:30',
          hardStop: '16:30',
          sleepStart: '23:00',
          sleepEnd: '07:00',
          updatedAt: 't2',
        },
      }),
    ]);
    expect(b?.workdayStart).toBe('09:30');
    expect(b?.hardStop).toBe('16:30');
    expect(b?.updatedAt).toBe('t2');
  });

  it('accepts a sleep window that crosses midnight (no ordering constraint)', () => {
    const b = projectBoundaries([
      evt({
        eventType: 'BoundariesSet',
        payload: {
          workdayStart: '09:00',
          hardStop: '16:30',
          sleepStart: '23:30',
          sleepEnd: '05:30',
          updatedAt: 't1',
        },
      }),
    ]);
    expect(b?.sleepStart).toBe('23:30');
    expect(b?.sleepEnd).toBe('05:30');
  });

  it('ignores a malformed payload (missing field) without corrupting state', () => {
    const b = projectBoundaries([
      evt({
        id: 'e1',
        eventSeq: 1,
        eventType: 'BoundariesSet',
        payload: {
          workdayStart: '09:00',
          hardStop: '16:30',
          sleepStart: '22:30',
          sleepEnd: '06:30',
          updatedAt: 't1',
        },
      }),
      // Missing hardStop — a corrupt event must leave the prior state intact.
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'BoundariesSet',
        payload: { workdayStart: '10:00', sleepStart: '22:00', sleepEnd: '06:00', updatedAt: 't2' },
      }),
    ]);
    expect(b?.hardStop).toBe('16:30');
    expect(b?.workdayStart).toBe('09:00');
  });

  it('ignores unrelated joint events (default case)', () => {
    const b = projectBoundaries([
      evt({ id: 'e1', eventSeq: 1, eventType: 'OnboardingStarted', payload: { startedAt: 't0' } }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'OnboardingStepCompleted',
        payload: { stepId: 'boundaries', mode: 'entered', at: 't1' },
      }),
    ]);
    expect(b).toBeNull();
  });

  it('is independent of compensatesEventId (rebuild purity)', () => {
    const events: DomainEvent[] = [
      evt({
        eventType: 'BoundariesSet',
        payload: {
          workdayStart: '09:00',
          hardStop: '16:30',
          sleepStart: '22:30',
          sleepEnd: '06:30',
          updatedAt: 't1',
        },
      }),
    ];
    const scrambled = events.map((e) => ({ ...e, compensatesEventId: 'nonsense' }));
    expect(projectBoundaries(scrambled)).toEqual(projectBoundaries(events));
  });
});
