import { describe, it, expect, vi } from 'vitest';
import {
  runGcalSync,
  registerGcalSync,
  GCAL_SYNC_QUEUE,
  GCAL_SWEEP_QUEUE,
  type GcalSyncDeps,
  type GcalSyncStore,
  type SyncBoss,
} from './gcal-sync.js';
import {
  TokenRevokedError,
  SyncTokenExpiredError,
  type GcalConnector,
  type MirrorEvent,
} from '@life-focus/connectors';

const noopLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

function mirrorEvent(id: string): MirrorEvent {
  return {
    externalId: id,
    context: 'work',
    summary: id,
    startsAt: '2026-07-14T09:00:00.000Z',
    endsAt: '2026-07-14T10:00:00.000Z',
    allDay: false,
    status: 'confirmed',
    recurringEventId: null,
    updatedAt: null,
  };
}

/** A fake store recording calls; overrides customize behavior per test. */
function fakeStore(overrides: Partial<GcalSyncStore> = {}): GcalSyncStore {
  return {
    getSource: async () => ({
      id: 's-1',
      context: 'work',
      googleCalendarId: 'primary',
      status: 'active',
      syncToken: null,
    }),
    getDecryptedTokens: async () => ({ accessToken: 'at', refreshToken: 'rt' }),
    updateAccessToken: vi.fn(async () => {}),
    replaceMirrorEvents: vi.fn(async () => {}),
    recordSyncSuccess: vi.fn(async () => {}),
    recordSyncFailure: vi.fn(async () => {}),
    clearSyncToken: vi.fn(async () => {}),
    listActiveSourceIds: async () => ['s-1'],
    ...overrides,
  };
}

function fakeConnector(overrides: Partial<GcalConnector> = {}): GcalConnector {
  return {
    buildAuthUrl: () => 'https://auth',
    exchangeCode: async () => ({ accessToken: 'at', refreshToken: 'rt', expiresInSeconds: 3600, idToken: null }),
    refreshAccessToken: async () => ({ accessToken: 'fresh-at', refreshToken: null, expiresInSeconds: 3600, idToken: null }),
    fetchAccountEmail: async () => 'me@example.com',
    syncEvents: async () => ({ events: [mirrorEvent('e1')], cancelledIds: [], nextSyncToken: 'tok-1', mode: 'initial' }),
    ...overrides,
  };
}

function deps(store: GcalSyncStore, connector: GcalConnector): GcalSyncDeps {
  return {
    store,
    connector,
    logger: noopLogger,
    oauth: { clientId: 'cid', clientSecret: 'secret' },
  };
}

describe('runGcalSync', () => {
  it('SUCCESS: refreshes token, replaces mirror cache, and records CalendarSynced', async () => {
    const store = fakeStore();
    const connector = fakeConnector();
    await runGcalSync(deps(store, connector), 's-1');

    expect(store.updateAccessToken).toHaveBeenCalledWith('s-1', 'fresh-at', expect.any(String));
    expect(store.replaceMirrorEvents).toHaveBeenCalledWith(
      's-1',
      'work',
      [expect.objectContaining({ externalId: 'e1' })],
      [],
    );
    expect(store.recordSyncSuccess).toHaveBeenCalledWith('s-1', {
      syncType: 'initial',
      eventCount: 1,
      nextSyncToken: 'tok-1',
    });
    expect(store.recordSyncFailure).not.toHaveBeenCalled();
  });

  it('REVOKED (sync 401): records failure with authError, never throws, never touches success path', async () => {
    const store = fakeStore();
    const connector = fakeConnector({
      syncEvents: async () => {
        throw new TokenRevokedError();
      },
    });
    await expect(runGcalSync(deps(store, connector), 's-1')).resolves.toBeUndefined();
    expect(store.recordSyncFailure).toHaveBeenCalledWith('s-1', {
      authError: true,
      reason: 'invalid_grant',
    });
    expect(store.recordSyncSuccess).not.toHaveBeenCalled();
  });

  it('REVOKED (refresh invalid_grant): flags authError before any sync', async () => {
    const store = fakeStore();
    const connector = fakeConnector({
      refreshAccessToken: async () => {
        throw new TokenRevokedError();
      },
    });
    await runGcalSync(deps(store, connector), 's-1');
    expect(store.recordSyncFailure).toHaveBeenCalledWith('s-1', {
      authError: true,
      reason: 'invalid_grant',
    });
  });

  it('410 GONE: clears the sync token for a full resync next run (not a failure)', async () => {
    const store = fakeStore({
      getSource: async () => ({
        id: 's-1', context: 'work', googleCalendarId: 'primary', status: 'active', syncToken: 'stale',
      }),
    });
    const connector = fakeConnector({
      syncEvents: async () => {
        throw new SyncTokenExpiredError();
      },
    });
    await runGcalSync(deps(store, connector), 's-1');
    expect(store.clearSyncToken).toHaveBeenCalledWith('s-1');
    expect(store.recordSyncFailure).not.toHaveBeenCalled();
    expect(store.recordSyncSuccess).not.toHaveBeenCalled();
  });

  it('skips a revoked source (no reconnect yet)', async () => {
    const store = fakeStore({
      getSource: async () => ({
        id: 's-1', context: 'work', googleCalendarId: 'primary', status: 'revoked', syncToken: null,
      }),
    });
    const connector = fakeConnector();
    const spy = vi.spyOn(connector, 'refreshAccessToken');
    await runGcalSync(deps(store, connector), 's-1');
    expect(spy).not.toHaveBeenCalled();
    expect(store.recordSyncSuccess).not.toHaveBeenCalled();
  });

  it('missing refresh token → auth failure (cannot sync)', async () => {
    const store = fakeStore({
      getDecryptedTokens: async () => ({ accessToken: 'at', refreshToken: null }),
    });
    await runGcalSync(deps(store, fakeConnector()), 's-1');
    expect(store.recordSyncFailure).toHaveBeenCalledWith('s-1', {
      authError: true,
      reason: 'no_refresh_token',
    });
  });

  it('token decrypt failure: records a failure and returns (never rethrows → no endless retry)', async () => {
    const store = fakeStore({
      getDecryptedTokens: async () => {
        throw new Error('bad ciphertext');
      },
    });
    await expect(runGcalSync(deps(store, fakeConnector()), 's-1')).resolves.toBeUndefined();
    expect(store.recordSyncFailure).toHaveBeenCalledWith('s-1', {
      authError: false,
      reason: 'token_decrypt_failed',
    });
    expect(store.recordSyncSuccess).not.toHaveBeenCalled();
  });

  it('TRANSIENT error: records a non-auth failure and RETHROWS so pg-boss retries', async () => {
    const store = fakeStore();
    const connector = fakeConnector({
      syncEvents: async () => {
        throw new Error('network glitch');
      },
    });
    await expect(runGcalSync(deps(store, connector), 's-1')).rejects.toThrow('network glitch');
    expect(store.recordSyncFailure).toHaveBeenCalledWith('s-1', {
      authError: false,
      reason: 'network glitch',
    });
  });
});

describe('registerGcalSync sweep', () => {
  it('enqueues one job per active source with a per-source singletonKey (no overlapping syncs)', async () => {
    const handlers = new Map<string, (jobs: ReadonlyArray<{ id: string; data: unknown }>) => Promise<void>>();
    const send = vi.fn(async () => 'job-id');
    const boss: SyncBoss = {
      createQueue: vi.fn(async () => {}),
      work: vi.fn(async (name, handler) => {
        handlers.set(name, handler as never);
        return name;
      }),
      send,
      schedule: vi.fn(async () => {}),
    };
    const store = fakeStore({ listActiveSourceIds: async () => ['s-1', 's-2'] });
    await registerGcalSync(boss, deps(store, fakeConnector()));

    // Fire the sweep handler as pg-boss would.
    await handlers.get(GCAL_SWEEP_QUEUE)!([{ id: 'sweep-job', data: {} }]);

    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenCalledWith(GCAL_SYNC_QUEUE, { sourceId: 's-1' }, { singletonKey: 's-1' });
    expect(send).toHaveBeenCalledWith(GCAL_SYNC_QUEUE, { sourceId: 's-2' }, { singletonKey: 's-2' });
  });
});
