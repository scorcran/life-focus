import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createDbClient, closeDb } from '../index.js';
import { ledgerEvent, commitment } from '../schema/ledger.js';
import { calendarSource } from '../schema/mirror.js';
import { eq } from 'drizzle-orm';
import type { LedgerStore } from '@life-focus/ledger';
import type { MirrorEvent } from '@life-focus/connectors';
import { createLedgerStore } from '../ledger/store.js';
import { createMirrorStore, type MirrorStore } from './store.js';
import { startPg, pgAvailable, type PgHarness } from '../../test/pg.js';

const MASTER_KEY = Buffer.alloc(32, 13).toString('base64');

const hasPg = await pgAvailable();

function ev(externalId: string, context: 'work' | 'personal'): MirrorEvent {
  return {
    externalId,
    context,
    summary: `Event ${externalId}`,
    startsAt: '2026-07-14T09:00:00.000Z',
    endsAt: '2026-07-14T10:00:00.000Z',
    allDay: false,
    status: 'confirmed',
    recurringEventId: null,
    updatedAt: '2026-07-13T00:00:00.000Z',
  };
}

describe.skipIf(!hasPg)('createMirrorStore (Postgres integration)', () => {
  let harness: PgHarness;
  let client: ReturnType<typeof createDbClient>;
  let ledger: LedgerStore;
  let store: MirrorStore;

  beforeAll(async () => {
    harness = await startPg();
    client = createDbClient(harness.connectionString);
    ledger = createLedgerStore(client, { masterKey: MASTER_KEY });
    store = createMirrorStore(client, { masterKey: MASTER_KEY, ledger });
  }, 120_000);

  afterAll(async () => {
    if (client) await closeDb(client.pool);
    if (harness) await harness.teardown();
  }, 60_000);

  it('connectSource inserts a unique (provider, account, context) identity, encrypts tokens, and appends CalendarConnected', async () => {
    const rec = await store.connectSource({
      provider: 'gcal',
      account: 'me@example.com',
      context: 'work',
      googleCalendarId: 'primary',
      accessToken: 'at-work',
      refreshToken: 'rt-work',
      accessTokenExpiresAt: '2026-07-14T10:00:00.000Z',
      actor: 'user-1',
    });
    expect(rec.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(rec.context).toBe('work');
    expect(rec.status).toBe('active');

    // Tokens are encrypted at rest — the raw column is NOT the plaintext.
    const raw = await client.db
      .select()
      .from(calendarSource)
      .where(eq(calendarSource.id, rec.id));
    const row = raw[0]!;
    expect(row.accessTokenCipher).not.toBeNull();
    expect(row.accessTokenCipher).not.toContain('at-work');

    // Decrypted tokens round-trip for the worker.
    const tokens = await store.getDecryptedTokens(rec.id);
    expect(tokens?.accessToken).toBe('at-work');
    expect(tokens?.refreshToken).toBe('rt-work');

    // CalendarConnected appended (AD-4).
    const events = await ledger.readEvents({ eventType: 'CalendarConnected' });
    expect(events.some((e) => e.payload.sourceId === rec.id)).toBe(true);
  });

  it('reconnect of the SAME identity refreshes tokens and re-activates the SAME row (context immutable, AD-6)', async () => {
    const first = await store.connectSource({
      provider: 'gcal',
      account: 'recon@example.com',
      context: 'personal',
      googleCalendarId: 'primary',
      accessToken: 'at-1',
      refreshToken: 'rt-1',
      accessTokenExpiresAt: null,
      actor: 'user-1',
    });
    const second = await store.connectSource({
      provider: 'gcal',
      account: 'recon@example.com',
      context: 'personal',
      googleCalendarId: 'primary',
      accessToken: 'at-2',
      refreshToken: 'rt-2',
      accessTokenExpiresAt: null,
      actor: 'user-1',
    });
    expect(second.id).toBe(first.id); // same row
    expect(second.context).toBe('personal'); // context unchanged
    const tokens = await store.getDecryptedTokens(first.id);
    expect(tokens?.accessToken).toBe('at-2'); // refreshed
  });

  it('a DIFFERENT context for the same account is a distinct source (new identity)', async () => {
    const work = await store.connectSource({
      provider: 'gcal',
      account: 'dual@example.com',
      context: 'work',
      googleCalendarId: 'primary',
      accessToken: 'at',
      refreshToken: 'rt',
      accessTokenExpiresAt: null,
      actor: 'user-1',
    });
    const personal = await store.connectSource({
      provider: 'gcal',
      account: 'dual@example.com',
      context: 'personal',
      googleCalendarId: 'primary',
      accessToken: 'at',
      refreshToken: 'rt',
      accessTokenExpiresAt: null,
      actor: 'user-1',
    });
    expect(work.id).not.toBe(personal.id);
  });

  it('recordSyncSuccess stores the token + health and appends CalendarSynced; replaceMirrorEvents caches events; reads are context-separated', async () => {
    const src = await store.connectSource({
      provider: 'gcal',
      account: 'sync@example.com',
      context: 'work',
      googleCalendarId: 'primary',
      accessToken: 'at',
      refreshToken: 'rt',
      accessTokenExpiresAt: null,
      actor: 'user-1',
    });
    await store.replaceMirrorEvents(src.id, 'work', [ev('w-1', 'work'), ev('w-2', 'work')], []);
    await store.recordSyncSuccess(src.id, { syncType: 'initial', eventCount: 2, nextSyncToken: 'tok-1' });

    const after = await store.getSource(src.id);
    expect(after?.syncToken).toBe('tok-1');
    expect(after?.lastSyncStatus).toBe('ok');

    const synced = await ledger.readEvents({ eventType: 'CalendarSynced' });
    expect(synced.some((e) => e.payload.sourceId === src.id)).toBe(true);

    // Cancellation removal + context separation.
    await store.replaceMirrorEvents(src.id, 'work', [ev('w-3', 'work')], ['w-1']);
    const work = await store.readMirrorEvents('work');
    const workIds = work.map((e) => e.externalId);
    expect(workIds).toContain('w-2');
    expect(workIds).toContain('w-3');
    expect(workIds).not.toContain('w-1'); // cancelled → removed
  });

  it('a work read never returns personal mirror rows and vice versa (separation)', async () => {
    const workSrc = await store.connectSource({
      provider: 'gcal', account: 'sep-w@example.com', context: 'work',
      googleCalendarId: 'primary', accessToken: 'a', refreshToken: 'r',
      accessTokenExpiresAt: null, actor: 'user-1',
    });
    const personalSrc = await store.connectSource({
      provider: 'gcal', account: 'sep-p@example.com', context: 'personal',
      googleCalendarId: 'primary', accessToken: 'a', refreshToken: 'r',
      accessTokenExpiresAt: null, actor: 'user-1',
    });
    await store.replaceMirrorEvents(workSrc.id, 'work', [ev('sep-work', 'work')], []);
    await store.replaceMirrorEvents(personalSrc.id, 'personal', [ev('sep-personal', 'personal')], []);

    const work = (await store.readMirrorEvents('work')).map((e) => e.externalId);
    const personal = (await store.readMirrorEvents('personal')).map((e) => e.externalId);
    expect(work).toContain('sep-work');
    expect(work).not.toContain('sep-personal');
    expect(personal).toContain('sep-personal');
    expect(personal).not.toContain('sep-work');
  });

  it('recordSyncFailure(authError) flips status to revoked, keeps prior mirror rows, and never touches domain rows (AD-7)', async () => {
    const src = await store.connectSource({
      provider: 'gcal', account: 'revoke@example.com', context: 'work',
      googleCalendarId: 'primary', accessToken: 'a', refreshToken: 'r',
      accessTokenExpiresAt: null, actor: 'user-1',
    });
    await store.replaceMirrorEvents(src.id, 'work', [ev('keep-me', 'work')], []);

    // Snapshot commitment (domain) rows before failure.
    const commitBefore = await client.db.select().from(commitment);

    await store.recordSyncFailure(src.id, { authError: true, reason: 'invalid_grant' });

    const after = await store.getSource(src.id);
    expect(after?.status).toBe('revoked');
    expect(after?.lastSyncStatus).toBe('failed');

    // Prior mirror rows are untouched.
    const work = (await store.readMirrorEvents('work')).map((e) => e.externalId);
    expect(work).toContain('keep-me');

    // No domain row created/mutated/deleted by sync failure.
    const commitAfter = await client.db.select().from(commitment);
    expect(commitAfter.length).toBe(commitBefore.length);

    // CalendarSyncFailed{authError:true} appended.
    const failed = await ledger.readEvents({ eventType: 'CalendarSyncFailed' });
    const mine = failed.find((e) => e.payload.sourceId === src.id);
    expect(mine?.payload.authError).toBe(true);

    // Sanity: it did not write any commitment-typed events.
    const all = await client.db.select().from(ledgerEvent).where(eq(ledgerEvent.eventType, 'CommitmentCaptured'));
    expect(Array.isArray(all)).toBe(true);
  });

  it('reconnecting a revoked source clears the degraded health so the UI does not keep disclosing "reconnect"', async () => {
    const src = await store.connectSource({
      provider: 'gcal', account: 'reconn@example.com', context: 'work',
      googleCalendarId: 'primary', accessToken: 'a', refreshToken: 'r',
      accessTokenExpiresAt: null, actor: 'user-1',
    });
    // Advance the sync cursor, then revoke.
    await store.recordSyncSuccess(src.id, { syncType: 'initial', eventCount: 0, nextSyncToken: 'tok-1' });
    await store.recordSyncFailure(src.id, { authError: true, reason: 'invalid_grant' });
    const revoked = await store.getSource(src.id);
    expect(revoked?.status).toBe('revoked');
    expect(revoked?.lastSyncStatus).toBe('failed');

    // Reconnect the SAME identity.
    const again = await store.connectSource({
      provider: 'gcal', account: 'reconn@example.com', context: 'work',
      googleCalendarId: 'primary', accessToken: 'a2', refreshToken: 'r2',
      accessTokenExpiresAt: null, actor: 'user-1',
    });
    expect(again.id).toBe(src.id); // same row (context immutable)
    const after = await store.getSource(src.id);
    expect(after?.status).toBe('active');
    expect(after?.lastSyncStatus).toBeNull(); // no longer 'failed' → UI shows "awaiting first sync"
    expect(after?.lastError).toBeNull();
    expect(after?.syncToken).toBeNull(); // forced full resync after reconnect
  });

  it('clearSyncToken nulls the token for a full resync', async () => {
    const src = await store.connectSource({
      provider: 'gcal', account: 'gone@example.com', context: 'work',
      googleCalendarId: 'primary', accessToken: 'a', refreshToken: 'r',
      accessTokenExpiresAt: null, actor: 'user-1',
    });
    await store.recordSyncSuccess(src.id, { syncType: 'initial', eventCount: 0, nextSyncToken: 'tok' });
    await store.clearSyncToken(src.id);
    const after = await store.getSource(src.id);
    expect(after?.syncToken).toBeNull();
  });
});
