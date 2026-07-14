/**
 * Ephemeral-Postgres harness for integration tests.
 *
 * Resolution order:
 *  1. `TEST_DATABASE_URL` env var (CI / a dev's local Postgres) — reuse it.
 *  2. `@testcontainers/postgresql` (image postgres:17, matching compose) —
 *     start a throwaway container.
 *  3. Neither available → `available()` is false and integration `describe`s skip.
 *
 * Migrations (tables + the insert-only trigger) are applied via `runMigrations`.
 *
 * NOTE: this file lives under `test/` (not `src/`) so it is NOT collected as a
 * Vitest test file; it is imported by `src/ledger/store.test.ts`.
 */
import { runMigrations } from '../src/migrate.js';

// Reading TEST_DATABASE_URL here is test-harness config, not app config; the
// no-process-env lint rule targets source dirs, not the test/ harness.
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

export interface PgHarness {
  readonly connectionString: string;
  teardown(): Promise<void>;
}

let dockerAvailable: boolean | null = null;

/** Whether an ephemeral Postgres can be provided (env URL or Docker present). */
export async function pgAvailable(): Promise<boolean> {
  if (TEST_DATABASE_URL) return true;
  if (dockerAvailable !== null) return dockerAvailable;
  try {
    // Cheap Docker liveness probe without importing testcontainers upfront.
    const { execSync } = await import('node:child_process');
    // timeout so an unresponsive Docker daemon skips (false) rather than hangs.
    execSync('docker info', { stdio: 'ignore', timeout: 5000 });
    dockerAvailable = true;
  } catch {
    dockerAvailable = false;
  }
  return dockerAvailable;
}

/**
 * Provision a migrated Postgres for a test suite. Prefers TEST_DATABASE_URL,
 * else starts a postgres:17 container. Call `teardown()` in afterAll.
 */
export async function startPg(): Promise<PgHarness> {
  if (TEST_DATABASE_URL) {
    await runMigrations(TEST_DATABASE_URL);
    return {
      connectionString: TEST_DATABASE_URL,
      async teardown() {
        /* external DB — nothing to tear down */
      },
    };
  }

  const { PostgreSqlContainer } = await import('@testcontainers/postgresql');
  const container = await new PostgreSqlContainer('postgres:17').start();
  const connectionString = container.getConnectionUri();
  await runMigrations(connectionString);
  return {
    connectionString,
    async teardown() {
      await container.stop();
    },
  };
}
