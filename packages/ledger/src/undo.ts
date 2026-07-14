/**
 * Undo builder (AD-4). Undo is ALWAYS a compensating *forward* event
 * (past-tense) carrying `compensatesEventId` — never a negate-and-skip.
 * Pure — returns an `AppendEventInput` the caller appends via the store.
 */
import type { AppendEventInput, DomainEvent } from './events/types.js';

/** Maps an original event type to its compensating (undo) event type. */
const UNDO_TYPE: Readonly<Record<string, string>> = {
  CommitmentCaptured: 'CommitmentCaptureUndone',
};

/** Error thrown when an event type has no defined compensating event. */
export class UndoNotSupportedError extends Error {
  constructor(eventType: string) {
    super(`No undo defined for event type: ${eventType}`);
    this.name = 'UndoNotSupportedError';
  }
}

/**
 * Build the compensating forward event for `original`.
 * Same actor/context; `compensatesEventId` set to the original's id.
 */
export function buildUndoEvent(original: DomainEvent): AppendEventInput {
  const undoType = UNDO_TYPE[original.eventType];
  if (undoType === undefined) {
    throw new UndoNotSupportedError(original.eventType);
  }
  const commitmentId = original.payload.commitmentId;
  if (typeof commitmentId !== 'string' || commitmentId.length === 0) {
    // Guard against `String(undefined)` → "undefined" producing a bogus undo
    // that silently no-ops against a non-existent projection row.
    throw new Error(
      `Cannot undo ${original.eventType}: payload has no valid commitmentId`,
    );
  }
  return {
    eventType: undoType,
    actor: original.actor,
    context: original.context,
    payload: { commitmentId },
    causedBy: original.id,
    compensatesEventId: original.id,
  };
}
