import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @life-focus/config so Next.js server code doesn't need a real DATABASE_URL
vi.mock('@life-focus/config', () => ({
  loadConfig: () => ({
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    LOG_LEVEL: 'info',
    PORT: '3000',
    NODE_ENV: 'test',
  }),
}));

// Mock @life-focus/db — we'll control checkDbReachable per test
const mockCheckDbReachable = vi.fn<() => Promise<boolean>>();
vi.mock('@life-focus/db', () => ({
  checkDbReachable: (...args: unknown[]) => mockCheckDbReachable(...args),
}));

describe('apps/web health route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 {status:"ok",db:true} when DB is reachable', async () => {
    mockCheckDbReachable.mockResolvedValue(true);
    const { GET } = await import('./route.js');
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.db).toBe(true);
  });

  it('returns 503 {status:"degraded",db:false} when DB is unreachable', async () => {
    mockCheckDbReachable.mockResolvedValue(false);
    const { GET } = await import('./route.js');
    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('degraded');
    expect(body.db).toBe(false);
  });
});
