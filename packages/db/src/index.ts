import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

export type DrizzleClient = ReturnType<typeof drizzle<Record<string, never>>>;

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
  return { db: drizzle(pool), pool };
}

/** Close the pool returned by createDbClient. */
export async function closeDb(pool: pg.Pool): Promise<void> {
  await pool.end().catch(() => {});
}

export async function checkDbReachable(connectionString: string): Promise<boolean> {
  const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 3000 });
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
