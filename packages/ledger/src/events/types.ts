/**
 * Core event-ledger types (AD-4). Pure — no I/O, no adapter imports (AD-1).
 *
 * `DomainEvent` is a persisted, projected event row; `AppendEventInput` is what
 * a caller hands the store to append. The `LedgerStore` port is implemented by
 * the `packages/db` adapter and injected into hosts/broker.
 */

/** The context tag carried by every domain/event/projection row (AD-5). */
export type EventContext = 'work' | 'personal' | 'joint';

/** A domain event as read back from the ledger (after append). */
export interface DomainEvent {
  /** Application-generated UUIDv7 (AD conventions). */
  readonly id: string;
  /** Monotonic sequence assigned by the DB. */
  readonly eventSeq: number;
  /** Past-tense event name registered in the catalog. */
  readonly eventType: string;
  /** Who caused the event (app user id / actor label). */
  readonly actor: string;
  /** Non-null context tag (AD-5). */
  readonly context: EventContext;
  /** Validated, possibly sensitive-field-decrypted payload. */
  readonly payload: Record<string, unknown>;
  /** Optional causal link to a prior event. */
  readonly causedBy?: string | null;
  /**
   * Audit linkage for undo (AD-4). NEVER consulted by projection logic.
   */
  readonly compensatesEventId?: string | null;
  /** Erasure scope this event's sensitive fields are keyed under (ADR 0001). */
  readonly erasureScope?: string | null;
  /** ISO-8601 UTC creation timestamp. */
  readonly createdAt: string;
}

/** What a caller appends. `id`/`eventSeq`/`createdAt` are assigned by the store. */
export interface AppendEventInput {
  readonly eventType: string;
  readonly actor: string;
  readonly context: EventContext;
  readonly payload: Record<string, unknown>;
  readonly causedBy?: string | null;
  readonly compensatesEventId?: string | null;
  /**
   * Erasure scope for this event's sensitive fields (ADR 0001). When omitted
   * and the event type declares sensitive fields, the store derives a scope.
   */
  readonly erasureScope?: string | null;
}

/** Filter for reading raw events. */
export interface ReadEventsFilter {
  readonly context?: EventContext;
  readonly eventType?: string;
}

/** A projected commitment row (the minimal Story 1.3 demonstrator). */
export interface CommitmentRow {
  readonly id: string;
  readonly title: string;
  readonly context: EventContext;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * The port the ledger adapter (`packages/db`) implements. Hosts and the broker
 * depend on this TYPE only (AD-1) and receive an implementation by injection.
 */
export interface LedgerStore {
  /** Validate, encrypt sensitive fields, append, and project — in one txn. */
  append(input: AppendEventInput): Promise<DomainEvent>;
  /** Read raw events (sensitive fields decrypted where the scope key exists). */
  readEvents(filter?: ReadEventsFilter): Promise<readonly DomainEvent[]>;
  /** Read the commitment projection, filtered by context (the separation guarantee). */
  readCommitments(context: EventContext): Promise<readonly CommitmentRow[]>;
  /** Crypto-shred an erasure scope: destroy its data key (ADR 0001). */
  erase(scope: string): Promise<void>;
}

/** Marker returned for a sensitive field whose scope key has been erased. */
export const REDACTED_MARKER = '[redacted]' as const;
