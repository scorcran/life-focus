import { describe, it, expect } from 'vitest';
import type { DomainEvent } from '../events/types.js';
import { projectOnboarding, ONBOARDING_STEP_IDS } from './onboarding.js';

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

describe('projectOnboarding', () => {
  it('fresh account: no events → not started, no steps, not completed', () => {
    const p = projectOnboarding([]);
    expect(p).toEqual({
      started: false,
      startedAt: null,
      steps: {},
      completed: false,
      completedAt: null,
    });
  });

  it('OnboardingStarted sets started + startedAt', () => {
    const p = projectOnboarding([
      evt({ eventType: 'OnboardingStarted', payload: { startedAt: '2026-07-14T09:00:00.000Z' } }),
    ]);
    expect(p.started).toBe(true);
    expect(p.startedAt).toBe('2026-07-14T09:00:00.000Z');
    expect(p.completed).toBe(false);
  });

  it('OnboardingStarted is idempotent (first startedAt wins on re-entry)', () => {
    const p = projectOnboarding([
      evt({ id: 'e1', eventSeq: 1, eventType: 'OnboardingStarted', payload: { startedAt: 'first' } }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'OnboardingStarted', payload: { startedAt: 'second' } }),
    ]);
    expect(p.startedAt).toBe('first');
  });

  it('records an entered step and a skipped step', () => {
    const p = projectOnboarding([
      evt({ id: 'e1', eventSeq: 1, eventType: 'OnboardingStarted', payload: { startedAt: 't0' } }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'OnboardingStepCompleted',
        payload: { stepId: 'commitments', mode: 'entered', at: 't1' },
      }),
      evt({
        id: 'e3',
        eventSeq: 3,
        eventType: 'OnboardingStepCompleted',
        payload: { stepId: 'people', mode: 'skipped', at: 't2' },
      }),
    ]);
    expect(p.steps.commitments).toEqual({ mode: 'entered', at: 't1' });
    expect(p.steps.people).toEqual({ mode: 'skipped', at: 't2' });
  });

  it('repeated step completion is latest-wins (skipped then entered → entered)', () => {
    const p = projectOnboarding([
      evt({
        id: 'e1',
        eventSeq: 1,
        eventType: 'OnboardingStepCompleted',
        payload: { stepId: 'goals', mode: 'skipped', at: 't1' },
      }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'OnboardingStepCompleted',
        payload: { stepId: 'goals', mode: 'entered', at: 't2' },
      }),
    ]);
    expect(p.steps.goals).toEqual({ mode: 'entered', at: 't2' });
  });

  it('OnboardingCompleted sets completed + completedAt', () => {
    const p = projectOnboarding([
      evt({ id: 'e1', eventSeq: 1, eventType: 'OnboardingStarted', payload: { startedAt: 't0' } }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'OnboardingCompleted',
        payload: { completedAt: '2026-07-14T09:30:00.000Z' },
      }),
    ]);
    expect(p.completed).toBe(true);
    expect(p.completedAt).toBe('2026-07-14T09:30:00.000Z');
  });

  it('ignores unrelated joint events (default case)', () => {
    const p = projectOnboarding([
      evt({ id: 'e1', eventSeq: 1, eventType: 'OnboardingStarted', payload: { startedAt: 't0' } }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'CrossContextAccessAudited',
        payload: { sourceContext: 'work', targetContext: 'personal', allowed: false },
      }),
    ]);
    expect(p.started).toBe(true);
    expect(p.steps).toEqual({});
  });

  it('is independent of compensatesEventId (rebuild purity)', () => {
    const events: DomainEvent[] = [
      evt({ id: 'e1', eventSeq: 1, eventType: 'OnboardingStarted', payload: { startedAt: 't0' } }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'OnboardingStepCompleted',
        payload: { stepId: 'boundaries', mode: 'entered', at: 't1' },
      }),
    ];
    const scrambled = events.map((e) => ({ ...e, compensatesEventId: 'nonsense' }));
    expect(projectOnboarding(scrambled)).toEqual(projectOnboarding(events));
  });

  it('exposes the canonical ordered step-id list', () => {
    expect(ONBOARDING_STEP_IDS).toEqual(['boundaries', 'commitments', 'people', 'goals']);
  });
});
