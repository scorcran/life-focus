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

// Re-export for convenience so callers can build catalog-valid payloads.
export type { EventContext };
