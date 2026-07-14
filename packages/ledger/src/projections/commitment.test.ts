import { describe, it, expect } from 'vitest';
import type { DomainEvent } from '../events/types.js';
import { projectCommitments, reduceCommitment } from './commitment.js';

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

/** A catalog-shaped CommitmentCaptured payload with a protection level. */
function capture(overrides: Record<string, unknown> = {}) {
  return {
    commitmentId: 'c-1',
    title: 'Thursday 3:30 pickup',
    context: 'personal',
    status: 'captured',
    protectionLevel: 'hard-commitment',
    createdAt: '2026-07-14T00:00:00.000Z',
    updatedAt: '2026-07-14T00:00:00.000Z',
    ...overrides,
  };
}

describe('reduceCommitment (Story 2.3 protection level + recurrence)', () => {
  it('folds the protection level and a one-off (no recurrence → null)', () => {
    const row = reduceCommitment(null, evt({ eventType: 'CommitmentCaptured', payload: capture() }));
    expect(row?.protectionLevel).toBe('hard-commitment');
    expect(row?.recurrence).toBeNull();
    expect(row?.context).toBe('personal');
  });

  it('folds a weekly recurrence rule', () => {
    const row = reduceCommitment(
      null,
      evt({
        eventType: 'CommitmentCaptured',
        payload: capture({
          protectionLevel: 'protected-priority',
          recurrence: { frequency: 'weekly', daysOfWeek: ['thu'] },
        }),
      }),
    );
    expect(row?.protectionLevel).toBe('protected-priority');
    expect(row?.recurrence).toEqual({ frequency: 'weekly', daysOfWeek: ['thu'] });
  });

  it('ignores a capture with a missing/unknown protection level (no untagged row)', () => {
    const missing = reduceCommitment(
      null,
      evt({ eventType: 'CommitmentCaptured', payload: capture({ protectionLevel: undefined }) }),
    );
    expect(missing).toBeNull();

    const unknown = reduceCommitment(
      null,
      evt({ eventType: 'CommitmentCaptured', payload: capture({ protectionLevel: 'someday' }) }),
    );
    expect(unknown).toBeNull();
  });

  it('treats a malformed recurrence as one-off (null)', () => {
    const row = reduceCommitment(
      null,
      evt({
        eventType: 'CommitmentCaptured',
        payload: capture({ recurrence: { frequency: 'weekly', daysOfWeek: [] } }),
      }),
    );
    expect(row?.recurrence).toBeNull();
  });
});

describe('projectCommitments (Story 2.3)', () => {
  it('latest-wins on a re-capture of the same commitment id', () => {
    const rows = projectCommitments([
      evt({
        id: 'e1',
        eventSeq: 1,
        eventType: 'CommitmentCaptured',
        payload: capture({ protectionLevel: 'flexible-intention' }),
      }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'CommitmentCaptured',
        payload: capture({
          protectionLevel: 'hard-commitment',
          recurrence: { frequency: 'weekly', daysOfWeek: ['mon', 'wed'] },
        }),
      }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.protectionLevel).toBe('hard-commitment');
    expect(rows[0]?.recurrence).toEqual({ frequency: 'weekly', daysOfWeek: ['mon', 'wed'] });
  });

  it('removes a commitment when its capture is undone', () => {
    const rows = projectCommitments([
      evt({ id: 'e1', eventSeq: 1, eventType: 'CommitmentCaptured', payload: capture() }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'CommitmentCaptureUndone',
        payload: { commitmentId: 'c-1' },
        compensatesEventId: 'e1',
      }),
    ]);
    expect(rows).toEqual([]);
  });

  it('spans work + personal commitments in one projection', () => {
    const rows = projectCommitments([
      evt({
        id: 'e1',
        eventSeq: 1,
        context: 'personal',
        eventType: 'CommitmentCaptured',
        payload: capture({ commitmentId: 'c-personal', context: 'personal' }),
      }),
      evt({
        id: 'e2',
        eventSeq: 2,
        context: 'work',
        eventType: 'CommitmentCaptured',
        payload: capture({ commitmentId: 'c-work', context: 'work', protectionLevel: 'protected-priority' }),
      }),
    ]);
    expect(rows.map((r) => r.id).sort()).toEqual(['c-personal', 'c-work']);
    expect(rows.find((r) => r.id === 'c-work')?.context).toBe('work');
  });

  it('ignores unrelated event types (default case)', () => {
    const rows = projectCommitments([
      evt({ eventType: 'OnboardingStarted', payload: { startedAt: 't0' } }),
    ]);
    expect(rows).toEqual([]);
  });

  it('is independent of compensatesEventId (rebuild purity)', () => {
    const events: DomainEvent[] = [
      evt({ id: 'e1', eventSeq: 1, eventType: 'CommitmentCaptured', payload: capture() }),
    ];
    const scrambled = events.map((e) => ({ ...e, compensatesEventId: 'nonsense' }));
    expect(projectCommitments(scrambled)).toEqual(projectCommitments(events));
  });
});
