/**
 * Core event-ledger types (AD-4). Pure — no I/O, no adapter imports (AD-1).
 *
 * `DomainEvent` is a persisted, projected event row; `AppendEventInput` is what
 * a caller hands the store to append. The `LedgerStore` port is implemented by
 * the `packages/db` adapter and injected into hosts/broker.
 */
import type {
  ProtectionLevel,
  CommitmentRecurrence,
  PersonImportance,
  PersonContext,
  ImportantDate,
  Weekday,
  GoalContext,
} from './catalog.js';

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

/** A projected commitment row (Story 1.3 demonstrator; extended in Story 2.3). */
export interface CommitmentRow {
  readonly id: string;
  readonly title: string;
  readonly context: EventContext;
  readonly status: string;
  /** The FR-3 protection level this commitment was captured with (required). */
  readonly protectionLevel: ProtectionLevel;
  /** The weekly recurrence rule, or `null` for a one-off commitment. */
  readonly recurrence: CommitmentRecurrence | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * A projected important-person row (Story 2.4). FR-12 / P5: there is NO
 * numeric/rating/rank/health/score field here — `importance` is a user-asserted
 * categorical label, and `importantDates` are user-asserted only. A present
 * `rhythm` is exposed as a `flexible-intention` (the shared 2.3 protection-level
 * vocabulary) linked to this person, so it is queryable as a flexible intention
 * for the Epic-4 ContextSnapshot.
 */
export interface PersonRow {
  readonly id: string;
  readonly name: string;
  readonly relationshipType: string;
  /** The user-asserted closeness circle (opaque label — never computed/ranked). */
  readonly importance: PersonImportance;
  /** A stated relationship intention, or `null` when none was given. */
  readonly intention: string | null;
  /** User-asserted important dates (verbatim); empty when none were given. */
  readonly importantDates: readonly ImportantDate[];
  /** Person context — work|personal only (never joint, AD-5). */
  readonly context: PersonContext;
  /** The weekly communication rhythm as a flexible intention, or `null`. */
  readonly rhythm: {
    readonly protectionLevel: 'flexible-intention';
    readonly frequency: 'weekly';
    readonly daysOfWeek: readonly Weekday[];
  } | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * A projected goal row (Story 2.5). FR-40 / P5: there is NO numeric
 * score/rating/rank/health field here — `displacementCount` is a plain factual
 * count of `GoalAllocationDisplaced` events, shown in neutral language. The
 * allocation is exposed as a `protected-priority` intention (the shared 2.3
 * protection-level vocabulary) linked to this goal by id, so it is queryable as a
 * protected-priority intention for the Epic-4 ContextSnapshot. The user never
 * chooses the level — it is fixed by construction.
 */
export interface GoalRow {
  readonly id: string;
  readonly title: string;
  /** The one user-defined next action for this goal. */
  readonly nextAction: string;
  /** The protected weekly allocation — a protected-priority intention by construction. */
  readonly allocation: {
    readonly protectionLevel: 'protected-priority';
    readonly frequency: 'weekly';
    readonly sessionsPerWeek: number;
    readonly minutesPerSession: number;
  };
  /** A plain count of times the allocation was moved/dropped (never a score). */
  readonly displacementCount: number;
  /** Goal context — work|personal only (never joint, AD-5). */
  readonly context: GoalContext;
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
