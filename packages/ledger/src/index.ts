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
  LedgerStore,
} from './events/types.js';
export { REDACTED_MARKER } from './events/types.js';

export {
  EVENT_CATALOG,
  commitmentCapturedPayload,
  commitmentCaptureUndonePayload,
  crossContextAccessAuditedPayload,
  calendarConnectedPayload,
  calendarSyncedPayload,
  calendarSyncFailedPayload,
  onboardingStartedPayload,
  onboardingStepCompletedPayload,
  onboardingCompletedPayload,
  isKnownEventType,
  sensitiveFieldsFor,
  validateEventPayload,
  UnknownEventTypeError,
  InvalidEventPayloadError,
} from './events/catalog.js';
export type {
  KnownEventType,
  CalendarConnectedPayload,
  CalendarSyncedPayload,
  CalendarSyncFailedPayload,
  OnboardingStartedPayload,
  OnboardingStepCompletedPayload,
  OnboardingCompletedPayload,
} from './events/catalog.js';

export {
  reduceCommitment,
  projectCommitments,
} from './projections/commitment.js';

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

export { buildUndoEvent, UndoNotSupportedError } from './undo.js';
