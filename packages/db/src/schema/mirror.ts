/**
 * Source-mirror tables for the Google Calendar connector (Story 1.4, AD-6/AD-7).
 *
 * These are CACHE / operational tables (AD-7): safe to drop and rebuild from
 * Google. They are MUTABLE (plain tables, NO insert-only trigger) — tokens,
 * sync cursor, and health are updated in place. Domain state (commitment /
 * ledger) is NEVER written from calendar data.
 *
 *  - `calendar_source`        — one row per connected (provider, account, context)
 *    identity (AD-6, immutable context via a UNIQUE constraint + no update path).
 *    OAuth tokens are stored ENCRYPTED (token-cipher under LEDGER_MASTER_KEY).
 *  - `calendar_event_mirror`  — normalized, context-tagged event cache (NFR-6:
 *    only planning-necessary fields — no bodies/attendees).
 */
import { pgTable, text, timestamp, boolean, index, unique, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * A connected calendar data source. Context is chosen at connect time and is
 * immutable (AD-6) — the UNIQUE(provider, account, context) identity means a
 * different context for the same account is a DISTINCT source, and there is no
 * code path that updates `context`. `joint` is illegal here (AD-5).
 */
export const calendarSource = pgTable(
  'calendar_source',
  {
    id: text('id').primaryKey(),
    provider: text('provider').notNull(),
    account: text('account').notNull(),
    context: text('context').notNull(),
    googleCalendarId: text('google_calendar_id').notNull(),
    // 'active' | 'revoked' — operational status the connections screen surfaces.
    status: text('status').notNull().default('active'),
    // OAuth tokens, encrypted at rest (token-cipher). Never plaintext.
    accessTokenCipher: text('access_token_cipher'),
    refreshTokenCipher: text('refresh_token_cipher'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    // Incremental sync cursor from Google; null → initial full sync next run.
    syncToken: text('sync_token'),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    // 'ok' | 'failed' | null — last sync outcome (FR-62 disclosure).
    lastSyncStatus: text('last_sync_status'),
    lastError: text('last_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    // AD-5: only work|personal on a source-mirror row (no joint).
    check('calendar_source_context_check', sql`${t.context} in ('work','personal')`),
    // AD-6: (provider, account, context) is the immutable source identity.
    unique('calendar_source_identity_uq').on(t.provider, t.account, t.context),
    index('calendar_source_context_idx').on(t.context),
    index('calendar_source_status_idx').on(t.status),
  ],
);

/**
 * Normalized calendar events (the AD-7 cache). Context-tagged for separation
 * (AD-5) — reads filter by context. Only planning-necessary fields (NFR-6).
 */
export const calendarEventMirror = pgTable(
  'calendar_event_mirror',
  {
    id: text('id').primaryKey(),
    sourceId: text('source_id')
      .notNull()
      .references(() => calendarSource.id, { onDelete: 'cascade' }),
    context: text('context').notNull(),
    externalId: text('external_id').notNull(),
    summary: text('summary'),
    startsAt: text('starts_at').notNull(),
    endsAt: text('ends_at').notNull(),
    allDay: boolean('all_day').notNull().default(false),
    status: text('status').notNull(),
    recurringEventId: text('recurring_event_id'),
    updatedAt: text('updated_at'),
  },
  (t) => [
    check('calendar_event_mirror_context_check', sql`${t.context} in ('work','personal')`),
    unique('calendar_event_mirror_external_uq').on(t.sourceId, t.externalId),
    index('calendar_event_mirror_source_idx').on(t.sourceId),
    index('calendar_event_mirror_context_idx').on(t.context),
  ],
);

/** All mirror tables, bundled for the Drizzle client's `schema` option. */
export const mirrorSchema = { calendarSource, calendarEventMirror };
