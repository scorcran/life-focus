import { describe, it, expect } from 'vitest';
import { createDbClient, closeDb, checkDbReachable } from './index.js';

describe('packages/db', () => {
  it('createDbClient returns { db, pool }', async () => {
    const { db, pool } = createDbClient('postgresql://user:pass@localhost:5432/db');
    expect(db).toBeDefined();
    expect(typeof db).toBe('object');
    expect(pool).toBeDefined();
    // Clean up pool to avoid open handle warnings
    await closeDb(pool);
  });

  it('checkDbReachable returns false for an unreachable host', async () => {
    // Port 1 on loopback is guaranteed-invalid (privileged, never a Postgres);
    // a short timeout keeps the failure path fast and non-flaky.
    const reachable = await checkDbReachable('postgresql://user:pass@127.0.0.1:1/db', 500);
    expect(reachable).toBe(false);
  }, 5000);
});
