import { describe, it, expect } from 'vitest';
import type { DomainEvent } from '../events/types.js';
import { projectDomains, DEFAULT_DOMAINS } from './domains.js';

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

describe('projectDomains', () => {
  it('exposes the canonical 11 default domains with stable kebab ids', () => {
    expect(DEFAULT_DOMAINS).toHaveLength(11);
    expect(DEFAULT_DOMAINS.map((d) => d.id)).toEqual([
      'work',
      'spouse-partner',
      'children-family',
      'friends-social',
      'health-fitness',
      'household',
      'finances',
      'personal-growth',
      'recreation',
      'community',
      'rest-recovery',
    ]);
  });

  it('fresh account: seeds the 11 defaults, all enabled and non-custom', () => {
    const rows = projectDomains([]);
    expect(rows).toHaveLength(11);
    expect(rows.every((r) => r.enabled && !r.custom)).toBe(true);
    expect(rows[0]).toEqual({ id: 'work', name: 'Work', enabled: true, custom: false });
  });

  it('renames a domain (latest-wins effective name)', () => {
    const rows = projectDomains([
      evt({ id: 'e1', eventSeq: 1, eventType: 'DomainRenamed', payload: { domainId: 'work', name: 'Day job', at: 't1' } }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'DomainRenamed', payload: { domainId: 'work', name: 'The Firm', at: 't2' } }),
    ]);
    expect(rows.find((r) => r.id === 'work')?.name).toBe('The Firm');
  });

  it('disables then re-enables a domain (stays listed, latest-wins)', () => {
    const rows = projectDomains([
      evt({ id: 'e1', eventSeq: 1, eventType: 'DomainSetEnabled', payload: { domainId: 'recreation', enabled: false, at: 't1' } }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'DomainSetEnabled', payload: { domainId: 'recreation', enabled: true, at: 't2' } }),
    ]);
    const rec = rows.find((r) => r.id === 'recreation');
    expect(rec?.enabled).toBe(true);
    expect(rows).toHaveLength(11);
  });

  it('a disabled domain remains in the list', () => {
    const rows = projectDomains([
      evt({ eventType: 'DomainSetEnabled', payload: { domainId: 'community', enabled: false, at: 't1' } }),
    ]);
    const community = rows.find((r) => r.id === 'community');
    expect(community?.enabled).toBe(false);
    expect(rows).toHaveLength(11);
  });

  it('adds a custom domain (appended, enabled, custom)', () => {
    const rows = projectDomains([
      evt({ eventType: 'DomainAdded', payload: { domainId: 'volunteering-abc', name: 'Volunteering', at: 't1' } }),
    ]);
    expect(rows).toHaveLength(12);
    const custom = rows[rows.length - 1];
    expect(custom).toEqual({ id: 'volunteering-abc', name: 'Volunteering', enabled: true, custom: true });
  });

  it('ignores a rename/enable for an unknown domain id', () => {
    const rows = projectDomains([
      evt({ id: 'e1', eventSeq: 1, eventType: 'DomainRenamed', payload: { domainId: 'nope', name: 'X', at: 't1' } }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'DomainSetEnabled', payload: { domainId: 'nope', enabled: false, at: 't2' } }),
    ]);
    expect(rows).toHaveLength(11);
    expect(rows.find((r) => r.id === 'nope')).toBeUndefined();
  });

  it('does not duplicate a custom domain re-added with the same id', () => {
    const rows = projectDomains([
      evt({ id: 'e1', eventSeq: 1, eventType: 'DomainAdded', payload: { domainId: 'x', name: 'First', at: 't1' } }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'DomainAdded', payload: { domainId: 'x', name: 'Second', at: 't2' } }),
    ]);
    expect(rows.filter((r) => r.id === 'x')).toHaveLength(1);
    expect(rows.find((r) => r.id === 'x')?.name).toBe('First');
  });

  it('renames a custom domain added earlier', () => {
    const rows = projectDomains([
      evt({ id: 'e1', eventSeq: 1, eventType: 'DomainAdded', payload: { domainId: 'x', name: 'Side project', at: 't1' } }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'DomainRenamed', payload: { domainId: 'x', name: 'Startup', at: 't2' } }),
    ]);
    expect(rows.find((r) => r.id === 'x')?.name).toBe('Startup');
  });

  it('ignores malformed payloads (missing/wrong-typed fields)', () => {
    const rows = projectDomains([
      evt({ id: 'e1', eventSeq: 1, eventType: 'DomainSetEnabled', payload: { domainId: 'work', enabled: 'no', at: 't1' } }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'DomainAdded', payload: { domainId: 'y', at: 't2' } }),
    ]);
    expect(rows.find((r) => r.id === 'work')?.enabled).toBe(true);
    expect(rows.find((r) => r.id === 'y')).toBeUndefined();
  });

  it('ignores unrelated event types (default case)', () => {
    const rows = projectDomains([
      evt({ eventType: 'OnboardingStarted', payload: { startedAt: 't0' } }),
    ]);
    expect(rows).toHaveLength(11);
  });

  it('is independent of compensatesEventId (rebuild purity)', () => {
    const events: DomainEvent[] = [
      evt({ id: 'e1', eventSeq: 1, eventType: 'DomainAdded', payload: { domainId: 'x', name: 'Custom', at: 't1' } }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'DomainRenamed', payload: { domainId: 'health-fitness', name: 'Running', at: 't2' } }),
    ];
    const scrambled = events.map((e) => ({ ...e, compensatesEventId: 'nonsense' }));
    expect(projectDomains(scrambled)).toEqual(projectDomains(events));
  });
});
