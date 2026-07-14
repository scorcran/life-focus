import { PgBoss } from 'pg-boss';
import pino from 'pino';
import { loadConfig, isGoogleOAuthConfigured } from '@life-focus/config';
import { createDbClient, createLedgerStore, createMirrorStore } from '@life-focus/db';
import { createGcalConnector } from '@life-focus/connectors';
import { registerGcalSync, type GcalSyncStore } from './gcal-sync.js';

export const logger = pino({
  level: 'info',
  formatters: { level: (label) => ({ level: label }) },
});

export const HEARTBEAT_JOB = 'heartbeat';

/** Exit after this many consecutive pg-boss errors so the container restart policy can recover. */
export const MAX_CONSECUTIVE_BOSS_ERRORS = 5;

/** Exported for testing: the heartbeat job handler (pure logic, no I/O). */
export function handleHeartbeatJobs(
  jobs: ReadonlyArray<{ id: string }>,
): void {
  for (const job of jobs) {
    logger.info({ correlationId: job.id, jobName: HEARTBEAT_JOB }, 'Heartbeat job executed');
  }
}

/** Exported for testing: creates a configured PgBoss instance without starting it. */
export function createBoss(connectionString: string): PgBoss {
  return new PgBoss({
    connectionString,
    application_name: 'life-focus-worker',
  });
}

/**
 * Exported for testing: counts consecutive pg-boss errors; past `threshold`
 * logs fatal and invokes `onFatal` (process.exit(1) in production) — no zombie mode.
 * Call `reset()` on successful work to clear the streak.
 */
export function createBossErrorMonitor(
  threshold: number,
  onFatal: () => void,
): { onError: (err: unknown) => void; reset: () => void } {
  let consecutiveErrors = 0;
  return {
    onError(err: unknown): void {
      consecutiveErrors += 1;
      logger.error({ err, consecutiveErrors }, 'pg-boss error');
      if (consecutiveErrors >= threshold) {
        logger.fatal(
          { consecutiveErrors, threshold },
          'Too many consecutive pg-boss errors; exiting so the restart policy can recover',
        );
        onFatal();
      }
    },
    reset(): void {
      consecutiveErrors = 0;
    },
  };
}

/** Minimal pg-boss surface needed for shutdown (structural type for testability). */
export interface StoppableBoss {
  stop(options: { graceful: boolean }): Promise<void>;
  once(event: 'stopped', listener: () => void): unknown;
}

/**
 * Exported for testing: idempotent shutdown handler. The first signal stops
 * pg-boss gracefully (awaiting the 'stopped' event for full drain) then exits 0;
 * subsequent signals are no-ops while shutdown is in flight.
 */
export function createShutdownHandler(
  boss: StoppableBoss,
  exit: (code: number) => void = (code) => process.exit(code),
): (signal: string) => Promise<void> {
  let stopping = false;
  return async function shutdown(signal: string): Promise<void> {
    if (stopping) {
      logger.warn({ event: 'shutdown', signal }, 'Shutdown already in progress; ignoring signal');
      return;
    }
    stopping = true;
    logger.info({ event: 'shutdown', signal }, 'Shutting down worker');
    try {
      const stopped = new Promise<void>((resolve) => {
        boss.once('stopped', () => resolve());
      });
      await boss.stop({ graceful: true });
      await stopped;
    } catch (err) {
      logger.error({ err }, 'Error stopping pg-boss during shutdown');
    }
    exit(0);
  };
}

async function main() {
  const config = loadConfig();

  // Update log level from config
  logger.level = config.LOG_LEVEL;

  const boss = createBoss(config.DATABASE_URL);

  const errorMonitor = createBossErrorMonitor(MAX_CONSECUTIVE_BOSS_ERRORS, () => process.exit(1));
  boss.on('error', (err: unknown) => {
    errorMonitor.onError(err);
  });

  // Graceful shutdown on SIGTERM / SIGINT (idempotent — second signal is a no-op)
  const shutdown = createShutdownHandler(boss);
  process.on('SIGTERM', () => { shutdown('SIGTERM').catch(() => {}); });
  process.on('SIGINT',  () => { shutdown('SIGINT').catch(() => {}); });

  await boss.start();
  logger.info({ event: 'pg-boss-connected' }, 'pg-boss connected');

  // Register a noop heartbeat job
  await boss.createQueue(HEARTBEAT_JOB);
  await boss.work<Record<string, unknown>>(HEARTBEAT_JOB, async (jobs) => {
    handleHeartbeatJobs(jobs);
    // Successful work clears the consecutive-error streak
    errorMonitor.reset();
  });

  // Schedule a heartbeat every minute
  await boss.schedule(HEARTBEAT_JOB, '*/1 * * * *', {});

  // Google Calendar sync (Story 1.4). Only wired when OAuth is configured — the
  // app (and worker) still boot without it (the connect flow is disabled in the
  // UI). fetch is the injected HTTP client so the connector does the network I/O.
  if (isGoogleOAuthConfigured(config)) {
    const client = createDbClient(config.DATABASE_URL);
    const ledger = createLedgerStore(client, { masterKey: config.LEDGER_MASTER_KEY });
    const mirror = createMirrorStore(client, { masterKey: config.LEDGER_MASTER_KEY, ledger });
    const connector = createGcalConnector((url, init) => fetch(url, init));
    await registerGcalSync(boss, {
      connector,
      store: mirror satisfies GcalSyncStore,
      logger,
      oauth: {
        clientId: config.GOOGLE_OAUTH_CLIENT_ID!,
        clientSecret: config.GOOGLE_OAUTH_CLIENT_SECRET!,
      },
    });
    logger.info({ event: 'gcal-sync-registered' }, 'Google Calendar sync registered');
  } else {
    logger.info(
      { event: 'gcal-sync-skipped' },
      'Google Calendar OAuth not configured; sync not registered',
    );
  }

  logger.info({ event: 'worker-ready' }, 'Worker is ready');
}

// Only auto-start when this file is the entrypoint, not when imported by tests
// Using import.meta.url vs process.argv[1] (Node ESM entrypoint detection)
const isEntrypoint = process.argv[1] &&
  (await import('url')).fileURLToPath(import.meta.url) === process.argv[1];

if (isEntrypoint) {
  main().catch((err) => {
    logger.error({ err }, 'Worker startup failed');
    process.exit(1);
  });
}
