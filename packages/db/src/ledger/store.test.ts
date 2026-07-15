import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createDbClient, closeDb } from '../index.js';
import { ledgerEvent } from '../schema/ledger.js';
import { eq, sql } from 'drizzle-orm';
import {
  buildUndoEvent,
  projectCommitments,
  REDACTED_MARKER,
  type LedgerStore,
  type DomainEvent,
} from '@life-focus/ledger';
import { createLedgerStore } from './store.js';
import { startPg, pgAvailable, type PgHarness } from '../../test/pg.js';

const MASTER_KEY = Buffer.alloc(32, 11).toString('base64');

// Integration suite: runs when Docker or TEST_DATABASE_URL is available.
const hasPg = await pgAvailable();

describe.skipIf(!hasPg)('createLedgerStore (Postgres integration)', () => {
  let harness: PgHarness;
  let client: ReturnType<typeof createDbClient>;
  let store: LedgerStore;

  function captureInput(id: string, title: string, context: 'work' | 'personal') {
    const now = '2026-07-13T00:00:00.000Z';
    return {
      eventType: 'CommitmentCaptured',
      actor: 'user-1',
      context,
      payload: {
        commitmentId: id,
        title,
        context,
        status: 'captured',
        protectionLevel: 'hard-commitment',
        createdAt: now,
        updatedAt: now,
      },
    } as const;
  }

  beforeAll(async () => {
    harness = await startPg();
    client = createDbClient(harness.connectionString);
    store = createLedgerStore(client, { masterKey: MASTER_KEY });
  }, 120_000);

  afterAll(async () => {
    if (client) await closeDb(client.pool);
    if (harness) await harness.teardown();
  }, 60_000);

  it('append → inserts an event with UUIDv7 id + monotonic event_seq and upserts the projection', async () => {
    const first = await store.append(captureInput('c-append-1', 'Ship it', 'work'));
    expect(first.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(typeof first.eventSeq).toBe('number');

    const second = await store.append(captureInput('c-append-2', 'And this', 'work'));
    expect(second.eventSeq).toBeGreaterThan(first.eventSeq); // monotonic

    const rows = await store.readCommitments('work');
    const ids = rows.map((r) => r.id);
    expect(ids).toContain('c-append-1');
    expect(ids).toContain('c-append-2');
    // Sensitive title round-trips through encrypt-at-rest → decrypt-on-read.
    expect(rows.find((r) => r.id === 'c-append-1')?.title).toBe('Ship it');
  });

  it('readCommitments returns ONLY same-context rows (separation, both directions)', async () => {
    await store.append(captureInput('c-sep-work', 'Work item', 'work'));
    await store.append(captureInput('c-sep-personal', 'Personal item', 'personal'));

    const work = await store.readCommitments('work');
    const personal = await store.readCommitments('personal');

    expect(work.map((r) => r.id)).toContain('c-sep-work');
    expect(work.map((r) => r.id)).not.toContain('c-sep-personal');
    expect(personal.map((r) => r.id)).toContain('c-sep-personal');
    expect(personal.map((r) => r.id)).not.toContain('c-sep-work');
  });

  it('undo appends a forward compensating event and removes the projection row; rebuild-from-events matches', async () => {
    const captured = await store.append(captureInput('c-undo-1', 'Undo me', 'work'));

    const undoInput = buildUndoEvent(captured);
    const undo = await store.append(undoInput);
    expect(undo.eventType).toBe('CommitmentCaptureUndone');
    expect(undo.compensatesEventId).toBe(captured.id);

    // Projection row is gone.
    const rows = await store.readCommitments('work');
    expect(rows.map((r) => r.id)).not.toContain('c-undo-1');

    // Rebuild-from-raw-events (via the pure ledger projector) equals stored projection.
    const events: readonly DomainEvent[] = await store.readEvents({ context: 'work' });
    const rebuilt = projectCommitments(events);
    const rebuiltIds = new Set(rebuilt.map((r) => r.id));
    const storedIds = new Set((await store.readCommitments('work')).map((r) => r.id));
    expect(rebuiltIds).toEqual(storedIds);
    expect(rebuiltIds.has('c-undo-1')).toBe(false);
  });

  it('rejects a raw UPDATE and DELETE on ledger_event at the DB level (trigger)', async () => {
    const ev = await store.append(captureInput('c-immut-1', 'Immutable', 'work'));

    await expect(
      client.db.update(ledgerEvent).set({ actor: 'hacker' }).where(eq(ledgerEvent.id, ev.id)),
    ).rejects.toThrow();

    await expect(
      client.db.delete(ledgerEvent).where(eq(ledgerEvent.id, ev.id)),
    ).rejects.toThrow();

    // TRUNCATE is a statement-level vector a row trigger misses — must also fail.
    await expect(
      client.db.execute(sql`TRUNCATE ${ledgerEvent}`),
    ).rejects.toThrow();

    // Row is unchanged and still present.
    const still = await client.db.select().from(ledgerEvent).where(eq(ledgerEvent.id, ev.id));
    expect(still).toHaveLength(1);
    expect(still[0]?.actor).toBe('user-1');
  });

  it('erase(scope) makes the title unrecoverable in BOTH the event log and the projection while the event row stays byte-stable', async () => {
    const ev = await store.append(captureInput('c-erase-1', 'Secret title', 'work'));

    // Snapshot the raw row before erasure.
    const beforeRows = await client.db
      .select()
      .from(ledgerEvent)
      .where(eq(ledgerEvent.id, ev.id));
    const before = beforeRows[0]!;
    expect(before.erasureScope).toBe('commitment:c-erase-1');

    // Title decrypts fine before erasure — in the event stream AND the projection.
    const beforeEvents = await store.readEvents({ eventType: 'CommitmentCaptured' });
    const beforeEvent = beforeEvents.find((e) => e.id === ev.id)!;
    expect(beforeEvent.payload.title).toBe('Secret title');
    const beforeProj = await store.readCommitments('work');
    expect(beforeProj.find((r) => r.id === 'c-erase-1')?.title).toBe('Secret title');

    await store.erase('commitment:c-erase-1');

    // After erasure: title is redacted, unrecoverable.
    const afterEvents = await store.readEvents({ eventType: 'CommitmentCaptured' });
    const afterEvent = afterEvents.find((e) => e.id === ev.id)!;
    expect(afterEvent.payload.title).toBe(REDACTED_MARKER);

    // Crypto-shred MUST cascade to the plaintext projection, else the "erased"
    // title survives fully queryable in the commitment table.
    const afterProj = await store.readCommitments('work');
    const erasedRow = afterProj.find((r) => r.id === 'c-erase-1');
    expect(erasedRow).toBeDefined();
    expect(erasedRow?.title).toBe(REDACTED_MARKER);
    expect(erasedRow?.title).not.toBe('Secret title');

    // Event row itself is byte-stable: id, event_seq, ciphertext payload unchanged.
    const afterRows = await client.db
      .select()
      .from(ledgerEvent)
      .where(eq(ledgerEvent.id, ev.id));
    const after = afterRows[0]!;
    expect(after.id).toBe(before.id);
    expect(String(after.eventSeq)).toBe(String(before.eventSeq));
    expect(after.actor).toBe(before.actor);
    expect(JSON.stringify(after.payload)).toBe(JSON.stringify(before.payload));
  });

  it('erasing an unknown scope is a no-op (no throw)', async () => {
    await expect(store.erase('commitment:does-not-exist')).resolves.toBeUndefined();
  });

  it('append persists a PersonAdded with no projection table, encrypting name/intention at rest (Story 2.4)', async () => {
    const now = '2026-07-14T00:00:00.000Z';
    const personId = 'p-store-1';
    // Explicit person-precise erasure scope (the default scope derivation looks
    // for commitmentId only, so the action supplies this).
    const appended = await store.append({
      eventType: 'PersonAdded',
      actor: 'user-1',
      context: 'personal',
      erasureScope: `person:${personId}`,
      payload: {
        personId,
        name: 'Mom',
        relationshipType: 'Parent',
        importance: 'inner-circle',
        intention: 'Stay in regular touch',
        context: 'personal',
        rhythm: { frequency: 'weekly', daysOfWeek: [] },
        createdAt: now,
        updatedAt: now,
      },
    });
    expect(appended.erasureScope).toBe(`person:${personId}`);

    // Name/intention are ciphertext at rest (raw row is not the plaintext).
    const rawRows = await client.db
      .select()
      .from(ledgerEvent)
      .where(eq(ledgerEvent.id, appended.id));
    const rawPayload = rawRows[0]!.payload as Record<string, unknown>;
    expect(rawPayload.name).not.toBe('Mom');
    expect(rawPayload.intention).not.toBe('Stay in regular touch');
    // Non-sensitive fields stay plaintext.
    expect(rawPayload.relationshipType).toBe('Parent');
    expect(rawPayload.importance).toBe('inner-circle');

    // They decrypt on read.
    const events = await store.readEvents({ eventType: 'PersonAdded' });
    const readBack = events.find((e) => e.id === appended.id)!;
    expect(readBack.payload.name).toBe('Mom');
    expect(readBack.payload.intention).toBe('Stay in regular touch');

    // No commitment projection row was created for a person event (no table).
    const commitmentRows = await store.readCommitments('personal');
    expect(commitmentRows.map((r) => r.id)).not.toContain(personId);

    // Crypto-shred the person scope; name/intention become unrecoverable.
    await store.erase(`person:${personId}`);
    const afterEvents = await store.readEvents({ eventType: 'PersonAdded' });
    const afterEvent = afterEvents.find((e) => e.id === appended.id)!;
    expect(afterEvent.payload.name).toBe(REDACTED_MARKER);
    expect(afterEvent.payload.intention).toBe(REDACTED_MARKER);
  });

  it('append persists a GoalAdded with no projection table, encrypting title/nextAction at rest (Story 2.5)', async () => {
    const now = '2026-07-14T00:00:00.000Z';
    const goalId = 'g-store-1';
    // Explicit goal-precise erasure scope (the default scope derivation looks for
    // commitmentId only, so the action supplies this).
    const appended = await store.append({
      eventType: 'GoalAdded',
      actor: 'user-1',
      context: 'personal',
      erasureScope: `goal:${goalId}`,
      payload: {
        goalId,
        title: 'Learn to paint',
        nextAction: 'Buy a starter watercolor set',
        allocation: { frequency: 'weekly', sessionsPerWeek: 3, minutesPerSession: 45 },
        context: 'personal',
        createdAt: now,
        updatedAt: now,
      },
    });
    expect(appended.erasureScope).toBe(`goal:${goalId}`);

    // Title/nextAction are ciphertext at rest (raw row is not the plaintext).
    const rawRows = await client.db
      .select()
      .from(ledgerEvent)
      .where(eq(ledgerEvent.id, appended.id));
    const rawPayload = rawRows[0]!.payload as Record<string, unknown>;
    expect(rawPayload.title).not.toBe('Learn to paint');
    expect(rawPayload.nextAction).not.toBe('Buy a starter watercolor set');
    // Non-sensitive fields stay plaintext.
    expect(rawPayload.context).toBe('personal');
    expect(rawPayload.allocation).toEqual({
      frequency: 'weekly',
      sessionsPerWeek: 3,
      minutesPerSession: 45,
    });

    // They decrypt on read.
    const events = await store.readEvents({ eventType: 'GoalAdded' });
    const readBack = events.find((e) => e.id === appended.id)!;
    expect(readBack.payload.title).toBe('Learn to paint');
    expect(readBack.payload.nextAction).toBe('Buy a starter watercolor set');

    // No commitment projection row was created for a goal event (no table).
    const commitmentRows = await store.readCommitments('personal');
    expect(commitmentRows.map((r) => r.id)).not.toContain(goalId);

    // Crypto-shred the goal scope; title/nextAction become unrecoverable.
    await store.erase(`goal:${goalId}`);
    const afterEvents = await store.readEvents({ eventType: 'GoalAdded' });
    const afterEvent = afterEvents.find((e) => e.id === appended.id)!;
    expect(afterEvent.payload.title).toBe(REDACTED_MARKER);
    expect(afterEvent.payload.nextAction).toBe(REDACTED_MARKER);
  });

  it('append rejects an unknown event type and an invalid payload (nothing written)', async () => {
    await expect(
      store.append({ eventType: 'NopeEvent', actor: 'u', context: 'work', payload: {} }),
    ).rejects.toThrow();

    await expect(
      store.append({
        eventType: 'CommitmentCaptured',
        actor: 'u',
        context: 'work',
        payload: { title: 123 },
      }),
    ).rejects.toThrow();
  });
});
