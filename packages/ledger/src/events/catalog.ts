/**
 * Event catalog (AD-4): every event type's payload schema is defined exactly
 * once, here in core. Each entry also declares which payload fields are
 * sensitive (dot-paths) so the adapter can crypto-shred them (ADR 0001).
 *
 * Pure — zod only, no I/O (AD-1).
 */
import { z } from 'zod';
import type { EventContext } from './types.js';
import { ONBOARDING_STEP_IDS } from '../projections/onboarding.js';

const contextEnum = z.enum(['work', 'personal', 'joint']);
/** Source-row contexts: work|personal only — `joint` is illegal on source-mirror rows (AD-5). */
const sourceContextEnum = z.enum(['work', 'personal']);

// ── Payload schemas ─────────────────────────────────────────────────────────

/**
 * The four canonical FR-3 protection levels: ordered, kebab-cased ids defined
 * ONCE here. `protectionLevel` on a captured commitment is required with no
 * default — a missing/unknown level rejects the append, so no untagged
 * plannable item can ever exist (PRD FR-3 / epic invariant).
 */
export const PROTECTION_LEVELS = [
  'hard-commitment',
  'protected-priority',
  'flexible-intention',
  'optional-opportunity',
] as const;

export const protectionLevelEnum = z.enum(PROTECTION_LEVELS);

/** The 7 canonical weekday ids (kebab/short form), Monday-first. */
export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export const weekdayEnum = z.enum(WEEKDAYS);

/**
 * Weekly-only recurrence (MVP): a weekly rule with ≥1 weekday. Any other/absent
 * value means non-recurring. Full RRULE/monthly/interval recurrence is deferred.
 */
export const commitmentRecurrenceSchema = z.object({
  frequency: z.literal('weekly'),
  daysOfWeek: z.array(weekdayEnum).min(1),
});

/** A commitment was captured (Story 1.3 demonstrator; extended in Story 2.3). */
export const commitmentCapturedPayload = z.object({
  commitmentId: z.string().min(1),
  title: z.string().min(1),
  context: contextEnum,
  status: z.string().min(1).default('captured'),
  // Required, no default: every captured commitment carries an FR-3 protection level.
  protectionLevel: protectionLevelEnum,
  // Optional: absent/null means a one-off (non-recurring) commitment.
  recurrence: commitmentRecurrenceSchema.nullable().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

/** A prior capture was undone (compensating forward event, AD-4). */
export const commitmentCaptureUndonePayload = z.object({
  commitmentId: z.string().min(1),
});

// ── Important-people events (Story 2.4, AD-4) ────────────────────────────────
// A core person is one additive `PersonAdded` event carrying the MVP-lite Person
// model plus an optional embedded weekly communication rhythm. `name`/`intention`
// are free-text user fields that can identify a person, so they are declared
// sensitive and crypto-shredded via the existing sensitive-field path (ADR 0001);
// the action passes an explicit `erasureScope: 'person:'+personId` so a future
// erase is person-precise. State is served by a pure projection over these events
// — no projection table or migration (AD-4). FR-12 / P5: there is NO relationship
// score/rating/rank/health field anywhere; `importance` is a user-asserted
// categorical label, and `importantDates` are user-asserted only (never inferred).

/**
 * The three canonical closeness "circles" (FR-12 / P5): ordered, kebab-cased ids
 * defined ONCE here. `importance` is a user-asserted categorical label — an
 * opaque string stored as-is, never computed, ordered, or used to rank people.
 * There is no numeric/score field; this is the only "importance" the model has.
 */
export const PERSON_IMPORTANCE = ['inner-circle', 'close', 'wider-circle'] as const;

export const personImportanceEnum = z.enum(PERSON_IMPORTANCE);

/** Person contexts: work|personal only — a person is never `joint` (AD-5). */
export const personContextEnum = z.enum(['work', 'personal']);

/**
 * Days per month for user-asserted important dates. February allows 29 so a
 * leap-day (`02-29`) birthday is accepted even in a bare `MM-DD` date (there is
 * no year to leap-check against); every other month uses its real length.
 */
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/**
 * A user-asserted important date: a free-text label plus a date string
 * (`MM-DD` recurring, or a full `YYYY-MM-DD`). Never inferred from any source.
 * The shape regex is not enough — it also validates a REAL calendar month/day
 * so impossible dates (`13-45`, `02-31`, `99-99`, `00-00`) are rejected at
 * append (and dropped by the projection's re-validation), never persisted.
 */
export const importantDateSchema = z.object({
  label: z.string().min(1),
  date: z
    .string()
    .regex(/^(\d{4}-)?\d{2}-\d{2}$/, 'expected MM-DD or YYYY-MM-DD')
    .refine((date) => {
      const match = /^(?:\d{4}-)?(\d{2})-(\d{2})$/.exec(date);
      if (match === null) return false;
      const month = Number(match[1]);
      const day = Number(match[2]);
      return month >= 1 && month <= 12 && day >= 1 && day <= DAYS_IN_MONTH[month - 1];
    }, 'expected a real calendar month and day'),
});

/**
 * Weekly communication rhythm cadence (MVP): weekly, with an OPTIONALLY-empty
 * set of weekdays. Unlike `commitmentRecurrenceSchema` (which requires ≥1 day),
 * an EMPTY `daysOfWeek` is valid and means the flexible "sometime each week"
 * window ("call Mom weekly"). Reuses the canonical `weekdayEnum`.
 */
export const rhythmCadenceSchema = z.object({
  frequency: z.literal('weekly'),
  daysOfWeek: z.array(weekdayEnum),
});

/** A core person was added (Story 2.4), with an optional embedded weekly rhythm. */
export const personAddedPayload = z.object({
  personId: z.string().min(1),
  name: z.string().min(1),
  relationshipType: z.string().min(1),
  // Required, no default: every person carries a user-asserted closeness label.
  importance: personImportanceEnum,
  // Optional: absent/null means no stated intention for this relationship.
  intention: z.string().min(1).nullable().optional(),
  // Optional: user-asserted important dates only (never inferred).
  importantDates: z.array(importantDateSchema).optional(),
  context: personContextEnum,
  // Optional: absent/null means no communication rhythm was set.
  rhythm: rhythmCadenceSchema.nullable().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

/** A prior person-add was undone (compensating forward event, AD-4). */
export const personAddUndonePayload = z.object({
  personId: z.string().min(1),
});

/** A cross-context read/emit was audited (AC-14 instrument). */
export const crossContextAccessAuditedPayload = z.object({
  sourceContext: contextEnum,
  targetContext: contextEnum,
  allowed: z.boolean(),
  isPlanningArtifact: z.boolean().default(false),
});

// ── Calendar connector sync-health events (Story 1.4, AD-4/AD-7) ─────────────
// These record the sync-health facts for the audit trail; they carry no
// sensitive fields (tokens live encrypted in the mutable calendar_source cache,
// never in the append-only log) and touch no projection (the commitment reducer
// ignores unknown types).

/** A Google Calendar was connected with a chosen, immutable context (AD-6). */
export const calendarConnectedPayload = z.object({
  sourceId: z.string().min(1),
  provider: z.literal('gcal'),
  account: z.string().min(1),
  context: sourceContextEnum,
  googleCalendarId: z.string().min(1),
});

/** A calendar sync run succeeded (initial or incremental). */
export const calendarSyncedPayload = z.object({
  sourceId: z.string().min(1),
  context: sourceContextEnum,
  syncType: z.enum(['initial', 'incremental']),
  eventCount: z.number().int().nonnegative(),
  syncedAt: z.string().min(1),
});

/** A calendar sync run failed; `authError` distinguishes revocation (AD-7, FR-62). */
export const calendarSyncFailedPayload = z.object({
  sourceId: z.string().min(1),
  context: sourceContextEnum,
  authError: z.boolean().default(false),
  reason: z.string().min(1),
  failedAt: z.string().min(1),
});

// ── Guided-onboarding progress events (Story 2.1, AD-4) ──────────────────────
// Onboarding progress is meta over the whole life model (it spans work +
// personal), so `joint` is the correct non-null context tag (AD-5). These
// events carry no PII (`sensitiveFields: []`), so the encryption path is never
// exercised. Progress is served by a pure in-memory projection over these
// events — there is no projection table or migration (AD-4).

/**
 * Validate step ids against the single canonical list (`ONBOARDING_STEP_IDS`)
 * so the catalog enum can never drift from the projection's valid set.
 */
const onboardingStepIdEnum = z.enum(ONBOARDING_STEP_IDS);

/** Onboarding began. Idempotent at the projection: first `startedAt` wins. */
export const onboardingStartedPayload = z.object({
  startedAt: z.string().min(1),
});

/** A step was advanced by an explicit user action: entered or skipped. */
export const onboardingStepCompletedPayload = z.object({
  stepId: onboardingStepIdEnum,
  mode: z.enum(['entered', 'skipped']),
  at: z.string().min(1),
});

/** Onboarding was finished (pairs with `OnboardingStarted` for story 2.6 timing). */
export const onboardingCompletedPayload = z.object({
  completedAt: z.string().min(1),
});

// ── Boundaries, domains, and starter-policy events (Story 2.2, AD-4) ─────────
// Boundaries, life domains, and policy templates are life-model *configuration*
// spanning work + personal, so `joint` is the correct non-null context tag
// (AD-5). Free-text user fields that can carry work/customer specifics
// (`DomainRenamed.name`, `DomainAdded.name`, `PolicyTemplateAccepted.content`)
// are declared sensitive and encrypted at rest via the existing sensitive-field
// path (SEC-1, ADR 0001); times and enabled flags are not identifying. State is
// served by pure projections over these events — no projection table (AD-4).

/** A "HH:MM" 24-hour clock string (00:00–23:59). */
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'expected HH:MM 24-hour time');

/** The daily boundaries were set/updated (latest-wins singleton). */
export const boundariesSetPayload = z.object({
  workdayStart: timeString,
  hardStop: timeString,
  sleepStart: timeString,
  sleepEnd: timeString,
  updatedAt: z.string().min(1),
});

/** A life domain was renamed (latest-wins per domain). */
export const domainRenamedPayload = z.object({
  domainId: z.string().min(1),
  name: z.string().min(1),
  at: z.string().min(1),
});

/** A custom life domain was added. */
export const domainAddedPayload = z.object({
  domainId: z.string().min(1),
  name: z.string().min(1),
  at: z.string().min(1),
});

/** A life domain was enabled or disabled (latest-wins per domain). */
export const domainSetEnabledPayload = z.object({
  domainId: z.string().min(1),
  enabled: z.boolean(),
  at: z.string().min(1),
});

/** A starter policy template was accepted, carrying the (possibly edited) content. */
export const policyTemplateAcceptedPayload = z.object({
  templateId: z.string().min(1),
  content: z.string().min(1),
  at: z.string().min(1),
});

/** A starter policy template was declined (recorded once, never re-prompted). */
export const policyTemplateDeclinedPayload = z.object({
  templateId: z.string().min(1),
  at: z.string().min(1),
});

// ── Catalog registry ────────────────────────────────────────────────────────

interface CatalogEntry {
  readonly schema: z.ZodType;
  /** Dot-paths into the payload that must be encrypted at rest (ADR 0001). */
  readonly sensitiveFields: readonly string[];
}

/** The event-type catalog. Keys are the canonical past-tense event names. */
export const EVENT_CATALOG = {
  CommitmentCaptured: {
    schema: commitmentCapturedPayload,
    sensitiveFields: ['title'],
  },
  CommitmentCaptureUndone: {
    schema: commitmentCaptureUndonePayload,
    sensitiveFields: [],
  },
  PersonAdded: {
    schema: personAddedPayload,
    sensitiveFields: ['name', 'intention'],
  },
  PersonAddUndone: {
    schema: personAddUndonePayload,
    sensitiveFields: [],
  },
  CrossContextAccessAudited: {
    schema: crossContextAccessAuditedPayload,
    sensitiveFields: [],
  },
  CalendarConnected: {
    schema: calendarConnectedPayload,
    sensitiveFields: [],
  },
  CalendarSynced: {
    schema: calendarSyncedPayload,
    sensitiveFields: [],
  },
  CalendarSyncFailed: {
    schema: calendarSyncFailedPayload,
    sensitiveFields: [],
  },
  OnboardingStarted: {
    schema: onboardingStartedPayload,
    sensitiveFields: [],
  },
  OnboardingStepCompleted: {
    schema: onboardingStepCompletedPayload,
    sensitiveFields: [],
  },
  OnboardingCompleted: {
    schema: onboardingCompletedPayload,
    sensitiveFields: [],
  },
  BoundariesSet: {
    schema: boundariesSetPayload,
    sensitiveFields: [],
  },
  DomainRenamed: {
    schema: domainRenamedPayload,
    sensitiveFields: ['name'],
  },
  DomainAdded: {
    schema: domainAddedPayload,
    sensitiveFields: ['name'],
  },
  DomainSetEnabled: {
    schema: domainSetEnabledPayload,
    sensitiveFields: [],
  },
  PolicyTemplateAccepted: {
    schema: policyTemplateAcceptedPayload,
    sensitiveFields: ['content'],
  },
  PolicyTemplateDeclined: {
    schema: policyTemplateDeclinedPayload,
    sensitiveFields: [],
  },
} as const satisfies Record<string, CatalogEntry>;

export type KnownEventType = keyof typeof EVENT_CATALOG;

/** Error thrown when an event type is not registered in the catalog. */
export class UnknownEventTypeError extends Error {
  constructor(eventType: string) {
    super(`Unknown event type: ${eventType}`);
    this.name = 'UnknownEventTypeError';
  }
}

/** Error thrown when a payload fails its catalog schema. */
export class InvalidEventPayloadError extends Error {
  constructor(eventType: string, detail: string) {
    super(`Invalid payload for ${eventType}: ${detail}`);
    this.name = 'InvalidEventPayloadError';
  }
}

export function isKnownEventType(eventType: string): eventType is KnownEventType {
  return Object.prototype.hasOwnProperty.call(EVENT_CATALOG, eventType);
}

/** The declared sensitive dot-paths for an event type (empty if none/unknown). */
export function sensitiveFieldsFor(eventType: string): readonly string[] {
  return isKnownEventType(eventType) ? EVENT_CATALOG[eventType].sensitiveFields : [];
}

/**
 * Validate a payload against its catalog schema. Throws `UnknownEventTypeError`
 * for unregistered types and `InvalidEventPayloadError` for schema failures.
 * Returns the parsed payload (with schema defaults applied).
 */
export function validateEventPayload(
  eventType: string,
  payload: unknown,
): Record<string, unknown> {
  if (!isKnownEventType(eventType)) {
    throw new UnknownEventTypeError(eventType);
  }
  const result = EVENT_CATALOG[eventType].schema.safeParse(payload);
  if (!result.success) {
    throw new InvalidEventPayloadError(eventType, result.error.message);
  }
  return result.data as Record<string, unknown>;
}

// Inferred protection-level / recurrence types (Story 2.3), so hosts build
// catalog-valid payloads and typed catalogs without redeclaring the shapes.
export type ProtectionLevel = z.infer<typeof protectionLevelEnum>;
export type Weekday = z.infer<typeof weekdayEnum>;
export type CommitmentRecurrence = z.infer<typeof commitmentRecurrenceSchema>;

// Inferred important-people types (Story 2.4), so hosts build catalog-valid
// payloads and typed catalogs without redeclaring the shapes. No score type
// exists by construction (FR-12 / P5).
export type PersonImportance = z.infer<typeof personImportanceEnum>;
export type PersonContext = z.infer<typeof personContextEnum>;
export type ImportantDate = z.infer<typeof importantDateSchema>;
export type RhythmCadence = z.infer<typeof rhythmCadenceSchema>;
export type PersonAddedPayload = z.infer<typeof personAddedPayload>;

// Inferred payload types for the calendar sync-health events (Story 1.4), so
// hosts/adapters build catalog-valid payloads without redeclaring the shapes.
export type CalendarConnectedPayload = z.infer<typeof calendarConnectedPayload>;
export type CalendarSyncedPayload = z.infer<typeof calendarSyncedPayload>;
export type CalendarSyncFailedPayload = z.infer<typeof calendarSyncFailedPayload>;

// Inferred payload types for the guided-onboarding events (Story 2.1), so the
// host builds catalog-valid payloads without redeclaring the shapes.
export type OnboardingStartedPayload = z.infer<typeof onboardingStartedPayload>;
export type OnboardingStepCompletedPayload = z.infer<typeof onboardingStepCompletedPayload>;
export type OnboardingCompletedPayload = z.infer<typeof onboardingCompletedPayload>;

// Inferred payload types for the boundaries/domains/policy events (Story 2.2),
// so the host builds catalog-valid payloads without redeclaring the shapes.
export type BoundariesSetPayload = z.infer<typeof boundariesSetPayload>;
export type DomainRenamedPayload = z.infer<typeof domainRenamedPayload>;
export type DomainAddedPayload = z.infer<typeof domainAddedPayload>;
export type DomainSetEnabledPayload = z.infer<typeof domainSetEnabledPayload>;
export type PolicyTemplateAcceptedPayload = z.infer<typeof policyTemplateAcceptedPayload>;
export type PolicyTemplateDeclinedPayload = z.infer<typeof policyTemplateDeclinedPayload>;

// Re-export for convenience so callers can build catalog-valid payloads.
export type { EventContext };
