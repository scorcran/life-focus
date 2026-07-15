import { describe, it, expect } from 'vitest';
import {
  validateEventPayload,
  sensitiveFieldsFor,
  isKnownEventType,
  UnknownEventTypeError,
  InvalidEventPayloadError,
  reduceCommitment,
  projectCommitments,
  buildUndoEvent,
  UndoNotSupportedError,
  PROTECTION_LEVELS,
  protectionLevelEnum,
  WEEKDAYS,
  weekdayEnum,
  commitmentRecurrenceSchema,
  PERSON_IMPORTANCE,
  personImportanceEnum,
  personContextEnum,
  importantDateSchema,
  rhythmCadenceSchema,
  reducePerson,
  projectPeople,
  goalContextEnum,
  goalAllocationSchema,
  reduceGoal,
  projectGoals,
  type DomainEvent,
  type AppendEventInput,
  type ProtectionLevel,
  type Weekday,
  type CommitmentRecurrence,
  type PersonImportance,
  type PersonContext,
  type ImportantDate,
  type RhythmCadence,
  type PersonRow,
  type GoalContext,
  type GoalAllocation,
  type GoalRow,
} from './index.js';

/** Build a persisted DomainEvent for reducer/undo tests. */
function evt(overrides: Partial<DomainEvent> & Pick<DomainEvent, 'eventType' | 'payload'>): DomainEvent {
  return {
    id: overrides.id ?? 'evt-1',
    eventSeq: overrides.eventSeq ?? 1,
    actor: overrides.actor ?? 'user-1',
    context: overrides.context ?? 'work',
    causedBy: overrides.causedBy ?? null,
    compensatesEventId: overrides.compensatesEventId ?? null,
    erasureScope: overrides.erasureScope ?? null,
    createdAt: overrides.createdAt ?? '2026-07-13T00:00:00.000Z',
    ...overrides,
  };
}

const capturedPayload = {
  commitmentId: 'c-1',
  title: 'Ship the ledger',
  context: 'work',
  status: 'captured',
  protectionLevel: 'hard-commitment',
  createdAt: '2026-07-13T00:00:00.000Z',
  updatedAt: '2026-07-13T00:00:00.000Z',
};

describe('catalog validation', () => {
  it('validates a CommitmentCaptured payload and applies defaults', () => {
    const parsed = validateEventPayload('CommitmentCaptured', {
      commitmentId: 'c-1',
      title: 'Ship it',
      context: 'work',
      protectionLevel: 'hard-commitment',
      createdAt: '2026-07-13T00:00:00.000Z',
      updatedAt: '2026-07-13T00:00:00.000Z',
    });
    expect(parsed.status).toBe('captured'); // default applied
    expect(parsed.title).toBe('Ship it');
    expect(parsed.protectionLevel).toBe('hard-commitment');
  });

  it('rejects a CommitmentCaptured with a missing or unknown protection level', () => {
    // Missing → no untagged item can be created.
    expect(() =>
      validateEventPayload('CommitmentCaptured', {
        commitmentId: 'c-1',
        title: 'Ship it',
        context: 'work',
        createdAt: '2026-07-13T00:00:00.000Z',
        updatedAt: '2026-07-13T00:00:00.000Z',
      }),
    ).toThrow(InvalidEventPayloadError);
    // Unknown level → rejected.
    expect(() =>
      validateEventPayload('CommitmentCaptured', {
        commitmentId: 'c-1',
        title: 'Ship it',
        context: 'work',
        protectionLevel: 'someday-maybe',
        createdAt: '2026-07-13T00:00:00.000Z',
        updatedAt: '2026-07-13T00:00:00.000Z',
      }),
    ).toThrow(InvalidEventPayloadError);
  });

  it('validates an optional weekly recurrence and rejects an empty weekly rule', () => {
    const parsed = validateEventPayload('CommitmentCaptured', {
      ...capturedPayload,
      recurrence: { frequency: 'weekly', daysOfWeek: ['thu'] },
    });
    expect(parsed.recurrence).toEqual({ frequency: 'weekly', daysOfWeek: ['thu'] });

    // A weekly rule with zero days is invalid (avoid an empty weekly rule).
    expect(() =>
      validateEventPayload('CommitmentCaptured', {
        ...capturedPayload,
        recurrence: { frequency: 'weekly', daysOfWeek: [] },
      }),
    ).toThrow(InvalidEventPayloadError);
  });

  it('re-exports the protection-level and weekday constants/enums/schemas', () => {
    expect(PROTECTION_LEVELS).toEqual([
      'hard-commitment',
      'protected-priority',
      'flexible-intention',
      'optional-opportunity',
    ]);
    expect(WEEKDAYS).toEqual(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
    expect(protectionLevelEnum.parse('hard-commitment')).toBe('hard-commitment');
    expect(weekdayEnum.parse('thu')).toBe('thu');
    expect(
      commitmentRecurrenceSchema.parse({ frequency: 'weekly', daysOfWeek: ['thu'] }),
    ).toEqual({ frequency: 'weekly', daysOfWeek: ['thu'] });
    // Inferred types resolve (compile-time surface).
    const level: ProtectionLevel = 'protected-priority';
    const day: Weekday = 'fri';
    const rule: CommitmentRecurrence = { frequency: 'weekly', daysOfWeek: [day] };
    expect(level).toBe('protected-priority');
    expect(rule.daysOfWeek).toContain('fri');
  });

  it('validates a PersonAdded payload with an optional rhythm and importance (Story 2.4)', () => {
    const parsed = validateEventPayload('PersonAdded', {
      personId: 'p-1',
      name: 'Mom',
      relationshipType: 'Parent',
      importance: 'inner-circle',
      context: 'personal',
      rhythm: { frequency: 'weekly', daysOfWeek: [] },
      importantDates: [{ label: 'Birthday', date: '03-14' }],
      createdAt: '2026-07-14T00:00:00.000Z',
      updatedAt: '2026-07-14T00:00:00.000Z',
    });
    expect(parsed.importance).toBe('inner-circle');
    // Empty weekday set is allowed for a rhythm (flexible weekly window).
    expect(parsed.rhythm).toEqual({ frequency: 'weekly', daysOfWeek: [] });

    // Missing importance → rejected (no untagged person).
    expect(() =>
      validateEventPayload('PersonAdded', {
        personId: 'p-1',
        name: 'Mom',
        relationshipType: 'Parent',
        context: 'personal',
        createdAt: '2026-07-14T00:00:00.000Z',
        updatedAt: '2026-07-14T00:00:00.000Z',
      }),
    ).toThrow(InvalidEventPayloadError);

    // A joint context is illegal on a person (AD-5).
    expect(() =>
      validateEventPayload('PersonAdded', {
        personId: 'p-1',
        name: 'Mom',
        relationshipType: 'Parent',
        importance: 'close',
        context: 'joint',
        createdAt: '2026-07-14T00:00:00.000Z',
        updatedAt: '2026-07-14T00:00:00.000Z',
      }),
    ).toThrow(InvalidEventPayloadError);
  });

  it('re-exports the person constants/enums/schemas + projection and declares name/intention sensitive', () => {
    expect(PERSON_IMPORTANCE).toEqual(['inner-circle', 'close', 'wider-circle']);
    expect(personImportanceEnum.parse('close')).toBe('close');
    expect(personContextEnum.parse('work')).toBe('work');
    expect(importantDateSchema.parse({ label: 'Birthday', date: '03-14' })).toEqual({
      label: 'Birthday',
      date: '03-14',
    });
    // A leap-day birthday is valid even as a bare MM-DD (no year to check).
    expect(importantDateSchema.safeParse({ label: 'Leap', date: '02-29' }).success).toBe(true);
    // Impossible calendar dates are rejected — the shape regex is not enough.
    for (const bad of ['13-45', '02-31', '04-31', '99-99', '00-00', '2026-02-30']) {
      expect(importantDateSchema.safeParse({ label: 'x', date: bad }).success).toBe(false);
    }
    expect(rhythmCadenceSchema.parse({ frequency: 'weekly', daysOfWeek: [] })).toEqual({
      frequency: 'weekly',
      daysOfWeek: [],
    });
    expect(sensitiveFieldsFor('PersonAdded')).toEqual(['name', 'intention']);
    expect(sensitiveFieldsFor('PersonAddUndone')).toEqual([]);

    // Projection fns resolve and fold a person.
    const rows = projectPeople([
      {
        id: 'e1',
        eventSeq: 1,
        eventType: 'PersonAdded',
        actor: 'u',
        context: 'personal',
        causedBy: null,
        compensatesEventId: null,
        erasureScope: null,
        createdAt: '2026-07-14T00:00:00.000Z',
        payload: {
          personId: 'p-1',
          name: 'Mom',
          relationshipType: 'Parent',
          importance: 'inner-circle',
          context: 'personal',
          createdAt: '2026-07-14T00:00:00.000Z',
          updatedAt: '2026-07-14T00:00:00.000Z',
        },
      },
    ]);
    const row: PersonRow | undefined = rows[0];
    expect(row?.id).toBe('p-1');
    expect(reducePerson(row ?? null, {
      id: 'e2',
      eventSeq: 2,
      eventType: 'PersonAddUndone',
      actor: 'u',
      context: 'personal',
      causedBy: null,
      compensatesEventId: 'e1',
      erasureScope: null,
      createdAt: '2026-07-14T00:00:00.000Z',
      payload: { personId: 'p-1' },
    })).toBeNull();

    // Inferred types resolve (compile-time surface); no score type exists.
    const importance: PersonImportance = 'wider-circle';
    const ctx: PersonContext = 'work';
    const date: ImportantDate = { label: 'Anniversary', date: '2026-06-01' };
    const cadence: RhythmCadence = { frequency: 'weekly', daysOfWeek: ['mon'] };
    expect(importance).toBe('wider-circle');
    expect(ctx).toBe('work');
    expect(date.label).toBe('Anniversary');
    expect(cadence.daysOfWeek).toContain('mon');
  });

  it('validates a GoalAdded payload and rejects bad allocation/context (Story 2.5)', () => {
    const parsed = validateEventPayload('GoalAdded', {
      goalId: 'g-1',
      title: 'Learn to paint',
      nextAction: 'Buy a starter set',
      allocation: { frequency: 'weekly', sessionsPerWeek: 3, minutesPerSession: 45 },
      context: 'personal',
      createdAt: '2026-07-14T00:00:00.000Z',
      updatedAt: '2026-07-14T00:00:00.000Z',
    });
    expect(parsed.allocation).toEqual({ frequency: 'weekly', sessionsPerWeek: 3, minutesPerSession: 45 });

    // A joint context is illegal on a goal (AD-5).
    expect(() =>
      validateEventPayload('GoalAdded', {
        goalId: 'g-1',
        title: 'x',
        nextAction: 'y',
        allocation: { frequency: 'weekly', sessionsPerWeek: 3, minutesPerSession: 45 },
        context: 'joint',
        createdAt: '2026-07-14T00:00:00.000Z',
        updatedAt: '2026-07-14T00:00:00.000Z',
      }),
    ).toThrow(InvalidEventPayloadError);

    // Out-of-range / non-integer allocation is rejected.
    expect(() =>
      validateEventPayload('GoalAdded', {
        goalId: 'g-1',
        title: 'x',
        nextAction: 'y',
        allocation: { frequency: 'weekly', sessionsPerWeek: 8, minutesPerSession: 45 },
        context: 'personal',
        createdAt: '2026-07-14T00:00:00.000Z',
        updatedAt: '2026-07-14T00:00:00.000Z',
      }),
    ).toThrow(InvalidEventPayloadError);
  });

  it('re-exports the goal enums/schemas + projection and declares title/nextAction sensitive', () => {
    expect(goalContextEnum.parse('work')).toBe('work');
    expect(goalContextEnum.safeParse('joint').success).toBe(false);
    expect(
      goalAllocationSchema.parse({ frequency: 'weekly', sessionsPerWeek: 3, minutesPerSession: 45 }),
    ).toEqual({ frequency: 'weekly', sessionsPerWeek: 3, minutesPerSession: 45 });
    expect(sensitiveFieldsFor('GoalAdded')).toEqual(['title', 'nextAction']);
    expect(sensitiveFieldsFor('GoalAddUndone')).toEqual([]);
    expect(sensitiveFieldsFor('GoalAllocationDisplaced')).toEqual([]);

    // Projection fns resolve and fold a goal + a displacement.
    const rows = projectGoals([
      {
        id: 'e1',
        eventSeq: 1,
        eventType: 'GoalAdded',
        actor: 'u',
        context: 'personal',
        causedBy: null,
        compensatesEventId: null,
        erasureScope: null,
        createdAt: '2026-07-14T00:00:00.000Z',
        payload: {
          goalId: 'g-1',
          title: 'Learn to paint',
          nextAction: 'Buy a starter set',
          allocation: { frequency: 'weekly', sessionsPerWeek: 3, minutesPerSession: 45 },
          context: 'personal',
          createdAt: '2026-07-14T00:00:00.000Z',
          updatedAt: '2026-07-14T00:00:00.000Z',
        },
      },
    ]);
    const row: GoalRow | undefined = rows[0];
    expect(row?.id).toBe('g-1');
    expect(row?.allocation.protectionLevel).toBe('protected-priority');
    expect(
      reduceGoal(row ?? null, {
        id: 'e2',
        eventSeq: 2,
        eventType: 'GoalAddUndone',
        actor: 'u',
        context: 'personal',
        causedBy: null,
        compensatesEventId: 'e1',
        erasureScope: null,
        createdAt: '2026-07-14T00:00:00.000Z',
        payload: { goalId: 'g-1' },
      }),
    ).toBeNull();

    // Inferred types resolve (compile-time surface); no score type exists.
    const ctx: GoalContext = 'work';
    const alloc: GoalAllocation = { frequency: 'weekly', sessionsPerWeek: 2, minutesPerSession: 30 };
    expect(ctx).toBe('work');
    expect(alloc.sessionsPerWeek).toBe(2);
  });

  it('rejects an unknown event type', () => {
    expect(() => validateEventPayload('NopeEvent', {})).toThrow(UnknownEventTypeError);
    expect(isKnownEventType('NopeEvent')).toBe(false);
    expect(isKnownEventType('CommitmentCaptured')).toBe(true);
  });

  it('rejects an invalid payload', () => {
    expect(() => validateEventPayload('CommitmentCaptured', { title: 123 }))
      .toThrow(InvalidEventPayloadError);
  });

  it('declares `title` sensitive on CommitmentCaptured and nothing on audit', () => {
    expect(sensitiveFieldsFor('CommitmentCaptured')).toEqual(['title']);
    expect(sensitiveFieldsFor('CrossContextAccessAudited')).toEqual([]);
    expect(sensitiveFieldsFor('NopeEvent')).toEqual([]);
  });
});

describe('calendar sync-health events (Story 1.4, AD-4/AD-7)', () => {
  it('validates CalendarConnected with an immutable context (AD-6)', () => {
    const parsed = validateEventPayload('CalendarConnected', {
      sourceId: 's-1',
      provider: 'gcal',
      account: 'me@example.com',
      context: 'work',
      googleCalendarId: 'primary',
    });
    expect(parsed.context).toBe('work');
    expect(parsed.provider).toBe('gcal');
  });

  it('validates CalendarSynced and CalendarSyncFailed payloads', () => {
    const synced = validateEventPayload('CalendarSynced', {
      sourceId: 's-1',
      context: 'personal',
      syncType: 'initial',
      eventCount: 3,
      syncedAt: '2026-07-14T00:00:00.000Z',
    });
    expect(synced.syncType).toBe('initial');

    const failed = validateEventPayload('CalendarSyncFailed', {
      sourceId: 's-1',
      context: 'personal',
      authError: true,
      reason: 'invalid_grant',
      failedAt: '2026-07-14T00:00:00.000Z',
    });
    expect(failed.authError).toBe(true);
  });

  it('rejects a CalendarConnected with a bad provider or missing context', () => {
    expect(() =>
      validateEventPayload('CalendarConnected', {
        sourceId: 's-1',
        provider: 'gmail',
        account: 'me@example.com',
        context: 'work',
        googleCalendarId: 'primary',
      }),
    ).toThrow(InvalidEventPayloadError);
    expect(() =>
      validateEventPayload('CalendarSynced', {
        sourceId: 's-1',
        context: 'work',
        syncType: 'weekly',
        eventCount: 0,
        syncedAt: '2026-07-14T00:00:00.000Z',
      }),
    ).toThrow(InvalidEventPayloadError);
  });

  it('rejects a joint context on a calendar source event (AD-5: no joint on source rows)', () => {
    expect(() =>
      validateEventPayload('CalendarConnected', {
        sourceId: 's-1',
        provider: 'gcal',
        account: 'me@example.com',
        context: 'joint',
        googleCalendarId: 'primary',
      }),
    ).toThrow(InvalidEventPayloadError);
  });

  it('declares no sensitive fields on any calendar event (tokens never in the log)', () => {
    expect(sensitiveFieldsFor('CalendarConnected')).toEqual([]);
    expect(sensitiveFieldsFor('CalendarSynced')).toEqual([]);
    expect(sensitiveFieldsFor('CalendarSyncFailed')).toEqual([]);
  });
});

describe('commitment reducer purity', () => {
  it('CommitmentCaptured creates a row; CommitmentCaptureUndone removes it', () => {
    const captured = evt({ eventType: 'CommitmentCaptured', payload: capturedPayload });
    const row = reduceCommitment(null, captured);
    expect(row).not.toBeNull();
    expect(row?.id).toBe('c-1');
    expect(row?.title).toBe('Ship the ledger');

    const undone = evt({
      eventType: 'CommitmentCaptureUndone',
      payload: { commitmentId: 'c-1' },
      compensatesEventId: 'evt-1',
    });
    expect(reduceCommitment(row, undone)).toBeNull();
  });

  it('ignores unrelated event types (leaves current untouched)', () => {
    const row = reduceCommitment(null, evt({ eventType: 'CommitmentCaptured', payload: capturedPayload }));
    const audit = evt({
      eventType: 'CrossContextAccessAudited',
      payload: { sourceContext: 'work', targetContext: 'personal', allowed: false },
    });
    expect(reduceCommitment(row, audit)).toBe(row);
  });

  it('rebuild-from-events ignores compensatesEventId (undo purity)', () => {
    const events: DomainEvent[] = [
      evt({ id: 'e1', eventSeq: 1, eventType: 'CommitmentCaptured', payload: capturedPayload }),
      evt({
        id: 'e2',
        eventSeq: 2,
        eventType: 'CommitmentCaptureUndone',
        payload: { commitmentId: 'c-1' },
        compensatesEventId: 'e1',
      }),
    ];
    // Full rebuild removes the row.
    expect(projectCommitments(events)).toEqual([]);

    // Scrambling / clearing compensatesEventId must not change the result.
    const scrambled = events.map((e) => ({ ...e, compensatesEventId: null }));
    expect(projectCommitments(scrambled)).toEqual(projectCommitments(events));
  });

  it('projects only the surviving rows across multiple commitments', () => {
    const other = { ...capturedPayload, commitmentId: 'c-2', title: 'Keep me' };
    const events: DomainEvent[] = [
      evt({ id: 'e1', eventSeq: 1, eventType: 'CommitmentCaptured', payload: capturedPayload }),
      evt({ id: 'e2', eventSeq: 2, eventType: 'CommitmentCaptured', payload: other }),
      evt({ id: 'e3', eventSeq: 3, eventType: 'CommitmentCaptureUndone', payload: { commitmentId: 'c-1' } }),
    ];
    const rows = projectCommitments(events);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe('c-2');
  });
});

describe('undo builder', () => {
  it('builds a compensating forward event with compensatesEventId set', () => {
    const original = evt({
      id: 'evt-orig',
      eventType: 'CommitmentCaptured',
      actor: 'user-9',
      context: 'personal',
      payload: capturedPayload,
    });
    const undo: AppendEventInput = buildUndoEvent(original);
    expect(undo.eventType).toBe('CommitmentCaptureUndone');
    expect(undo.actor).toBe('user-9');
    expect(undo.context).toBe('personal');
    expect(undo.compensatesEventId).toBe('evt-orig');
    expect(undo.causedBy).toBe('evt-orig');
    expect(undo.payload.commitmentId).toBe('c-1');
  });

  it('throws for an event type with no defined undo', () => {
    const original = evt({ eventType: 'CrossContextAccessAudited', payload: {} });
    expect(() => buildUndoEvent(original)).toThrow(UndoNotSupportedError);
  });

  it('throws rather than emitting a bogus undo when commitmentId is missing', () => {
    const original = evt({ eventType: 'CommitmentCaptured', payload: {} });
    expect(() => buildUndoEvent(original)).toThrow(/commitmentId/);
  });
});
