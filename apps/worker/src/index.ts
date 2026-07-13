import { PgBoss } from 'pg-boss';
import pino from 'pino';
import { loadConfig } from '@life-focus/config';

export const logger = pino({
  level: 'info',
  formatters: { level: (label) => ({ level: label }) },
});

export const HEARTBEAT_JOB = 'heartbeat';

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

async function main() {
  const config = loadConfig();

  // Update log level from config
  logger.level = config.LOG_LEVEL;

  const boss = createBoss(config.DATABASE_URL);

  boss.on('error', (err: unknown) => {
    logger.error({ err }, 'pg-boss error');
  });

  // Graceful shutdown on SIGTERM / SIGINT
  async function shutdown(signal: string) {
    logger.info({ event: 'shutdown', signal }, 'Shutting down worker');
    try {
      await boss.stop({ graceful: true });
    } catch (err) {
      logger.error({ err }, 'Error stopping pg-boss during shutdown');
    }
    process.exit(0);
  }

  process.on('SIGTERM', () => { shutdown('SIGTERM').catch(() => {}); });
  process.on('SIGINT',  () => { shutdown('SIGINT').catch(() => {}); });

  await boss.start();
  logger.info({ event: 'pg-boss-connected' }, 'pg-boss connected');

  // Register a noop heartbeat job
  await boss.createQueue(HEARTBEAT_JOB);
  await boss.work<Record<string, unknown>>(HEARTBEAT_JOB, async (jobs) => {
    handleHeartbeatJobs(jobs);
  });

  // Schedule a heartbeat every minute
  await boss.schedule(HEARTBEAT_JOB, '*/1 * * * *', {});

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
