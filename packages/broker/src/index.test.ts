import { describe, it, expect, beforeEach } from 'vitest';
import { checkCrossContextOutput } from './index.js';
import type {
  LedgerStore,
  AppendEventInput,
  DomainEvent,
  CommitmentRow,
  EventContext,
} from '@life-focus/ledger';

/** In-memory fake LedgerStore capturing appended events. */
function makeFakeStore() {
  const appended: DomainEvent[] = [];
  let seq = 0;
  const store: LedgerStore = {
    async append(input: AppendEventInput): Promise<DomainEvent> {
      seq += 1;
      const event: DomainEvent = {
        id: `evt-${seq}`,
        eventSeq: seq,
        eventType: input.eventType,
        actor: input.actor,
        context: input.context,
        payload: input.payload,
        causedBy: input.causedBy ?? null,
        compensatesEventId: input.compensatesEventId ?? null,
        erasureScope: input.erasureScope ?? null,
        createdAt: new Date(0).toISOString(),
      };
      appended.push(event);
      return event;
    },
    async readEvents(): Promise<readonly DomainEvent[]> {
      return appended;
    },
    async readCommitments(_context: EventContext): Promise<readonly CommitmentRow[]> {
      return [];
    },
    async erase(): Promise<void> {},
  };
  return { store, appended };
}

describe('packages/broker', () => {
  let fake: ReturnType<typeof makeFakeStore>;

  beforeEach(() => {
    fake = makeFakeStore();
  });

  it('allows same-context output', async () => {
    expect((await checkCrossContextOutput(fake.store, 'work', 'work')).allowed).toBe(true);
    expect((await checkCrossContextOutput(fake.store, 'personal', 'personal')).allowed).toBe(true);
    expect((await checkCrossContextOutput(fake.store, 'joint', 'joint')).allowed).toBe(true);
  });

  it('blocks work↔personal output in both directions', async () => {
    expect((await checkCrossContextOutput(fake.store, 'work', 'personal')).allowed).toBe(false);
    expect((await checkCrossContextOutput(fake.store, 'personal', 'work')).allowed).toBe(false);
    expect(
      (await checkCrossContextOutput(fake.store, 'work', 'personal', { isPlanningArtifact: true }))
        .allowed,
    ).toBe(false);
  });

  it('allows context→joint only for planning-layer artifacts', async () => {
    expect(
      (await checkCrossContextOutput(fake.store, 'work', 'joint', { isPlanningArtifact: true }))
        .allowed,
    ).toBe(true);
    expect(
      (await checkCrossContextOutput(fake.store, 'personal', 'joint', { isPlanningArtifact: true }))
        .allowed,
    ).toBe(true);
    expect((await checkCrossContextOutput(fake.store, 'work', 'joint')).allowed).toBe(false);
    expect(
      (await checkCrossContextOutput(fake.store, 'personal', 'joint', { isPlanningArtifact: false }))
        .allowed,
    ).toBe(false);
  });

  it('blocks joint as a source into work or personal (joint is target-only)', async () => {
    expect((await checkCrossContextOutput(fake.store, 'joint', 'work')).allowed).toBe(false);
    expect((await checkCrossContextOutput(fake.store, 'joint', 'personal')).allowed).toBe(false);
  });

  it('appends a real CrossContextAccessAudited event and returns its id', async () => {
    const result = await checkCrossContextOutput(fake.store, 'work', 'personal');
    expect(fake.appended).toHaveLength(1);
    const audit = fake.appended[0]!;
    expect(audit.eventType).toBe('CrossContextAccessAudited');
    expect(result.auditId).toBe(audit.id);
    expect(audit.payload).toMatchObject({
      sourceContext: 'work',
      targetContext: 'personal',
      allowed: false,
    });
  });

  it('writes the audit event even when the flow is allowed', async () => {
    await checkCrossContextOutput(fake.store, 'work', 'work');
    expect(fake.appended).toHaveLength(1);
    expect(fake.appended[0]!.payload).toMatchObject({ allowed: true });
  });
});
