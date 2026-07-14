import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { authSchema } from './schema/auth.js';
import { ledgerSchema } from './schema/ledger.js';

export * from './schema/auth.js';
export * from './schema/ledger.js';
export { runMigrations } from './migrate.js';
export { createLedgerStore } from './ledger/store.js';

/** The full Drizzle schema: auth tables + ledger tables. */
const schema = { ...authSchema, ...ledgerSchema };

export type DbClient = ReturnType<typeof createDbClient>;
export type DrizzleClient = DbClient['db'];

/**
 * Create a Drizzle client from a standard Postgres connection string (AD-9).
 * No Supabase-specific features — plain pg driver.
 * Returns both the drizzle client and the underlying pool so callers can close it.
 */
export function createDbClient(connectionString: string) {
  const pool = new pg.Pool({ connectionString });
  // Prevent unhandled 'error' events from crashing the process
  pool.on('error', (err: Error) => {
    console.error('[db] pool error (logged, not thrown):', err.message);
  });
  return { db: drizzle(pool, { schema }), pool };
}

/** Close the pool returned by createDbClient. */
export async function closeDb(pool: pg.Pool): Promise<void> {
  await pool.end().catch(() => {});
}

/**
 * Check whether the database is reachable within `timeoutMillis`.
 * Bounds connection establishment (connectionTimeoutMillis) AND query execution
 * (query_timeout client-side, statement_timeout server-side) so a TCP-accepting
 * but stalled Postgres cannot hang the caller (e.g. the health endpoint).
 */
export async function checkDbReachable(
  connectionString: string,
  timeoutMillis = 3000,
): Promise<boolean> {
  const pool = new pg.Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: timeoutMillis,
    query_timeout: timeoutMillis,
    statement_timeout: timeoutMillis,
  });
  // Swallow idle errors so the pool doesn't emit unhandled 'error' events
  pool.on('error', () => {});
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  } finally {
    await pool.end().catch(() => {});
  }
}
