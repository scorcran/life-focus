import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @life-focus/config so Next.js server code doesn't need a real DATABASE_URL
const mockLoadConfig = vi.fn();
vi.mock('@life-focus/config', () => ({
  loadConfig: () => mockLoadConfig(),
}));

// Mock @life-focus/db — we'll control checkDbReachable per test
const mockCheckDbReachable = vi.fn<() => Promise<boolean>>();
vi.mock('@life-focus/db', () => ({
  checkDbReachable: () => mockCheckDbReachable(),
}));

const validConfig = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  LOG_LEVEL: 'info',
  PORT: '3000',
  NODE_ENV: 'test',
};

function healthRequest(headers?: Record<string, string>): Request {
  return new Request('http://localhost/api/health', { headers });
}

describe('apps/web health route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadConfig.mockReturnValue(validConfig);
  });

  it('returns 200 {status:"ok",db:true} when DB is reachable', async () => {
    mockCheckDbReachable.mockResolvedValue(true);
    const { GET } = await import('./route.js');
    const response = await GET(healthRequest());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.db).toBe(true);
  });

  it('returns 503 {status:"degraded",db:false} when DB is unreachable', async () => {
    mockCheckDbReachable.mockResolvedValue(false);
    const { GET } = await import('./route.js');
    const response = await GET(healthRequest());
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('degraded');
    expect(body.db).toBe(false);
  });

  it('returns 500 {status:"misconfigured"} when config fails to load', async () => {
    mockLoadConfig.mockImplementation(() => {
      throw new Error('Invalid environment configuration');
    });
    const { GET } = await import('./route.js');
    const response = await GET(healthRequest());
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.status).toBe('misconfigured');
    // DB must never be consulted (or reported) when config is invalid
    expect(mockCheckDbReachable).not.toHaveBeenCalled();
    expect(body.db).toBeUndefined();
  });

  it('echoes an incoming x-correlation-id header', async () => {
    mockCheckDbReachable.mockResolvedValue(true);
    const { GET } = await import('./route.js');
    const response = await GET(healthRequest({ 'x-correlation-id': 'corr-123' }));
    const body = await response.json();
    expect(body.correlationId).toBe('corr-123');
  });

  it('generates a correlationId when no x-correlation-id header is present', async () => {
    mockCheckDbReachable.mockResolvedValue(true);
    const { GET } = await import('./route.js');
    const response = await GET(healthRequest());
    const body = await response.json();
    expect(body.correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
