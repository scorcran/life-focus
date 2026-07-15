import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createDbClient,
  closeDb,
  createLedgerStore,
  createMirrorStore,
  type MirrorStore,
} from '@life-focus/db';
import type { LedgerStore } from '@life-focus/ledger';
import type { MirrorEvent } from '@life-focus/connectors';
// Reuse the packages/db ephemeral-Postgres harness (env URL or Docker, else skip).
import { startPg, pgAvailable, type PgHarness } from '../../../../packages/db/test/pg.js';
import { loadAgenda } from './agenda-data.js';

const MASTER_KEY = Buffer.alloc(32, 21).toString('base64');
const TZ = 'America/New_York';

const hasPg = await pgAvailable();

function ev(externalId: string, context: 'work' | 'personal'): MirrorEvent {
  return {
    externalId,
    context,
    summary: `${context} ${externalId}`,
    // 13:00Z on 2026-07-14 → 09:00 New York (today for the fixture `now`).
    startsAt: '2026-07-14T13:00:00.000Z',
    endsAt: '2026-07-14T14:00:00.000Z',
    allDay: false,
    status: 'confirmed',
    recurringEventId: null,
    updatedAt: '2026-07-13T00:00:00.000Z',
  };
}

async function connect(store: MirrorStore, context: 'work' | 'personal'): Promise<string> {
  const rec = await store.connectSource({
    provider: 'gcal',
    account: `${context}@example.com`,
    context,
    googleCalendarId: 'primary',
    accessToken: `at-${context}`,
    refreshToken: `rt-${context}`,
    accessTokenExpiresAt: '2026-07-14T10:00:00.000Z',
    actor: 'user-1',
  });
  return rec.id;
}

describe.skipIf(!hasPg)('loadAgenda (Postgres integration — AC-14 audit + SEC-1 separation)', () => {
  let harness: PgHarness;
  let client: ReturnType<typeof createDbClient>;
  let ledger: LedgerStore;
  let mirror: MirrorStore;

  beforeAll(async () => {
    harness = await startPg();
    client = createDbClient(harness.connectionString);
    ledger = createLedgerStore(client, { masterKey: MASTER_KEY });
    mirror = createMirrorStore(client, { masterKey: MASTER_KEY, ledger });

    const workId = await connect(mirror, 'work');
    const personalId = await connect(mirror, 'personal');
    await mirror.replaceMirrorEvents(workId, 'work', [ev('w1', 'work')], []);
    await mirror.replaceMirrorEvents(personalId, 'personal', [ev('p1', 'personal')], []);
  }, 120_000);

  afterAll(async () => {
    if (client) await closeDb(client.pool);
    if (harness) await harness.teardown();
  }, 60_000);

  it('merges both contexts into one today view, each row context-tagged', async () => {
    const { items, sources } = await loadAgenda(
      { mirror, ledger },
      { now: new Date('2026-07-14T15:00:00.000Z'), timeZone: TZ },
    );
    expect(items).toHaveLength(2);
    expect(new Set(items.map((i) => i.context))).toEqual(new Set(['work', 'personal']));
    expect(sources).toHaveLength(2);
  });

  it('appends a CrossContextAccessAudited row PER contributing context (AC-14)', async () => {
    const before = (await ledger.readEvents({ eventType: 'CrossContextAccessAudited' })).length;

    await loadAgenda(
      { mirror, ledger },
      { now: new Date('2026-07-14T15:00:00.000Z'), timeZone: TZ },
    );

    const after = await ledger.readEvents({ eventType: 'CrossContextAccessAudited' });
    // One audit per contributing context (work + personal) = 2 new rows.
    expect(after.length - before).toBe(2);

    const latest = after.slice(-2);
    // Each audit outputs a source context INTO 'joint', allowed as a planning artifact.
    for (const audit of latest) {
      expect(audit.payload.targetContext).toBe('joint');
      expect(audit.payload.allowed).toBe(true);
      expect(audit.payload.isPlanningArtifact).toBe(true);
    }
    expect(new Set(latest.map((a) => a.payload.sourceContext))).toEqual(new Set(['work', 'personal']));
  });

  it('readMirrorEvents(work) never returns personal rows and vice versa (SEC-1)', async () => {
    const work = await mirror.readMirrorEvents('work');
    const personal = await mirror.readMirrorEvents('personal');

    expect(work.every((e) => e.context === 'work')).toBe(true);
    expect(work.some((e) => e.externalId === 'p1')).toBe(false);

    expect(personal.every((e) => e.context === 'personal')).toBe(true);
    expect(personal.some((e) => e.externalId === 'w1')).toBe(false);
  });
});
