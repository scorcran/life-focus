/**
 * The 45-minute proof — pure always-on replay (Story 2.6, AC-2).
 *
 * `buildOnboardingJourney()` emits the ordered, catalog-valid event stream a
 * full onboarding sitting produces. Every payload is validated against
 * `EVENT_CATALOG` (`validateEventPayload`) — the same schemas the store enforces
 * on every append — so the fixture cannot drift from the catalog event shapes a
 * server action is allowed to persist (it guards schema drift, not value drift).
 * The stream then runs
 * through every projection to assert the whole life model is queryable, the
 * sitting is within the ≤45-minute limit, and re-entry edits singletons in place
 * rather than duplicating entities. No Docker/Postgres — this proof is always on.
 *
 * The durable counterpart (`packages/db/src/ledger/onboarding-journey.test.ts`)
 * restates the same journey independently and appends it through the real
 * `LedgerStore`, so neither proof can drift from the other.
 */
import { describe, it, expect } from 'vitest';
import type { DomainEvent } from './events/types.js';
import { validateEventPayload } from './events/catalog.js';
import { DEFAULT_DOMAINS } from './projections/domains.js';
import { POLICY_TEMPLATE_IDS } from './projections/policies.js';
import { projectBoundaries } from './projections/boundaries.js';
import { projectDomains } from './projections/domains.js';
import { projectPolicyTemplates } from './projections/policies.js';
import { projectCommitments } from './projections/commitment.js';
import { projectPeople } from './projections/person.js';
import { projectGoals } from './projections/goal.js';
import { projectOnboarding, isOnboardingWithinSittingLimit } from './projections/onboarding.js';

/** T0: the moment the sitting begins. */
const T0 = '2026-07-14T09:00:00.000Z';
/** T0 + 40 minutes — the sitting completes within the ≤45-minute limit. */
const T_DONE = '2026-07-14T09:40:00.000Z';

/** One (eventType, payload) pair a sitting emits, before it is sequenced. */
interface JourneyStep {
  readonly eventType: string;
  readonly context: 'work' | 'personal' | 'joint';
  readonly payload: Record<string, unknown>;
}

/**
 * The ordered event stream a full onboarding sitting emits: start → boundaries →
 * one domain rename → policy accepted → 3 hard-commitment + 1 protected-priority
 * commitments → 5 people (each ≥1 important date + a rhythm) → 3 goals (each with
 * a next action + a weekly allocation) → 4 steps entered → completed @T0+40min.
 */
function buildOnboardingJourney(): readonly JourneyStep[] {
  const at = T0;
  const steps: JourneyStep[] = [];

  steps.push({
    eventType: 'OnboardingStarted',
    context: 'joint',
    payload: { startedAt: T0 },
  });

  steps.push({
    eventType: 'BoundariesSet',
    context: 'joint',
    payload: {
      workdayStart: '09:00',
      hardStop: '18:00',
      sleepStart: '23:00',
      sleepEnd: '07:00',
      updatedAt: at,
    },
  });

  // Rename a real default domain so the fold binds (count stays 11).
  steps.push({
    eventType: 'DomainRenamed',
    context: 'joint',
    payload: { domainId: DEFAULT_DOMAINS[0]!.id, name: 'Day job', at },
  });

  steps.push({
    eventType: 'PolicyTemplateAccepted',
    context: 'joint',
    payload: { templateId: POLICY_TEMPLATE_IDS[0], content: 'No meetings before 9am.', at },
  });

  // 3 hard-commitment commitments + 1 protected-priority item.
  const commitments = [
    { commitmentId: 'c-1', title: 'Weekly 1:1s', protectionLevel: 'hard-commitment' },
    { commitmentId: 'c-2', title: 'School run', protectionLevel: 'hard-commitment' },
    { commitmentId: 'c-3', title: 'Standup', protectionLevel: 'hard-commitment' },
    { commitmentId: 'c-4', title: 'Gym', protectionLevel: 'protected-priority' },
  ] as const;
  for (const c of commitments) {
    steps.push({
      eventType: 'CommitmentCaptured',
      context: 'work',
      payload: {
        commitmentId: c.commitmentId,
        title: c.title,
        context: 'work',
        status: 'captured',
        protectionLevel: c.protectionLevel,
        createdAt: at,
        updatedAt: at,
      },
    });
  }

  // 5 people, each with ≥1 important date and a weekly rhythm.
  for (let i = 1; i <= 5; i += 1) {
    steps.push({
      eventType: 'PersonAdded',
      context: 'personal',
      payload: {
        personId: `p-${i}`,
        name: `Person ${i}`,
        relationshipType: 'Friend',
        importance: 'close',
        intention: 'Stay in touch',
        importantDates: [{ label: 'Birthday', date: '03-14' }],
        context: 'personal',
        rhythm: { frequency: 'weekly', daysOfWeek: ['mon'] },
        createdAt: at,
        updatedAt: at,
      },
    });
  }

  // 3 goals, each with a next action and a weekly protected allocation.
  for (let i = 1; i <= 3; i += 1) {
    steps.push({
      eventType: 'GoalAdded',
      context: 'personal',
      payload: {
        goalId: `g-${i}`,
        title: `Goal ${i}`,
        nextAction: `First step ${i}`,
        allocation: { frequency: 'weekly', sessionsPerWeek: 3, minutesPerSession: 45 },
        context: 'personal',
        createdAt: at,
        updatedAt: at,
      },
    });
  }

  // The four canonical steps, each entered.
  for (const stepId of ['boundaries', 'commitments', 'people', 'goals'] as const) {
    steps.push({
      eventType: 'OnboardingStepCompleted',
      context: 'joint',
      payload: { stepId, mode: 'entered', at },
    });
  }

  steps.push({
    eventType: 'OnboardingCompleted',
    context: 'joint',
    payload: { completedAt: T_DONE },
  });

  return steps;
}

/** Materialize the journey as a persisted `DomainEvent[]`, one seq per step. */
function toDomainEvents(steps: readonly JourneyStep[]): DomainEvent[] {
  return steps.map((step, i) => ({
    id: `evt-${i + 1}`,
    eventSeq: i + 1,
    eventType: step.eventType,
    actor: 'user-1',
    context: step.context,
    causedBy: null,
    compensatesEventId: null,
    erasureScope: null,
    createdAt: T0,
    payload: step.payload,
  }));
}

describe('onboarding journey — 45-minute proof (pure replay, AC-2)', () => {
  const journey = buildOnboardingJourney();
  const events = toDomainEvents(journey);

  it('every event payload validates against EVENT_CATALOG (fixture cannot drift)', () => {
    for (const step of journey) {
      expect(() => validateEventPayload(step.eventType, step.payload)).not.toThrow();
    }
  });

  it('boundaries are set and queryable', () => {
    const boundaries = projectBoundaries(events);
    expect(boundaries).not.toBeNull();
    expect(boundaries?.hardStop).toBe('18:00');
  });

  it('the 11 default domains are present, renamed in place, count unchanged', () => {
    const domains = projectDomains(events);
    expect(domains).toHaveLength(DEFAULT_DOMAINS.length);
    expect(domains).toHaveLength(11);
    expect(domains.find((d) => d.id === DEFAULT_DOMAINS[0]!.id)?.name).toBe('Day job');
    // No custom domains were added — every row is a default.
    expect(domains.every((d) => d.custom === false)).toBe(true);
  });

  it('at least one starter policy template is accepted', () => {
    const policies = projectPolicyTemplates(events);
    const accepted = policies.filter((p) => p.status === 'accepted');
    expect(accepted.length).toBeGreaterThanOrEqual(1);
    expect(accepted[0]?.content).toBe('No meetings before 9am.');
  });

  it('≥3 hard-commitment commitments and ≥1 protected-priority item are queryable', () => {
    const commitments = projectCommitments(events);
    const hard = commitments.filter((c) => c.protectionLevel === 'hard-commitment');
    const protectedPriority = commitments.filter((c) => c.protectionLevel === 'protected-priority');
    expect(hard.length).toBeGreaterThanOrEqual(3);
    expect(protectedPriority.length).toBeGreaterThanOrEqual(1);
  });

  it('≥5 people are present, each with ≥1 important date and a communication rhythm', () => {
    const people = projectPeople(events);
    expect(people.length).toBeGreaterThanOrEqual(5);
    for (const person of people) {
      expect(person.importantDates.length).toBeGreaterThanOrEqual(1);
      expect(person.rhythm).not.toBeNull();
      expect(person.rhythm?.frequency).toBe('weekly');
    }
  });

  it('3 goals are present, each with a next action and a protected-priority weekly allocation', () => {
    const goals = projectGoals(events);
    expect(goals).toHaveLength(3);
    for (const goal of goals) {
      expect(goal.nextAction.length).toBeGreaterThan(0);
      expect(goal.allocation.protectionLevel).toBe('protected-priority');
      expect(goal.allocation.frequency).toBe('weekly');
    }
  });

  it('the sitting is within the ≤45-minute limit', () => {
    const progress = projectOnboarding(events);
    expect(progress.started).toBe(true);
    expect(progress.completed).toBe(true);
    expect(isOnboardingWithinSittingLimit(progress)).toBe(true);
  });

  it('an over-limit sitting (completed T0+46min) is reported over the limit end-to-end', () => {
    // Same journey, but completion lands one minute past the limit: the proof
    // must flip false through the full projection path, not only in unit tests.
    const overLimit = toDomainEvents([
      ...journey.slice(0, -1),
      { eventType: 'OnboardingCompleted', context: 'joint', payload: { completedAt: '2026-07-14T09:46:00.000Z' } },
    ]);
    expect(isOnboardingWithinSittingLimit(projectOnboarding(overLimit))).toBe(false);
  });

  it('re-entry edits singletons in place and duplicates no entities', () => {
    // Re-enter setup: a second OnboardingStarted (new time), a second
    // BoundariesSet (new values), and a repeat OnboardingStepCompleted.
    const reentry: DomainEvent[] = [
      ...events,
      {
        id: 'evt-re-1',
        eventSeq: events.length + 1,
        eventType: 'OnboardingStarted',
        actor: 'user-1',
        context: 'joint',
        causedBy: null,
        compensatesEventId: null,
        erasureScope: null,
        createdAt: T_DONE,
        payload: { startedAt: '2026-07-14T12:00:00.000Z' },
      },
      {
        id: 'evt-re-2',
        eventSeq: events.length + 2,
        eventType: 'BoundariesSet',
        actor: 'user-1',
        context: 'joint',
        causedBy: null,
        compensatesEventId: null,
        erasureScope: null,
        createdAt: T_DONE,
        payload: {
          workdayStart: '08:00',
          hardStop: '17:00',
          sleepStart: '22:30',
          sleepEnd: '06:30',
          updatedAt: '2026-07-14T12:00:00.000Z',
        },
      },
      {
        id: 'evt-re-3',
        eventSeq: events.length + 3,
        eventType: 'OnboardingStepCompleted',
        actor: 'user-1',
        context: 'joint',
        causedBy: null,
        compensatesEventId: null,
        erasureScope: null,
        createdAt: T_DONE,
        payload: { stepId: 'boundaries', mode: 'skipped', at: '2026-07-14T12:00:00.000Z' },
      },
      // Re-add an EXISTING person id with edited fields: id-keyed streams must
      // last-win in place, not duplicate the row. This is the actual
      // edit-not-duplicate guarantee for entity streams (not just singletons).
      {
        id: 'evt-re-4',
        eventSeq: events.length + 4,
        eventType: 'PersonAdded',
        actor: 'user-1',
        context: 'personal',
        causedBy: null,
        compensatesEventId: null,
        erasureScope: null,
        createdAt: T_DONE,
        payload: {
          personId: 'p-1',
          name: 'Person One (edited)',
          relationshipType: 'Friend',
          importance: 'close',
          intention: 'Reconnect',
          importantDates: [{ label: 'Birthday', date: '03-14' }],
          context: 'personal',
          rhythm: { frequency: 'weekly', daysOfWeek: ['mon'] },
          createdAt: T0,
          updatedAt: '2026-07-14T12:00:00.000Z',
        },
      },
    ];

    const progress = projectOnboarding(reentry);
    // OnboardingStarted is first-wins: startedAt is unchanged, so the sitting
    // clock never restarts on re-entry and the ≤45-minute verdict still holds.
    expect(progress.startedAt).toBe(T0);
    expect(isOnboardingWithinSittingLimit(progress)).toBe(true);
    // The step is latest-wins: 'entered' → 'skipped'.
    expect(progress.steps.boundaries).toEqual({
      mode: 'skipped',
      at: '2026-07-14T12:00:00.000Z',
    });

    // Boundaries are latest-wins — a single singleton with the new values.
    expect(projectBoundaries(reentry)?.hardStop).toBe('17:00');

    // Entity counts are unchanged — re-projection duplicates nothing, even
    // though p-1 was re-added: the id-keyed stream edits it in place.
    expect(projectCommitments(reentry)).toHaveLength(projectCommitments(events).length);
    const peopleAfter = projectPeople(reentry);
    expect(peopleAfter).toHaveLength(projectPeople(events).length);
    expect(peopleAfter.find((p) => p.id === 'p-1')?.name).toBe('Person One (edited)');
    expect(projectGoals(reentry)).toHaveLength(projectGoals(events).length);
    expect(projectDomains(reentry)).toHaveLength(11);
  });
});
