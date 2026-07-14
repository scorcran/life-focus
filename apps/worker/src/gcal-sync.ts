/**
 * Google Calendar sync job (Story 1.4, AD-7). Thin over the injected connector
 * + mirror store — handler logic is an exported pure-ish function so it is unit
 * tested by DIRECT invocation with fakes (no queue, no real network, no Docker).
 *
 * One scheduled sweep enqueues one `gcal-sync` job per ACTIVE source; each job
 * runs `runGcalSync`:
 *   - initial full sync when `syncToken IS NULL`, else incremental;
 *   - success → replace mirror cache + recordSyncSuccess (CalendarSynced);
 *   - TokenRevokedError → recordSyncFailure(authError) → source flips to
 *     'revoked' and the connections screen discloses it within one cycle (FR-62);
 *   - SyncTokenExpiredError (410) → clear token for a full resync next run.
 * Connector failure never mutates or deletes domain rows (AD-7).
 */
import {
  TokenRevokedError,
  SyncTokenExpiredError,
  type GcalConnector,
  type MirrorEvent,
} from '@life-focus/connectors';

export const GCAL_SYNC_QUEUE = 'gcal-sync';

/** Payload of one enqueued sync job. */
export interface GcalSyncJobData {
  readonly sourceId: string;
}

/** The subset of the mirror store the sync job depends on (structural, testable). */
export interface GcalSyncStore {
  getSource(id: string): Promise<{
    readonly id: string;
    readonly context: 'work' | 'personal';
    readonly googleCalendarId: string;
    readonly status: string;
    readonly syncToken: string | null;
  } | null>;
  getDecryptedTokens(id: string): Promise<{
    readonly accessToken: string | null;
    readonly refreshToken: string | null;
  } | null>;
  updateAccessToken(id: string, accessToken: string, expiresAt: string | null): Promise<void>;
  replaceMirrorEvents(
    sourceId: string,
    context: 'work' | 'personal',
    events: readonly MirrorEvent[],
    cancelledIds: readonly string[],
  ): Promise<void>;
  recordSyncSuccess(
    id: string,
    args: { syncType: 'initial' | 'incremental'; eventCount: number; nextSyncToken: string | null },
  ): Promise<void>;
  recordSyncFailure(id: string, args: { authError: boolean; reason: string }): Promise<void>;
  clearSyncToken(id: string): Promise<void>;
  listActiveSourceIds(): Promise<readonly string[]>;
}

/** Structural logger so the pure handler stays independent of pino. */
export interface SyncLogger {
  info(obj: unknown, msg?: string): void;
  warn(obj: unknown, msg?: string): void;
  error(obj: unknown, msg?: string): void;
}

export interface GcalSyncDeps {
  readonly connector: GcalConnector;
  readonly store: GcalSyncStore;
  readonly logger: SyncLogger;
  /** OAuth client creds for refreshing access tokens. */
  readonly oauth: { readonly clientId: string; readonly clientSecret: string };
}

/**
 * Run one sync for one source. Idempotent and side-effect-scoped to the mirror
 * cache + sync-health events — never domain state (AD-7).
 */
export async function runGcalSync(deps: GcalSyncDeps, sourceId: string): Promise<void> {
  const { connector, store, logger } = deps;
  const source = await store.getSource(sourceId);
  if (!source) {
    logger.warn({ sourceId }, 'gcal-sync: source not found; skipping');
    return;
  }
  if (source.status === 'revoked') {
    logger.info({ sourceId }, 'gcal-sync: source revoked; skipping until reconnect');
    return;
  }

  // Token decryption can fail non-transiently (corrupt ciphertext / rotated
  // master key); it runs before the sync try-block, so guard it explicitly —
  // an uncaught throw here would retry forever and record no sync-health.
  let tokens;
  try {
    tokens = await store.getDecryptedTokens(sourceId);
  } catch (err) {
    await store.recordSyncFailure(sourceId, { authError: false, reason: 'token_decrypt_failed' });
    logger.error({ sourceId, err }, 'gcal-sync: token decrypt failed; not retrying');
    return;
  }
  if (!tokens || !tokens.refreshToken) {
    await store.recordSyncFailure(sourceId, { authError: true, reason: 'no_refresh_token' });
    return;
  }

  try {
    // Refresh the access token each run (short-lived); a revoked grant surfaces here.
    const refreshed = await connector.refreshAccessToken({
      refreshToken: tokens.refreshToken,
      clientId: deps.oauth.clientId,
      clientSecret: deps.oauth.clientSecret,
    });
    const expiresAt =
      refreshed.expiresInSeconds !== null
        ? new Date(Date.now() + refreshed.expiresInSeconds * 1000).toISOString()
        : null;
    await store.updateAccessToken(sourceId, refreshed.accessToken, expiresAt);

    const result = await connector.syncEvents({
      accessToken: refreshed.accessToken,
      calendarId: source.googleCalendarId,
      context: source.context,
      syncToken: source.syncToken,
    });

    await store.replaceMirrorEvents(sourceId, source.context, result.events, result.cancelledIds);
    await store.recordSyncSuccess(sourceId, {
      syncType: result.mode,
      eventCount: result.events.length,
      nextSyncToken: result.nextSyncToken,
    });
    logger.info(
      { sourceId, mode: result.mode, eventCount: result.events.length },
      'gcal-sync: success',
    );
  } catch (err) {
    if (err instanceof SyncTokenExpiredError) {
      // 410 GONE — clear the token so the next run is a full resync. Not a failure.
      await store.clearSyncToken(sourceId);
      logger.warn({ sourceId }, 'gcal-sync: sync token expired; cleared for full resync');
      return;
    }
    if (err instanceof TokenRevokedError) {
      await store.recordSyncFailure(sourceId, { authError: true, reason: 'invalid_grant' });
      logger.warn({ sourceId }, 'gcal-sync: token revoked; source flagged for reconnect');
      return;
    }
    // Transient/unknown error: record a non-auth failure and RETHROW so pg-boss
    // retries with backoff (exhaustion leaves lastSyncStatus='failed').
    const reason = err instanceof Error ? err.message : 'unknown_error';
    await store.recordSyncFailure(sourceId, { authError: false, reason });
    logger.error({ sourceId, err }, 'gcal-sync: transient failure; will retry');
    throw err;
  }
}

// ── pg-boss wiring (host glue; not unit-tested through the queue) ─────────────

/** Minimal pg-boss surface used for registering the sync queue + schedule. */
export interface SyncBoss {
  createQueue(name: string, options?: { retryLimit?: number; retryBackoff?: boolean }): Promise<void>;
  work<T>(name: string, handler: (jobs: ReadonlyArray<{ id: string; data: T }>) => Promise<void>): Promise<string>;
  send(name: string, data: object, options?: object): Promise<string | null>;
  schedule(name: string, cron: string, data?: object | null, options?: object): Promise<void>;
}

export const GCAL_SWEEP_QUEUE = 'gcal-sync-sweep';

/**
 * Register the sync queue (retry/backoff), its worker, and a scheduled sweep
 * that fans out one job per active source. Called from the worker's main().
 */
export async function registerGcalSync(boss: SyncBoss, deps: GcalSyncDeps): Promise<void> {
  // Per-source sync jobs retry with exponential backoff (pg-boss).
  await boss.createQueue(GCAL_SYNC_QUEUE, { retryLimit: 5, retryBackoff: true });
  await boss.createQueue(GCAL_SWEEP_QUEUE);

  await boss.work<GcalSyncJobData>(GCAL_SYNC_QUEUE, async (jobs) => {
    for (const job of jobs) {
      await runGcalSync(deps, job.data.sourceId);
    }
  });

  // The sweep enqueues one sync job per active source.
  await boss.work<Record<string, never>>(GCAL_SWEEP_QUEUE, async () => {
    const ids = await deps.store.listActiveSourceIds();
    for (const sourceId of ids) {
      // singletonKey serializes per source: if a prior run is still queued/active
      // (a sync outlasting the 5-min sweep), don't enqueue an overlapping job that
      // would race the mirror upsert + sync-token write for the same source.
      await boss.send(GCAL_SYNC_QUEUE, { sourceId } satisfies GcalSyncJobData, {
        singletonKey: sourceId,
      });
    }
    deps.logger.info({ count: ids.length }, 'gcal-sync sweep: enqueued per-source jobs');
  });

  // Run the sweep every 5 minutes → a freshly connected source syncs on the
  // next cycle, and a revocation surfaces "within one sync cycle" (FR-62).
  await boss.schedule(GCAL_SWEEP_QUEUE, '*/5 * * * *', {});
}
