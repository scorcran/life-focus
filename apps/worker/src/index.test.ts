import { describe, it, expect, vi, beforeEach } from 'vitest';

// The worker guards main() behind an entrypoint check (import.meta.url vs process.argv[1]).
// Importing the module in test env does NOT auto-connect to pg-boss.
vi.mock('@life-focus/config', () => ({
  loadConfig: () => ({
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    LOG_LEVEL: 'info',
    PORT: '3000',
    NODE_ENV: 'test',
  }),
}));

describe('apps/worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handleHeartbeatJobs logs each job without throwing', async () => {
    const { handleHeartbeatJobs, logger } = await import('./index.js');
    const spy = vi.spyOn(logger, 'info');
    const fakeJobs = [{ id: 'job-abc' }, { id: 'job-xyz' }];
    expect(() => handleHeartbeatJobs(fakeJobs)).not.toThrow();
    // Should have logged one entry per job
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toMatchObject({ correlationId: 'job-abc' });
    expect(spy.mock.calls[1][0]).toMatchObject({ correlationId: 'job-xyz' });
  });

  it('createBoss returns a PgBoss instance without connecting', async () => {
    const { createBoss } = await import('./index.js');
    const boss = createBoss('postgresql://user:pass@localhost:5432/db');
    expect(boss).toBeDefined();
    // PgBoss instances expose .on() — just verify the shape
    expect(typeof boss.on).toBe('function');
    expect(typeof boss.start).toBe('function');
  });
});
