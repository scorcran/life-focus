/**
 * Postgres-backed `LedgerStore` (the adapter implementing the core port).
 *
 * Responsibilities (ADR 0001, AD-4, AD-5):
 *  - validate payload via the ledger catalog before any write;
 *  - generate UUIDv7 ids application-side;
 *  - encrypt each declared sensitive field under a per-erasure-scope data key
 *    (create + wrap + store the key on first use for that scope);
 *  - INSERT the event and apply the projection reducer in ONE transaction;
 *  - read events / commitments (decrypting sensitive fields where the key
 *    still exists, returning a redacted marker after erasure);
 *  - erase a scope by deleting its wrapped-key row (never touching events).
 */
import { and, eq } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import {
  validateEventPayload,
  sensitiveFieldsFor,
  reduceCommitment,
  projectCommitments,
  REDACTED_MARKER,
  type AppendEventInput,
  type DomainEvent,
  type EventContext,
  type CommitmentRow,
  type LedgerStore,
  type ReadEventsFilter,
} from '@life-focus/ledger';
import { ledgerEvent, commitment, ledgerErasureKey } from '../schema/ledger.js';
import type { DbClient } from '../index.js';
import {
  encryptField,
  decryptField,
  wrapDataKey,
  unwrapDataKey,
  generateDataKey,
  isEncryptedField,
  decodeMasterKey,
} from './crypto.js';

export interface LedgerStoreOptions {
  /** The LEDGER_MASTER_KEY (base64/hex, decodes to 32 bytes) from config. */
  readonly masterKey: string;
}

/** The transaction handle passed to a `db.transaction(async (tx) => ...)` callback. */
type Tx = Parameters<Parameters<DbClient['db']['transaction']>[0]>[0];

/** Read a dot-path value from a nested record. */
function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

/** Immutably set a dot-path value in a (shallow-cloned) nested record. */
function setPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const keys = path.split('.');
  const clone: Record<string, unknown> = { ...obj };
  let cursor = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i] as string;
    const child = cursor[k];
    const nextChild: Record<string, unknown> =
      child && typeof child === 'object' ? { ...(child as Record<string, unknown>) } : {};
    cursor[k] = nextChild;
    cursor = nextChild;
  }
  cursor[keys[keys.length - 1] as string] = value;
  return clone;
}

export function createLedgerStore(
  client: DbClient,
  options: LedgerStoreOptions,
): LedgerStore {
  const { db } = client;
  const masterKey = decodeMasterKey(options.masterKey);

  /** Get-or-create the per-scope data key inside a transaction. */
  async function ensureScopeKey(
    tx: Tx,
    scope: string,
  ): Promise<Buffer> {
    const existing = await tx
      .select()
      .from(ledgerErasureKey)
      .where(eq(ledgerErasureKey.erasureScope, scope));
    if (existing.length > 0) {
      return unwrapDataKey(existing[0]!.wrappedDataKey, masterKey);
    }
    // Concurrency-safe create: two appends racing the same scope's first use
    // would otherwise collide on the erasure_scope PK and crash the loser.
    // onConflictDoNothing + re-read yields the winner's key for both.
    const dataKey = generateDataKey();
    await tx
      .insert(ledgerErasureKey)
      .values({
        erasureScope: scope,
        wrappedDataKey: wrapDataKey(dataKey, masterKey),
      })
      .onConflictDoNothing();
    const rows = await tx
      .select()
      .from(ledgerErasureKey)
      .where(eq(ledgerErasureKey.erasureScope, scope));
    return unwrapDataKey(rows[0]!.wrappedDataKey, masterKey);
  }

  /** Look up a scope's data key for reads; null if the scope was erased. */
  async function loadScopeKey(scope: string): Promise<Buffer | null> {
    const rows = await db
      .select()
      .from(ledgerErasureKey)
      .where(eq(ledgerErasureKey.erasureScope, scope));
    if (rows.length === 0) return null;
    return unwrapDataKey(rows[0]!.wrappedDataKey, masterKey);
  }

  /** Decrypt sensitive fields in a stored payload for reading. */
  function decryptPayload(
    eventType: string,
    stored: Record<string, unknown>,
    dataKey: Buffer | null,
  ): Record<string, unknown> {
    let out = stored;
    for (const path of sensitiveFieldsFor(eventType)) {
      const val = getPath(out, path);
      if (isEncryptedField(val)) {
        // Missing key (erased) OR a decrypt failure (rotated master key /
        // tampered ciphertext) both degrade to the redacted marker rather than
        // throwing — one bad field must not hide the whole event stream.
        let replacement: unknown = REDACTED_MARKER;
        if (dataKey) {
          try {
            replacement = decryptField(val, dataKey);
          } catch {
            replacement = REDACTED_MARKER;
          }
        }
        out = setPath(out, path, replacement);
      }
    }
    return out;
  }

  function rowToEvent(row: typeof ledgerEvent.$inferSelect, payload: Record<string, unknown>): DomainEvent {
    return {
      id: row.id,
      eventSeq: Number(row.eventSeq),
      eventType: row.eventType,
      actor: row.actor,
      context: row.context as EventContext,
      payload,
      causedBy: row.causedBy,
      compensatesEventId: row.compensatesEventId,
      erasureScope: row.erasureScope,
      createdAt: row.createdAt.toISOString(),
    };
  }

  /**
   * Read + decrypt the ordered event stream for a filter. Shared by `readEvents`
   * and `readCommitments` so both see the same sensitive-field decryption /
   * post-erasure redaction.
   */
  async function readEventsInternal(
    filter?: ReadEventsFilter,
  ): Promise<readonly DomainEvent[]> {
    const conditions = [];
    if (filter?.context) conditions.push(eq(ledgerEvent.context, filter.context));
    if (filter?.eventType) conditions.push(eq(ledgerEvent.eventType, filter.eventType));
    const rows = await db
      .select()
      .from(ledgerEvent)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(ledgerEvent.eventSeq);

    // Cache scope keys across rows: all events for one commitment share a
    // scope, so this avoids one SELECT + unwrap per row on a large read.
    const keyCache = new Map<string, Buffer | null>();
    const scopeKey = async (scope: string): Promise<Buffer | null> => {
      if (keyCache.has(scope)) return keyCache.get(scope)!;
      const k = await loadScopeKey(scope);
      keyCache.set(scope, k);
      return k;
    };

    const out: DomainEvent[] = [];
    for (const row of rows) {
      const dataKey = row.erasureScope ? await scopeKey(row.erasureScope) : null;
      const payload = decryptPayload(
        row.eventType,
        row.payload as Record<string, unknown>,
        dataKey,
      );
      out.push(rowToEvent(row, payload));
    }
    return out;
  }

  return {
    async append(input: AppendEventInput): Promise<DomainEvent> {
      // 1. Validate payload (throws for unknown type / bad payload) — nothing written.
      const validated = validateEventPayload(input.eventType, input.payload);
      const sensitive = sensitiveFieldsFor(input.eventType);
      const id = uuidv7();

      // 2. Derive erasure scope: explicit, else per-commitment when sensitive.
      let erasureScope: string | null = input.erasureScope ?? null;
      if (sensitive.length > 0 && erasureScope === null) {
        const commitmentId = validated.commitmentId;
        erasureScope =
          typeof commitmentId === 'string' ? `commitment:${commitmentId}` : `event:${id}`;
      }

      return db.transaction(async (tx) => {
        // 3. Encrypt sensitive fields under the per-scope data key.
        let storedPayload = validated;
        if (sensitive.length > 0 && erasureScope !== null) {
          const dataKey = await ensureScopeKey(tx, erasureScope);
          for (const path of sensitive) {
            const val = getPath(storedPayload, path);
            if (typeof val === 'string') {
              storedPayload = setPath(storedPayload, path, encryptField(val, dataKey));
            } else if (val != null) {
              // A declared-sensitive field that is present but not a string would
              // otherwise fall through and persist as plaintext, silently defeating
              // crypto-shred erasure. Fail loudly instead.
              throw new Error(
                `sensitive field "${path}" of ${input.eventType} must be a string to encrypt, got ${typeof val}`,
              );
            }
          }
        }

        // 4. INSERT the event; event_seq assigned by the DB identity column.
        const inserted = await tx
          .insert(ledgerEvent)
          .values({
            id,
            eventType: input.eventType,
            actor: input.actor,
            context: input.context,
            payload: storedPayload,
            causedBy: input.causedBy ?? null,
            compensatesEventId: input.compensatesEventId ?? null,
            erasureScope,
          })
          .returning();
        const row = inserted[0]!;

        // 5. Apply the projection reducer for the commitment this event concerns.
        const event = rowToEvent(row, validated); // reduce over decrypted payload
        await applyCommitmentProjection(tx, event);

        return rowToEvent(row, validated);
      });
    },

    async readEvents(filter?: ReadEventsFilter): Promise<readonly DomainEvent[]> {
      return readEventsInternal(filter);
    },

    async readCommitments(context: EventContext): Promise<readonly CommitmentRow[]> {
      // Separation guarantee: filter by context in the query itself (AD-5). The
      // commitment projection table carries only the Story 1.3 columns; the
      // richer read model (protection level + recurrence, Story 2.3) is derived
      // from the context-scoped event stream via the pure projection — no
      // projection-table migration. Sensitive titles decrypt / redact through
      // the shared event read, matching the raw-table redaction on erase.
      const events = await readEventsInternal({ context });
      return projectCommitments(events);
    },

    async erase(scope: string): Promise<void> {
      await db.transaction(async (tx) => {
        // 1. Crypto-shred: delete the wrapped data key so the event ciphertext
        //    is unrecoverable. Event rows are never touched (AD-4 append-only).
        await tx.delete(ledgerErasureKey).where(eq(ledgerErasureKey.erasureScope, scope));

        // 2. Cascade into the projection. Projections store DECRYPTED sensitive
        //    fields (e.g. commitment.title) as plaintext for display, so shredding
        //    the key alone would leave the data readable there — redact it too.
        //    The projection table is mutable (rebuildable), unlike ledger_event.
        const events = await tx
          .select()
          .from(ledgerEvent)
          .where(eq(ledgerEvent.erasureScope, scope));
        const commitmentIds = new Set<string>();
        for (const row of events) {
          const p = row.payload as Record<string, unknown>;
          if (
            (row.eventType === 'CommitmentCaptured' ||
              row.eventType === 'CommitmentCaptureUndone') &&
            typeof p.commitmentId === 'string'
          ) {
            commitmentIds.add(p.commitmentId);
          }
        }
        for (const id of commitmentIds) {
          await tx.update(commitment).set({ title: REDACTED_MARKER }).where(eq(commitment.id, id));
        }
      });
    },
  };

  /**
   * Apply a single event to the commitment projection using the pure reducer.
   * Upserts or deletes the row so current state stays a projection of events.
   */
  async function applyCommitmentProjection(
    tx: Tx,
    event: DomainEvent,
  ): Promise<void> {
    const commitmentId = commitmentIdOf(event);
    if (commitmentId === null) return;

    const existingRows = await tx
      .select()
      .from(commitment)
      .where(eq(commitment.id, commitmentId));
    // `current` only signals row existence to the reducer: a `CommitmentCaptured`
    // rebuilds the row wholly from its event and `CommitmentCaptureUndone` drops
    // it — neither reads `current.protectionLevel`/`recurrence`. The projection
    // table does not persist those Story 2.3 fields (no migration), so they are
    // reconstructed as reducer-safe placeholders never read back.
    const current: CommitmentRow | null = existingRows[0]
      ? {
          id: existingRows[0].id,
          title: existingRows[0].title,
          context: existingRows[0].context as EventContext,
          status: existingRows[0].status,
          protectionLevel: 'hard-commitment',
          recurrence: null,
          createdAt: existingRows[0].createdAt.toISOString(),
          updatedAt: existingRows[0].updatedAt.toISOString(),
        }
      : null;

    const next = reduceCommitment(current, event);
    if (next === null) {
      await tx.delete(commitment).where(eq(commitment.id, commitmentId));
      return;
    }
    await tx
      .insert(commitment)
      .values({
        id: next.id,
        title: next.title,
        context: next.context,
        status: next.status,
        createdAt: new Date(next.createdAt),
        updatedAt: new Date(next.updatedAt),
      })
      .onConflictDoUpdate({
        target: commitment.id,
        set: {
          title: next.title,
          context: next.context,
          status: next.status,
          updatedAt: new Date(next.updatedAt),
        },
      });
  }
}

/** Which commitment id an event concerns, or null. Mirrors the ledger reducer. */
function commitmentIdOf(event: DomainEvent): string | null {
  switch (event.eventType) {
    case 'CommitmentCaptured':
    case 'CommitmentCaptureUndone':
      return typeof event.payload.commitmentId === 'string'
        ? event.payload.commitmentId
        : null;
    default:
      return null;
  }
}
