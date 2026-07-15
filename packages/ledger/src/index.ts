/**
 * Event ledger core (AD-4): event catalog, projection reducers, undo builder,
 * and the `LedgerStore` port. Pure — no adapter/host/I/O imports (AD-1).
 * `EventContext` is canonical here; adapters re-export it.
 */

export type {
  EventContext,
  DomainEvent,
  AppendEventInput,
  ReadEventsFilter,
  CommitmentRow,
  PersonRow,
  GoalRow,
  LedgerStore,
} from './events/types.js';
export { REDACTED_MARKER } from './events/types.js';

export {
  EVENT_CATALOG,
  PROTECTION_LEVELS,
  protectionLevelEnum,
  WEEKDAYS,
  weekdayEnum,
  commitmentRecurrenceSchema,
  commitmentCapturedPayload,
  commitmentCaptureUndonePayload,
  PERSON_IMPORTANCE,
  personImportanceEnum,
  personContextEnum,
  importantDateSchema,
  rhythmCadenceSchema,
  personAddedPayload,
  personAddUndonePayload,
  goalContextEnum,
  goalAllocationSchema,
  goalAddedPayload,
  goalAddUndonePayload,
  goalAllocationDisplacedPayload,
  crossContextAccessAuditedPayload,
  calendarConnectedPayload,
  calendarSyncedPayload,
  calendarSyncFailedPayload,
  onboardingStartedPayload,
  onboardingStepCompletedPayload,
  onboardingCompletedPayload,
  boundariesSetPayload,
  domainRenamedPayload,
  domainAddedPayload,
  domainSetEnabledPayload,
  policyTemplateAcceptedPayload,
  policyTemplateDeclinedPayload,
  isKnownEventType,
  sensitiveFieldsFor,
  validateEventPayload,
  UnknownEventTypeError,
  InvalidEventPayloadError,
} from './events/catalog.js';
export type {
  KnownEventType,
  ProtectionLevel,
  Weekday,
  CommitmentRecurrence,
  PersonImportance,
  PersonContext,
  ImportantDate,
  RhythmCadence,
  PersonAddedPayload,
  GoalContext,
  GoalAllocation,
  GoalAddedPayload,
  CalendarConnectedPayload,
  CalendarSyncedPayload,
  CalendarSyncFailedPayload,
  OnboardingStartedPayload,
  OnboardingStepCompletedPayload,
  OnboardingCompletedPayload,
  BoundariesSetPayload,
  DomainRenamedPayload,
  DomainAddedPayload,
  DomainSetEnabledPayload,
  PolicyTemplateAcceptedPayload,
  PolicyTemplateDeclinedPayload,
} from './events/catalog.js';

export {
  reduceCommitment,
  projectCommitments,
} from './projections/commitment.js';

export {
  reducePerson,
  projectPeople,
} from './projections/person.js';

export {
  reduceGoal,
  projectGoals,
} from './projections/goal.js';

export {
  ONBOARDING_STEP_IDS,
  reduceOnboarding,
  projectOnboarding,
} from './projections/onboarding.js';
export type {
  OnboardingStepId,
  OnboardingStepMode,
  OnboardingStepState,
  OnboardingProgress,
} from './projections/onboarding.js';

export { reduceBoundaries, projectBoundaries } from './projections/boundaries.js';
export type { DailyBoundaries } from './projections/boundaries.js';

export { DEFAULT_DOMAINS, projectDomains } from './projections/domains.js';
export type { DefaultDomain, DomainRow } from './projections/domains.js';

export { POLICY_TEMPLATE_IDS, projectPolicyTemplates } from './projections/policies.js';
export type {
  PolicyTemplateId,
  PolicyTemplateStatus,
  PolicyTemplateState,
} from './projections/policies.js';

export { buildUndoEvent, UndoNotSupportedError } from './undo.js';
