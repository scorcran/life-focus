import { createDbClient, closeDb, user } from '@life-focus/db';
import { loadConfig } from '@life-focus/config';

/**
 * Single-user gate (AD-6). Sign-up is permitted only while the `user` table is
 * empty; the first sign-up creates the sole app user, after which sign-up is
 * closed. The gate is enforced server-side (this check runs inside Better
 * Auth's `user.create.before` hook) — never merely hidden in the UI.
 *
 * `countUsers` is injected so the gate logic is unit-testable without a live
 * database (see sign-up-gate.test.ts).
 */
export type CountUsers = () => Promise<number>;

/** Returns true when sign-up is still open (i.e. no user exists yet). */
export async function isSignUpOpen(countUsers: CountUsers): Promise<boolean> {
  const count = await countUsers();
  return count === 0;
}

/** Production `CountUsers`: counts rows in the Better Auth `user` table. */
export async function countUsersInDb(): Promise<number> {
  const { DATABASE_URL } = loadConfig();
  const { db, pool } = createDbClient(DATABASE_URL);
  try {
    return await db.$count(user);
  } finally {
    await closeDb(pool);
  }
}
