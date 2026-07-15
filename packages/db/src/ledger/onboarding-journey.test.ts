/**
 * The 45-minute proof — durable, Postgres-gated replay (Story 2.6, AC-2).
 *
 * Appends the full onboarding sitting through the real `LedgerStore`, re-reads
 * the ordered event stream, and re-projects it — proving the whole life model
 * survives encrypt-at-rest / decrypt-on-read with every entity queryable and the
 * ≤45-minute verdict true. Then re-enters setup (a second `OnboardingStarted`,
 * `BoundariesSet`, and a repeat `OnboardingStepCompleted`) and asserts
 * edit-not-duplicate on the singletons with unchanged entity counts.
 *
 * The journey is restated independently here (not shared with the pure proof)
 * and every payload is validated against `EVENT_CATALOG` on read, so neither
 * proof can drift from the shapes the onboarding server actions emit. Mirrors the
 * `store.test.ts` harness: `startPg`, `pgAvailable`, `MASTER_KEY`,
 * `describe.skipIf(!hasPg)`, `beforeAll`/`afterAll`.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createDbClient, closeDb } from '../index.js';
import {
  validateEventPayload,
  projectBoundaries,
  projectDomains,
  projectPolicyTemplates,
  projectCommitments,
  projectPeople,
  projectGoals,
  projectOnboarding,
  isOnboardingWithinSittingLimit,
  DEFAULT_DOMAINS,
  POLICY_TEMPLATE_IDS,
  type AppendEventInput,
  type LedgerStore,
  type DomainEvent,
} from '@life-focus/ledger';
import { createLedgerStore } from './store.js';
import { startPg, pgAvailable, type PgHarness } from '../../test/pg.js';

const MASTER_KEY = Buffer.alloc(32, 11).toString('base64');

// The journey's own entity ids. Assertions are scoped to these because the
// ledger table is append-only and cannot be truncated (the insert-only trigger
// blocks DELETE), so under a shared `TEST_DATABASE_URL` this suite reads rows
// that sibling suites (e.g. store.test.ts) also appended. Scoping by id keeps
// the proof about THIS journey, matching store.test.ts's id-based discipline.
const JOURNEY_COMMITMENT_IDS = ['c-1', 'c-2', 'c-3', 'c-4'];
const JOURNEY_PERSON_IDS = ['p-1', 'p-2', 'p-3', 'p-4', 'p-5'];
const JOURNEY_GOAL_IDS = ['g-1', 'g-2', 'g-3'];

/** T0: the moment the sitting begins. */
const T0 = '2026-07-14T09:00:00.000Z';
/** T0 + 40 minutes — the sitting completes within the ≤45-minute limit. */
const T_DONE = '2026-07-14T09:40:00.000Z';

/**
 * The ordered event stream a full onboarding sitting emits, as `LedgerStore`
 * append inputs (sensitive person/goal events carry an explicit erasure scope,
 * matching the onboarding actions). Restated independently of the pure proof.
 */
function buildOnboardingJourney(): readonly AppendEventInput[] {
  const at = T0;
  const inputs: AppendEventInput[] = [];

  inputs.push({
    eventType: 'OnboardingStarted',
    actor: 'user-1',
    context: 'joint',
    payload: { startedAt: T0 },
  });

  inputs.push({
    eventType: 'BoundariesSet',
    actor: 'user-1',
    context: 'joint',
    payload: {
      workdayStart: '09:00',
      hardStop: '18:00',
      sleepStart: '23:00',
      sleepEnd: '07:00',
      updatedAt: at,
    },
  });

  inputs.push({
    eventType: 'DomainRenamed',
    actor: 'user-1',
    context: 'joint',
    payload: { domainId: DEFAULT_DOMAINS[0]!.id, name: 'Day job', at },
  });

  inputs.push({
    eventType: 'PolicyTemplateAccepted',
    actor: 'user-1',
    context: 'joint',
    payload: { templateId: POLICY_TEMPLATE_IDS[0], content: 'No meetings before 9am.', at },
  });

  const commitments = [
    { commitmentId: 'c-1', title: 'Weekly 1:1s', protectionLevel: 'hard-commitment' },
    { commitmentId: 'c-2', title: 'School run', protectionLevel: 'hard-commitment' },
    { commitmentId: 'c-3', title: 'Standup', protectionLevel: 'hard-commitment' },
    { commitmentId: 'c-4', title: 'Gym', protectionLevel: 'protected-priority' },
  ] as const;
  for (const c of commitments) {
    inputs.push({
      eventType: 'CommitmentCaptured',
      actor: 'user-1',
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

  for (let i = 1; i <= 5; i += 1) {
    const personId = `p-${i}`;
    inputs.push({
      eventType: 'PersonAdded',
      actor: 'user-1',
      context: 'personal',
      erasureScope: `person:${personId}`,
      payload: {
        personId,
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

  for (let i = 1; i <= 3; i += 1) {
    const goalId = `g-${i}`;
    inputs.push({
      eventType: 'GoalAdded',
      actor: 'user-1',
      context: 'personal',
      erasureScope: `goal:${goalId}`,
      payload: {
        goalId,
        title: `Goal ${i}`,
        nextAction: `First step ${i}`,
        allocation: { frequency: 'weekly', sessionsPerWeek: 3, minutesPerSession: 45 },
        context: 'personal',
        createdAt: at,
        updatedAt: at,
      },
    });
  }

  for (const stepId of ['boundaries', 'commitments', 'people', 'goals'] as const) {
    inputs.push({
      eventType: 'OnboardingStepCompleted',
      actor: 'user-1',
      context: 'joint',
      payload: { stepId, mode: 'entered', at },
    });
  }

  inputs.push({
    eventType: 'OnboardingCompleted',
    actor: 'user-1',
    context: 'joint',
    payload: { completedAt: T_DONE },
  });

  return inputs;
}

// Integration suite: runs when Docker or TEST_DATABASE_URL is available.
const hasPg = await pgAvailable();

describe.skipIf(!hasPg)('onboarding journey — 45-minute proof (Postgres durable replay, AC-2)', () => {
  let harness: PgHarness;
  let client: ReturnType<typeof createDbClient>;
  let store: LedgerStore;

  beforeAll(async () => {
    harness = await startPg();
    client = createDbClient(harness.connectionString);
    store = createLedgerStore(client, { masterKey: MASTER_KEY });

    // Append the whole sitting through the real store (validate + encrypt + persist).
    for (const input of buildOnboardingJourney()) {
      await store.append(input);
    }
  }, 120_000);

  afterAll(async () => {
    if (client) await closeDb(client.pool);
    if (harness) await harness.teardown();
  }, 60_000);

  it('every persisted event payload re-validates against EVENT_CATALOG (no drift through storage)', async () => {
    const events = await store.readEvents();
    for (const event of events) {
      expect(() => validateEventPayload(event.eventType, event.payload)).not.toThrow();
    }
  });

  it('the whole life model survives persistence + encryption and is queryable', async () => {
    const events = await store.readEvents();

    expect(projectBoundaries(events)?.hardStop).toBe('18:00');

    const domains = projectDomains(events);
    expect(domains).toHaveLength(11);
    expect(domains.find((d) => d.id === DEFAULT_DOMAINS[0]!.id)?.name).toBe('Day job');

    const accepted = projectPolicyTemplates(events).filter((p) => p.status === 'accepted');
    expect(accepted.length).toBeGreaterThanOrEqual(1);
    expect(accepted[0]?.content).toBe('No meetings before 9am.');

    const commitments = projectCommitments(events).filter((c) =>
      JOURNEY_COMMITMENT_IDS.includes(c.id),
    );
    expect(commitments.filter((c) => c.protectionLevel === 'hard-commitment')).toHaveLength(3);
    // ≥1 protected priority is satisfied by a distinct commitment (c-4), not by
    // the goals' by-construction allocations — assert it explicitly by id.
    expect(commitments.find((c) => c.id === 'c-4')?.protectionLevel).toBe('protected-priority');

    const people = projectPeople(events).filter((p) => JOURNEY_PERSON_IDS.includes(p.id));
    expect(people).toHaveLength(5);
    for (const person of people) {
      // Sensitive name round-trips through encrypt-at-rest → decrypt-on-read.
      expect(person.name.startsWith('Person ')).toBe(true);
      expect(person.importantDates.length).toBeGreaterThanOrEqual(1);
      expect(person.rhythm).not.toBeNull();
    }

    const goals = projectGoals(events).filter((g) => JOURNEY_GOAL_IDS.includes(g.id));
    expect(goals).toHaveLength(3);
    for (const goal of goals) {
      // Sensitive title/nextAction round-trip through decrypt-on-read.
      expect(goal.title.startsWith('Goal ')).toBe(true);
      expect(goal.nextAction.length).toBeGreaterThan(0);
      expect(goal.allocation.protectionLevel).toBe('protected-priority');
    }
  });

  it('the persisted sitting is within the ≤45-minute limit', async () => {
    const events = await store.readEvents();
    const progress = projectOnboarding(events);
    expect(progress.started).toBe(true);
    expect(progress.completed).toBe(true);
    expect(isOnboardingWithinSittingLimit(progress)).toBe(true);
  });

  it('re-entry edits singletons and entities in place and duplicates nothing (durable)', async () => {
    // Journey-scoped baseline counts (append-only shared DB may hold sibling rows).
    const before = await store.readEvents();
    const journeyGoalsBefore = projectGoals(before).filter((g) =>
      JOURNEY_GOAL_IDS.includes(g.id),
    ).length;

    // Re-enter setup: new OnboardingStarted (new time), new BoundariesSet (new
    // values), a repeat OnboardingStepCompleted (entered → skipped), and — the
    // real entity-stream test — a repeat PersonAdded for an EXISTING id (p-1)
    // with edited fields, which must last-win in place rather than duplicate.
    const reentry: readonly AppendEventInput[] = [
      {
        eventType: 'OnboardingStarted',
        actor: 'user-1',
        context: 'joint',
        payload: { startedAt: '2026-07-14T12:00:00.000Z' },
      },
      {
        eventType: 'BoundariesSet',
        actor: 'user-1',
        context: 'joint',
        payload: {
          workdayStart: '08:00',
          hardStop: '17:00',
          sleepStart: '22:30',
          sleepEnd: '06:30',
          updatedAt: '2026-07-14T12:00:00.000Z',
        },
      },
      {
        eventType: 'OnboardingStepCompleted',
        actor: 'user-1',
        context: 'joint',
        payload: { stepId: 'boundaries', mode: 'skipped', at: '2026-07-14T12:00:00.000Z' },
      },
      {
        eventType: 'PersonAdded',
        actor: 'user-1',
        context: 'personal',
        erasureScope: 'person:p-1',
        payload: {
          personId: 'p-1',
          name: 'Person 1 (edited)',
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
    for (const input of reentry) {
      await store.append(input);
    }

    const after: readonly DomainEvent[] = await store.readEvents();
    const progress = projectOnboarding(after);

    // OnboardingStarted is first-wins: startedAt is unchanged, sitting still ≤45.
    expect(progress.startedAt).toBe(T0);
    expect(isOnboardingWithinSittingLimit(progress)).toBe(true);

    // Boundaries + step are latest-wins singletons with the new values.
    expect(projectBoundaries(after)?.hardStop).toBe('17:00');
    expect(progress.steps.boundaries).toEqual({
      mode: 'skipped',
      at: '2026-07-14T12:00:00.000Z',
    });

    // The id-keyed people stream edited p-1 in place: still 5 journey people,
    // and p-1 now carries the edited name — re-entry edits rather than duplicates.
    const peopleAfter = projectPeople(after).filter((p) => JOURNEY_PERSON_IDS.includes(p.id));
    expect(peopleAfter).toHaveLength(5);
    expect(peopleAfter.find((p) => p.id === 'p-1')?.name).toBe('Person 1 (edited)');
    // Goals were not re-touched and did not duplicate.
    expect(projectGoals(after).filter((g) => JOURNEY_GOAL_IDS.includes(g.id))).toHaveLength(
      journeyGoalsBefore,
    );
    expect(projectDomains(after)).toHaveLength(11);
  });
});
