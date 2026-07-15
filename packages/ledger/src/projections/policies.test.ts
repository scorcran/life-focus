import { describe, it, expect } from 'vitest';
import type { DomainEvent } from '../events/types.js';
import { projectPolicyTemplates, POLICY_TEMPLATE_IDS } from './policies.js';

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

describe('projectPolicyTemplates', () => {
  it('exposes the two canonical MVP template ids', () => {
    expect(POLICY_TEMPLATE_IDS).toEqual(['non-negotiables', 'work-boundaries']);
  });

  it('fresh account: both templates pending, no content', () => {
    const states = projectPolicyTemplates([]);
    expect(states).toEqual([
      { templateId: 'non-negotiables', status: 'pending', content: null },
      { templateId: 'work-boundaries', status: 'pending', content: null },
    ]);
  });

  it('accepting a template stores its (edited) content', () => {
    const states = projectPolicyTemplates([
      evt({
        eventType: 'PolicyTemplateAccepted',
        payload: { templateId: 'non-negotiables', content: 'Work ends at the hard stop.', at: 't1' },
      }),
    ]);
    const nn = states.find((s) => s.templateId === 'non-negotiables');
    expect(nn?.status).toBe('accepted');
    expect(nn?.content).toBe('Work ends at the hard stop.');
  });

  it('declining a template records declined with no content', () => {
    const states = projectPolicyTemplates([
      evt({ eventType: 'PolicyTemplateDeclined', payload: { templateId: 'work-boundaries', at: 't1' } }),
    ]);
    const wb = states.find((s) => s.templateId === 'work-boundaries');
    expect(wb?.status).toBe('declined');
    expect(wb?.content).toBeNull();
  });

  it('re-accepting after a decline is latest-wins → accepted', () => {
    const states = projectPolicyTemplates([
      evt({ id: 'e1', eventSeq: 1, eventType: 'PolicyTemplateDeclined', payload: { templateId: 'non-negotiables', at: 't1' } }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'PolicyTemplateAccepted',
        payload: { templateId: 'non-negotiables', content: 'Reconsidered.', at: 't2' },
      }),
    ]);
    const nn = states.find((s) => s.templateId === 'non-negotiables');
    expect(nn?.status).toBe('accepted');
    expect(nn?.content).toBe('Reconsidered.');
  });

  it('a re-accept updates the stored content (latest-wins)', () => {
    const states = projectPolicyTemplates([
      evt({ id: 'e1', eventSeq: 1, eventType: 'PolicyTemplateAccepted', payload: { templateId: 'work-boundaries', content: 'First', at: 't1' } }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'PolicyTemplateAccepted', payload: { templateId: 'work-boundaries', content: 'Edited', at: 't2' } }),
    ]);
    expect(states.find((s) => s.templateId === 'work-boundaries')?.content).toBe('Edited');
  });

  it('ignores an unknown template id', () => {
    const states = projectPolicyTemplates([
      evt({ eventType: 'PolicyTemplateAccepted', payload: { templateId: 'nope', content: 'x', at: 't1' } }),
    ]);
    expect(states).toEqual([
      { templateId: 'non-negotiables', status: 'pending', content: null },
      { templateId: 'work-boundaries', status: 'pending', content: null },
    ]);
  });

  it('ignores a malformed accept (non-string content)', () => {
    const states = projectPolicyTemplates([
      evt({ eventType: 'PolicyTemplateAccepted', payload: { templateId: 'non-negotiables', content: 42, at: 't1' } }),
    ]);
    expect(states.find((s) => s.templateId === 'non-negotiables')?.status).toBe('pending');
  });

  it('ignores unrelated event types (default case)', () => {
    const states = projectPolicyTemplates([
      evt({ eventType: 'OnboardingStarted', payload: { startedAt: 't0' } }),
    ]);
    expect(states.every((s) => s.status === 'pending')).toBe(true);
  });

  it('is independent of compensatesEventId (rebuild purity)', () => {
    const events: DomainEvent[] = [
      evt({ id: 'e1', eventSeq: 1, eventType: 'PolicyTemplateDeclined', payload: { templateId: 'work-boundaries', at: 't1' } }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'PolicyTemplateAccepted', payload: { templateId: 'non-negotiables', content: 'x', at: 't2' } }),
    ];
    const scrambled = events.map((e) => ({ ...e, compensatesEventId: 'nonsense' }));
    expect(projectPolicyTemplates(scrambled)).toEqual(projectPolicyTemplates(events));
  });
});
