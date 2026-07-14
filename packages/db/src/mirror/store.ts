/**
 * Postgres-backed calendar source-mirror store (Story 1.4, AD-6/AD-7).
 *
 * Owns the mutable `calendar_source` + `calendar_event_mirror` cache and records
 * the AD-4 sync-health facts (`CalendarConnected`, `CalendarSynced`,
 * `CalendarSyncFailed`) via an INJECTED `LedgerStore` — the store never appends
 * events itself, keeping the append-only log the ledger's sole responsibility.
 *
 * Invariants:
 *  - Context is chosen at connect and IMMUTABLE (AD-6): `connectSource` inserts
 *    a new identity or, on a repeat connect of the SAME (provider, account,
 *    context), refreshes tokens + re-activates the SAME row. It NEVER updates
 *    `context`. A different context for the same account is a distinct source.
 *  - Reads are context-separated (AD-5): `readMirrorEvents(context)` filters in
 *    the query.
 *  - Tokens are encrypted at rest (token-cipher); never plaintext.
 *  - Sync never writes domain/commitment state (AD-7).
 */
import { and, eq } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import type { EventContext, LedgerStore } from '@life-focus/ledger';
import type { MirrorEvent } from '@life-focus/connectors';
import { calendarSource, calendarEventMirror } from '../schema/mirror.js';
import type { DbClient } from '../index.js';
import { encryptSecret, decryptSecret, decodeTokenKey } from './token-cipher.js';

/** A source context is work|personal only (AD-5, no joint on source rows). */
export type SourceContext = 'work' | 'personal';

/** Public view of a connected source (no token ciphertext leaks out). */
export interface SourceRecord {
  readonly id: string;
  readonly provider: string;
  readonly account: string;
  readonly context: SourceContext;
  readonly googleCalendarId: string;
  readonly status: string;
  readonly syncToken: string | null;
  readonly lastSyncedAt: string | null;
  readonly lastSyncStatus: string | null;
  readonly lastError: string | null;
}

/** Decrypted tokens for a source, for the worker to run a sync. */
export interface DecryptedTokens {
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly accessTokenExpiresAt: string | null;
}

export interface ConnectSourceInput {
  readonly provider: 'gcal';
  readonly account: string;
  readonly context: SourceContext;
  readonly googleCalendarId: string;
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly accessTokenExpiresAt: string | null;
  /** Who initiated the connect (actor label for the AD-4 event). */
  readonly actor: string;
}

export interface MirrorStoreOptions {
  /** LEDGER_MASTER_KEY (base64/hex → 32 bytes) — reused for token encryption. */
  readonly masterKey: string;
  /** The ledger store to append AD-4 sync-health events through. */
  readonly ledger: LedgerStore;
}

export interface MirrorStore {
  /** Connect (or reconnect) a source; context immutable (AD-6). Appends CalendarConnected. */
  connectSource(input: ConnectSourceInput): Promise<SourceRecord>;
  /** All sources (for the connections screen). */
  listSources(): Promise<readonly SourceRecord[]>;
  /** Ids of active (non-revoked) sources — the scheduled sync sweep fans out over these. */
  listActiveSourceIds(): Promise<readonly string[]>;
  getSource(id: string): Promise<SourceRecord | null>;
  /** Decrypted tokens for a source (worker use). */
  getDecryptedTokens(id: string): Promise<DecryptedTokens | null>;
  /** Store a freshly refreshed access token (encrypted). */
  updateAccessToken(
    id: string,
    accessToken: string,
    accessTokenExpiresAt: string | null,
  ): Promise<void>;
  /** Replace the mirror cache for a source with the given live events + remove cancellations. */
  replaceMirrorEvents(
    sourceId: string,
    context: SourceContext,
    events: readonly MirrorEvent[],
    cancelledIds: readonly string[],
  ): Promise<void>;
  /** Record a successful sync: store token, health, and append CalendarSynced. */
  recordSyncSuccess(
    id: string,
    args: { syncType: 'initial' | 'incremental'; eventCount: number; nextSyncToken: string | null },
  ): Promise<void>;
  /** Record a failed sync: set health (+ status='revoked' on authError) and append CalendarSyncFailed. */
  recordSyncFailure(
    id: string,
    args: { authError: boolean; reason: string },
  ): Promise<void>;
  /** Clear the sync token (410 GONE → full resync next run). */
  clearSyncToken(id: string): Promise<void>;
  /** Context-separated read of the mirror cache (AD-5). */
  readMirrorEvents(context: SourceContext): Promise<readonly MirrorEvent[]>;
}

type SourceRow = typeof calendarSource.$inferSelect;

function toRecord(row: SourceRow): SourceRecord {
  return {
    id: row.id,
    provider: row.provider,
    account: row.account,
    context: row.context as SourceContext,
    googleCalendarId: row.googleCalendarId,
    status: row.status,
    syncToken: row.syncToken,
    lastSyncedAt: row.lastSyncedAt ? row.lastSyncedAt.toISOString() : null,
    lastSyncStatus: row.lastSyncStatus,
    lastError: row.lastError,
  };
}

export function createMirrorStore(
  client: DbClient,
  options: MirrorStoreOptions,
): MirrorStore {
  const { db } = client;
  const masterKey = decodeTokenKey(options.masterKey);
  const ledger = options.ledger;

  async function loadRow(id: string): Promise<SourceRow | null> {
    const rows = await db.select().from(calendarSource).where(eq(calendarSource.id, id));
    return rows[0] ?? null;
  }

  return {
    async connectSource(input: ConnectSourceInput): Promise<SourceRecord> {
      const accessTokenCipher = encryptSecret(input.accessToken, masterKey);
      const refreshTokenCipher =
        input.refreshToken !== null ? encryptSecret(input.refreshToken, masterKey) : null;
      const expiresAt = input.accessTokenExpiresAt ? new Date(input.accessTokenExpiresAt) : null;

      // AD-6: identity is (provider, account, context). A repeat connect of the
      // SAME identity refreshes tokens + re-activates the SAME row (context
      // never changes). A different context is a distinct row (new identity).
      const existing = await db
        .select()
        .from(calendarSource)
        .where(
          and(
            eq(calendarSource.provider, input.provider),
            eq(calendarSource.account, input.account),
            eq(calendarSource.context, input.context),
          ),
        );

      let row: SourceRow;
      if (existing[0]) {
        // Reconnect: update tokens/health only — NEVER context (AD-6).
        const updated = await db
          .update(calendarSource)
          .set({
            googleCalendarId: input.googleCalendarId,
            status: 'active',
            accessTokenCipher,
            // Preserve a prior refresh token if Google withheld a new one.
            ...(refreshTokenCipher !== null ? { refreshTokenCipher } : {}),
            accessTokenExpiresAt: expiresAt,
            // Reset health + force a clean full resync: a just-reconnected source
            // must not keep showing the degraded "reconnect" disclosure (a prior
            // revoke left lastSyncStatus='failed') until the next sweep succeeds.
            syncToken: null,
            lastSyncStatus: null,
            lastError: null,
          })
          .where(eq(calendarSource.id, existing[0].id))
          .returning();
        row = updated[0]!;
      } else {
        const inserted = await db
          .insert(calendarSource)
          .values({
            id: uuidv7(),
            provider: input.provider,
            account: input.account,
            context: input.context,
            googleCalendarId: input.googleCalendarId,
            status: 'active',
            accessTokenCipher,
            refreshTokenCipher,
            accessTokenExpiresAt: expiresAt,
          })
          .returning();
        row = inserted[0]!;
      }

      // AD-4: record the connect fact for the audit trail (no sensitive fields).
      await ledger.append({
        eventType: 'CalendarConnected',
        actor: input.actor,
        context: input.context as EventContext,
        payload: {
          sourceId: row.id,
          provider: 'gcal',
          account: row.account,
          context: input.context,
          googleCalendarId: row.googleCalendarId,
        },
      });

      return toRecord(row);
    },

    async listSources(): Promise<readonly SourceRecord[]> {
      const rows = await db.select().from(calendarSource).orderBy(calendarSource.createdAt);
      return rows.map(toRecord);
    },

    async listActiveSourceIds(): Promise<readonly string[]> {
      const rows = await db
        .select({ id: calendarSource.id })
        .from(calendarSource)
        .where(eq(calendarSource.status, 'active'));
      return rows.map((r) => r.id);
    },

    async getSource(id: string): Promise<SourceRecord | null> {
      const row = await loadRow(id);
      return row ? toRecord(row) : null;
    },

    async getDecryptedTokens(id: string): Promise<DecryptedTokens | null> {
      const row = await loadRow(id);
      if (!row) return null;
      return {
        accessToken: row.accessTokenCipher ? decryptSecret(row.accessTokenCipher, masterKey) : null,
        refreshToken: row.refreshTokenCipher
          ? decryptSecret(row.refreshTokenCipher, masterKey)
          : null,
        accessTokenExpiresAt: row.accessTokenExpiresAt
          ? row.accessTokenExpiresAt.toISOString()
          : null,
      };
    },

    async updateAccessToken(
      id: string,
      accessToken: string,
      accessTokenExpiresAt: string | null,
    ): Promise<void> {
      await db
        .update(calendarSource)
        .set({
          accessTokenCipher: encryptSecret(accessToken, masterKey),
          accessTokenExpiresAt: accessTokenExpiresAt ? new Date(accessTokenExpiresAt) : null,
        })
        .where(eq(calendarSource.id, id));
    },

    async replaceMirrorEvents(
      sourceId: string,
      context: SourceContext,
      events: readonly MirrorEvent[],
      cancelledIds: readonly string[],
    ): Promise<void> {
      await db.transaction(async (tx) => {
        for (const cid of cancelledIds) {
          await tx
            .delete(calendarEventMirror)
            .where(
              and(
                eq(calendarEventMirror.sourceId, sourceId),
                eq(calendarEventMirror.externalId, cid),
              ),
            );
        }
        for (const ev of events) {
          await tx
            .insert(calendarEventMirror)
            .values({
              id: uuidv7(),
              sourceId,
              context,
              externalId: ev.externalId,
              summary: ev.summary,
              startsAt: ev.startsAt,
              endsAt: ev.endsAt,
              allDay: ev.allDay,
              status: ev.status,
              recurringEventId: ev.recurringEventId,
              updatedAt: ev.updatedAt,
            })
            .onConflictDoUpdate({
              target: [calendarEventMirror.sourceId, calendarEventMirror.externalId],
              set: {
                summary: ev.summary,
                startsAt: ev.startsAt,
                endsAt: ev.endsAt,
                allDay: ev.allDay,
                status: ev.status,
                recurringEventId: ev.recurringEventId,
                updatedAt: ev.updatedAt,
              },
            });
        }
      });
    },

    async recordSyncSuccess(
      id: string,
      args: { syncType: 'initial' | 'incremental'; eventCount: number; nextSyncToken: string | null },
    ): Promise<void> {
      const row = await loadRow(id);
      if (!row) return;
      const syncedAt = new Date();
      await db
        .update(calendarSource)
        .set({
          // Only overwrite the token when Google returned a fresh one.
          ...(args.nextSyncToken !== null ? { syncToken: args.nextSyncToken } : {}),
          lastSyncedAt: syncedAt,
          lastSyncStatus: 'ok',
          lastError: null,
        })
        .where(eq(calendarSource.id, id));

      await ledger.append({
        eventType: 'CalendarSynced',
        actor: 'system:gcal-sync',
        context: row.context as EventContext,
        payload: {
          sourceId: id,
          context: row.context,
          syncType: args.syncType,
          eventCount: args.eventCount,
          syncedAt: syncedAt.toISOString(),
        },
      });
    },

    async recordSyncFailure(
      id: string,
      args: { authError: boolean; reason: string },
    ): Promise<void> {
      const row = await loadRow(id);
      if (!row) return;
      const failedAt = new Date();
      await db
        .update(calendarSource)
        .set({
          // A revoked token flips the source to 'revoked' (FR-62 disclosure);
          // never deletes/mutates the existing mirror rows (AD-7).
          status: args.authError ? 'revoked' : row.status,
          lastSyncStatus: 'failed',
          lastError: args.reason,
        })
        .where(eq(calendarSource.id, id));

      await ledger.append({
        eventType: 'CalendarSyncFailed',
        actor: 'system:gcal-sync',
        context: row.context as EventContext,
        payload: {
          sourceId: id,
          context: row.context,
          authError: args.authError,
          reason: args.reason,
          failedAt: failedAt.toISOString(),
        },
      });
    },

    async clearSyncToken(id: string): Promise<void> {
      await db
        .update(calendarSource)
        .set({ syncToken: null })
        .where(eq(calendarSource.id, id));
    },

    async readMirrorEvents(context: SourceContext): Promise<readonly MirrorEvent[]> {
      // Separation guarantee (AD-5): filter by context in the query.
      const rows = await db
        .select()
        .from(calendarEventMirror)
        .where(eq(calendarEventMirror.context, context));
      return rows.map((r) => ({
        externalId: r.externalId,
        context: r.context as EventContext,
        summary: r.summary,
        startsAt: r.startsAt,
        endsAt: r.endsAt,
        allDay: r.allDay,
        status: r.status,
        recurringEventId: r.recurringEventId,
        updatedAt: r.updatedAt,
      }));
    },
  };
}
