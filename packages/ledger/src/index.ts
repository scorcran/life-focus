/** Event ledger stub — append-only event log + projections (AD-4). */

export type EventContext = 'work' | 'personal' | 'joint';

export interface DomainEvent {
  readonly eventSeq?: number;
  readonly eventType: string;
  readonly actor: string;
  readonly context: EventContext;
  readonly payload: Record<string, unknown>;
  readonly causedBy?: string;
}

/**
 * Stub: append a domain event.
 * Real implementation will write to insert-only Postgres tables.
 */
export async function appendEvent(event: DomainEvent): Promise<DomainEvent> {
  return { ...event, eventSeq: 0 };
}
