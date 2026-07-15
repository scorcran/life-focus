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

  it('createBossErrorMonitor exits fatally after the consecutive-error threshold', async () => {
    const { createBossErrorMonitor } = await import('./index.js');
    const onFatal = vi.fn();
    const monitor = createBossErrorMonitor(3, onFatal);
    monitor.onError(new Error('boom-1'));
    monitor.onError(new Error('boom-2'));
    expect(onFatal).not.toHaveBeenCalled();
    monitor.onError(new Error('boom-3'));
    expect(onFatal).toHaveBeenCalledTimes(1);
  });

  it('createBossErrorMonitor reset() clears the consecutive-error streak', async () => {
    const { createBossErrorMonitor } = await import('./index.js');
    const onFatal = vi.fn();
    const monitor = createBossErrorMonitor(2, onFatal);
    monitor.onError(new Error('boom-1'));
    monitor.reset();
    monitor.onError(new Error('boom-2'));
    expect(onFatal).not.toHaveBeenCalled();
  });

  it('shutdown awaits pg-boss full stop then exits 0', async () => {
    const { createShutdownHandler } = await import('./index.js');
    let stoppedListener: (() => void) | undefined;
    const stop = vi.fn(async () => {
      // pg-boss emits 'stopped' asynchronously after stop() resolves
      queueMicrotask(() => stoppedListener?.());
    });
    const boss = {
      stop,
      once: (_event: 'stopped', listener: () => void) => { stoppedListener = listener; },
    };
    const exit = vi.fn();
    const shutdown = createShutdownHandler(boss, exit);
    await shutdown('SIGTERM');
    expect(stop).toHaveBeenCalledWith({ graceful: true });
    expect(exit).toHaveBeenCalledWith(0);
  });

  it('shutdown is idempotent — a second signal is a no-op', async () => {
    const { createShutdownHandler } = await import('./index.js');
    let stoppedListener: (() => void) | undefined;
    const stop = vi.fn(async () => {
      queueMicrotask(() => stoppedListener?.());
    });
    const boss = {
      stop,
      once: (_event: 'stopped', listener: () => void) => { stoppedListener = listener; },
    };
    const exit = vi.fn();
    const shutdown = createShutdownHandler(boss, exit);
    const first = shutdown('SIGTERM');
    const second = shutdown('SIGINT'); // while first is still in flight
    await Promise.all([first, second]);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(0);
  });
});
