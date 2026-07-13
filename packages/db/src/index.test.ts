import { describe, it, expect, afterEach } from 'vitest';
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
    const reachable = await checkDbReachable('postgresql://user:pass@localhost:54321/db');
    expect(reachable).toBe(false);
  }, 10000);
});
