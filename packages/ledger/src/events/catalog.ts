/**
 * Event catalog (AD-4): every event type's payload schema is defined exactly
 * once, here in core. Each entry also declares which payload fields are
 * sensitive (dot-paths) so the adapter can crypto-shred them (ADR 0001).
 *
 * Pure — zod only, no I/O (AD-1).
 */
import { z } from 'zod';
import type { EventContext } from './types.js';

const contextEnum = z.enum(['work', 'personal', 'joint']);
/** Source-row contexts: work|personal only — `joint` is illegal on source-mirror rows (AD-5). */
const sourceContextEnum = z.enum(['work', 'personal']);

// ── Payload schemas ─────────────────────────────────────────────────────────

/** A commitment was captured (the minimal Story 1.3 demonstrator). */
export const commitmentCapturedPayload = z.object({
  commitmentId: z.string().min(1),
  title: z.string().min(1),
  context: contextEnum,
  status: z.string().min(1).default('captured'),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

/** A prior capture was undone (compensating forward event, AD-4). */
export const commitmentCaptureUndonePayload = z.object({
  commitmentId: z.string().min(1),
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

// Inferred payload types for the calendar sync-health events (Story 1.4), so
// hosts/adapters build catalog-valid payloads without redeclaring the shapes.
export type CalendarConnectedPayload = z.infer<typeof calendarConnectedPayload>;
export type CalendarSyncedPayload = z.infer<typeof calendarSyncedPayload>;
export type CalendarSyncFailedPayload = z.infer<typeof calendarSyncFailedPayload>;

// Re-export for convenience so callers can build catalog-valid payloads.
export type { EventContext };
