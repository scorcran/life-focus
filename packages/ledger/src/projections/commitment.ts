/**
 * Commitment projection reducer (AD-4). Pure. Switches on `event.eventType`
 * ONLY — it never reads `compensatesEventId`, so a full rebuild-from-events
 * yields identical state to an incrementally-maintained projection.
 */
import type { CommitmentRow, DomainEvent } from '../events/types.js';

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
      return {
        id: String(p.commitmentId),
        title: String(p.title),
        context: event.context,
        status: String(p.status ?? 'captured'),
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
