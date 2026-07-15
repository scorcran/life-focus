/**
 * Event-ledger tables (AD-4, AD-5, AD-9). Plain Postgres via Drizzle.
 *
 * - `ledger_event`  — insert-only event log. A BEFORE UPDATE OR DELETE trigger
 *   (added in a custom migration) rejects any mutation at the DB level.
 * - `commitment`    — projection table, current state rebuilt from events.
 * - `ledger_erasure_key` — MUTABLE per-scope wrapped data-key store (ADR 0001);
 *   deleting a row crypto-shreds that scope's sensitive fields.
 *
 * The `context` column is a non-null CHECK-constrained text in {work,personal,joint}
 * (AD-5). `event_seq` is a monotonic identity bigint assigned by the DB.
 */
import { pgTable, text, jsonb, timestamp, bigint, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/** Insert-only event log (AD-4). No UPDATE/DELETE — enforced by DB trigger. */
export const ledgerEvent = pgTable(
  'ledger_event',
  {
    id: text('id').primaryKey(),
    // Monotonic sequence assigned by the DB (identity).
    eventSeq: bigint('event_seq', { mode: 'number' })
      .generatedAlwaysAsIdentity()
      .notNull(),
    eventType: text('event_type').notNull(),
    actor: text('actor').notNull(),
    context: text('context').notNull(),
    payload: jsonb('payload').notNull(),
    causedBy: text('caused_by'),
    compensatesEventId: text('compensates_event_id'),
    erasureScope: text('erasure_scope'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    check('ledger_event_context_check', sql`${t.context} in ('work','personal','joint')`),
    index('ledger_event_context_idx').on(t.context),
    index('ledger_event_type_idx').on(t.eventType),
    index('ledger_event_erasure_scope_idx').on(t.erasureScope),
  ],
);

/** Commitment projection (current state; rebuilt from events). */
export const commitment = pgTable(
  'commitment',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    context: text('context').notNull(),
    status: text('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    check('commitment_context_check', sql`${t.context} in ('work','personal','joint')`),
    index('commitment_context_idx').on(t.context),
  ],
);

/**
 * Mutable per-scope wrapped-data-key store (ADR 0001). NOT an event table —
 * rows may be deleted to crypto-shred a scope. `wrapped_data_key` is the
 * per-scope AES key, envelope-encrypted under LEDGER_MASTER_KEY (base64 text).
 */
export const ledgerErasureKey = pgTable('ledger_erasure_key', {
  erasureScope: text('erasure_scope').primaryKey(),
  wrappedDataKey: text('wrapped_data_key').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/** All ledger tables, bundled for the Drizzle client's `schema` option. */
export const ledgerSchema = { ledgerEvent, commitment, ledgerErasureKey };
