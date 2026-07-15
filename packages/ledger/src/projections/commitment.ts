/**
 * Commitment projection reducer (AD-4). Pure. Switches on `event.eventType`
 * ONLY — it never reads `compensatesEventId`, so a full rebuild-from-events
 * yields identical state to an incrementally-maintained projection.
 */
import type { CommitmentRow, DomainEvent } from '../events/types.js';
import {
  PROTECTION_LEVELS,
  commitmentRecurrenceSchema,
  type ProtectionLevel,
  type CommitmentRecurrence,
} from '../events/catalog.js';

/** Narrow a raw payload value to a canonical protection level, or `null`. */
function toProtectionLevel(value: unknown): ProtectionLevel | null {
  return (PROTECTION_LEVELS as readonly string[]).includes(value as string)
    ? (value as ProtectionLevel)
    : null;
}

/** Narrow a raw payload value to a weekly recurrence rule, or `null` (one-off). */
function toRecurrence(value: unknown): CommitmentRecurrence | null {
  if (value == null) return null;
  const parsed = commitmentRecurrenceSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/**
 * Reduce one event into the commitment row it concerns.
 * `(current | null, event) => next | null`. Returning `null` removes the row.
 * Events that don't concern this projection leave `current` untouched.
 */
export function reduceCommitment(
  current: CommitmentRow | null,
  event: DomainEvent,
): CommitmentRow | null {
  switch (event.eventType) {
    case 'CommitmentCaptured': {
      const p = event.payload;
      const protectionLevel = toProtectionLevel(p.protectionLevel);
      // A catalog-valid CommitmentCaptured always carries a level; a malformed
      // event lacking one is ignored (never yields an untagged row).
      if (protectionLevel === null) return current;
      return {
        id: String(p.commitmentId),
        title: String(p.title),
        context: event.context,
        status: String(p.status ?? 'captured'),
        protectionLevel,
        recurrence: toRecurrence(p.recurrence),
        createdAt: String(p.createdAt),
        updatedAt: String(p.updatedAt),
      };
    }
    case 'CommitmentCaptureUndone':
      // Compensating forward event: the commitment is reduced away.
      return null;
    default:
      return current;
  }
}

/** Which commitment id an event concerns, or null if it concerns none. */
function commitmentIdOf(event: DomainEvent): string | null {
  switch (event.eventType) {
    case 'CommitmentCaptured':
    case 'CommitmentCaptureUndone':
      return String(event.payload.commitmentId);
    default:
      return null;
  }
}

/**
 * Rebuild the full commitment projection from an ordered event list.
 * Deterministic and independent of `compensatesEventId` (AD-4 undo purity).
 */
export function projectCommitments(
  events: readonly DomainEvent[],
): readonly CommitmentRow[] {
  const byId = new Map<string, CommitmentRow>();
  for (const event of events) {
    const id = commitmentIdOf(event);
    if (id === null) continue;
    const next = reduceCommitment(byId.get(id) ?? null, event);
    if (next === null) {
      byId.delete(id);
    } else {
      byId.set(id, next);
    }
  }
  return [...byId.values()];
}
