import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

/**
 * Absolute path to the generated migration SQL (`packages/db/drizzle`).
 * Resolved relative to this module so it works from any CWD (compiled `dist`
 * lives alongside a copied `drizzle/` folder in the container image).
 */
const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'drizzle');

/**
 * Apply all pending migrations against `connectionString`, then close the pool.
 * Idempotent — Drizzle tracks applied migrations in `__drizzle_migrations`.
 * Called at dev/prod startup before authed routes serve (AD-9).
 */
export async function runMigrations(connectionString: string): Promise<void> {
  const pool = new pg.Pool({ connectionString, max: 1 });
  pool.on('error', () => {});
  try {
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder });
  } finally {
    await pool.end().catch(() => {});
  }
}
