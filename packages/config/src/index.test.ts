import { describe, it, expect, beforeEach } from 'vitest';
import { loadConfig, resetConfig, isGoogleOAuthConfigured } from './index.js';

// A valid 32+ char secret reused across the "valid config" cases.
const SECRET = 'a'.repeat(32);
// A valid base64 string decoding to exactly 32 bytes (AES-256 key).
const MASTER_KEY = Buffer.alloc(32, 7).toString('base64');

/** Base env with all required fields satisfied; spread and override per test. */
function baseEnv(overrides: Record<string, string> = {}): NodeJS.ProcessEnv {
  return {
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    BETTER_AUTH_SECRET: SECRET,
    LEDGER_MASTER_KEY: MASTER_KEY,
    NODE_ENV: 'test',
    ...overrides,
  };
}

describe('packages/config', () => {
  beforeEach(() => {
    resetConfig();
  });

  it('loads valid config', () => {
    const config = loadConfig(baseEnv({ DATABASE_URL: 'postgresql://user:pass@localhost:5432/db' }));
    expect(config.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
    expect(config.LOG_LEVEL).toBe('info');
    expect(config.PORT).toBe('3000');
  });

  it('throws on missing DATABASE_URL', () => {
    expect(() => loadConfig({ BETTER_AUTH_SECRET: SECRET })).toThrow('Invalid environment configuration');
  });

  it('throws on invalid DATABASE_URL (not a URL)', () => {
    expect(() => loadConfig(baseEnv({ DATABASE_URL: 'not-a-url' }))).toThrow('Invalid environment configuration');
  });

  it('throws on DATABASE_URL with non-postgres scheme', () => {
    expect(() => loadConfig(baseEnv({ DATABASE_URL: 'mysql://user:pass@localhost:3306/db' })))
      .toThrow('Invalid environment configuration');
  });

  it('throws on PORT that is not a digit string', () => {
    expect(() => loadConfig(baseEnv({ PORT: 'abc' })))
      .toThrow('Invalid environment configuration');
  });

  it('treats empty-string env values as unset so defaults apply', () => {
    const config = loadConfig(baseEnv({
      LOG_LEVEL: '',
      PORT: '',
    }));
    expect(config.LOG_LEVEL).toBe('info');
    expect(config.PORT).toBe('3000');
  });

  it('throws on PORT of 0 (below valid range)', () => {
    expect(() => loadConfig(baseEnv({ PORT: '0' })))
      .toThrow('Invalid environment configuration');
  });

  it('throws on PORT above 65535', () => {
    expect(() => loadConfig(baseEnv({ PORT: '70000' })))
      .toThrow('Invalid environment configuration');
  });

  it('accepts PORT at the range boundaries', () => {
    const config = loadConfig(baseEnv({ PORT: '65535' }));
    expect(config.PORT).toBe('65535');
  });

  it('accepts valid LOG_LEVEL', () => {
    const config = loadConfig(baseEnv({ LOG_LEVEL: 'debug' }));
    expect(config.LOG_LEVEL).toBe('debug');
  });

  it('returns the same object on repeated calls with the same env', () => {
    const env = baseEnv();
    const first = loadConfig(env);
    const second = loadConfig(env);
    expect(first).toBe(second);
  });

  it('throws when called a second time with a different env object', () => {
    const env1 = baseEnv();
    const env2 = baseEnv({ DATABASE_URL: 'postgresql://u:p@h:5432/db2' });
    loadConfig(env1);
    expect(() => loadConfig(env2)).toThrow('already called with a different env object');
  });

  // ── Better Auth env (Story 1.2) ────────────────────────────────────────────
  it('requires BETTER_AUTH_SECRET', () => {
    expect(() => loadConfig({ DATABASE_URL: 'postgresql://u:p@h:5432/d', NODE_ENV: 'test' }))
      .toThrow('Invalid environment configuration');
  });

  it('rejects a BETTER_AUTH_SECRET shorter than 32 characters', () => {
    expect(() => loadConfig(baseEnv({ BETTER_AUTH_SECRET: 'too-short' })))
      .toThrow('Invalid environment configuration');
  });

  it('accepts a BETTER_AUTH_SECRET of exactly 32 characters', () => {
    const config = loadConfig(baseEnv({ BETTER_AUTH_SECRET: 'x'.repeat(32) }));
    expect(config.BETTER_AUTH_SECRET).toHaveLength(32);
  });

  it('defaults BETTER_AUTH_URL to http://localhost:3000', () => {
    const config = loadConfig(baseEnv());
    expect(config.BETTER_AUTH_URL).toBe('http://localhost:3000');
  });

  it('accepts an overridden BETTER_AUTH_URL', () => {
    const config = loadConfig(baseEnv({ BETTER_AUTH_URL: 'https://app.example.com' }));
    expect(config.BETTER_AUTH_URL).toBe('https://app.example.com');
  });

  it('rejects an invalid BETTER_AUTH_URL', () => {
    expect(() => loadConfig(baseEnv({ BETTER_AUTH_URL: 'not-a-url' })))
      .toThrow('Invalid environment configuration');
  });

  // ── Ledger master key (Story 1.3, ADR 0001) ────────────────────────────────
  it('requires LEDGER_MASTER_KEY', () => {
    expect(() =>
      loadConfig({
        DATABASE_URL: 'postgresql://u:p@h:5432/d',
        BETTER_AUTH_SECRET: SECRET,
        NODE_ENV: 'test',
      }),
    ).toThrow('Invalid environment configuration');
  });

  it('accepts a base64 LEDGER_MASTER_KEY that decodes to 32 bytes', () => {
    const config = loadConfig(baseEnv({ LEDGER_MASTER_KEY: MASTER_KEY }));
    expect(config.LEDGER_MASTER_KEY).toBe(MASTER_KEY);
  });

  it('accepts a hex LEDGER_MASTER_KEY that decodes to 32 bytes', () => {
    const hexKey = Buffer.alloc(32, 9).toString('hex');
    const config = loadConfig(baseEnv({ LEDGER_MASTER_KEY: hexKey }));
    expect(config.LEDGER_MASTER_KEY).toBe(hexKey);
  });

  it('rejects a LEDGER_MASTER_KEY that decodes to the wrong length', () => {
    // 16 bytes base64 — decodes fine but is not 32 bytes.
    const shortKey = Buffer.alloc(16, 3).toString('base64');
    expect(() => loadConfig(baseEnv({ LEDGER_MASTER_KEY: shortKey })))
      .toThrow('Invalid environment configuration');
  });

  it('rejects a LEDGER_MASTER_KEY that is not valid base64 or hex', () => {
    expect(() => loadConfig(baseEnv({ LEDGER_MASTER_KEY: '!!! not a key !!!' })))
      .toThrow('Invalid environment configuration');
  });

  // ── Google Calendar OAuth env (Story 1.4) ──────────────────────────────────
  it('boots WITHOUT any GOOGLE_OAUTH_* set (they are optional)', () => {
    const config = loadConfig(baseEnv());
    expect(config.GOOGLE_OAUTH_CLIENT_ID).toBeUndefined();
    expect(isGoogleOAuthConfigured(config)).toBe(false);
  });

  it('isGoogleOAuthConfigured is true only when all three creds are present', () => {
    const config = loadConfig(
      baseEnv({
        GOOGLE_OAUTH_CLIENT_ID: 'client-id',
        GOOGLE_OAUTH_CLIENT_SECRET: 'client-secret',
        GOOGLE_OAUTH_REDIRECT_URI: 'http://localhost:3000/api/connections/google/callback',
      }),
    );
    expect(isGoogleOAuthConfigured(config)).toBe(true);
    expect(config.GOOGLE_OAUTH_CLIENT_ID).toBe('client-id');
  });

  it('isGoogleOAuthConfigured is false when only some creds are present', () => {
    const config = loadConfig(
      baseEnv({
        GOOGLE_OAUTH_CLIENT_ID: 'client-id',
        GOOGLE_OAUTH_CLIENT_SECRET: 'client-secret',
        // redirect URI missing
      }),
    );
    expect(isGoogleOAuthConfigured(config)).toBe(false);
  });

  it('rejects an invalid GOOGLE_OAUTH_REDIRECT_URI (not a URL)', () => {
    expect(() => loadConfig(baseEnv({ GOOGLE_OAUTH_REDIRECT_URI: 'not-a-url' })))
      .toThrow('Invalid environment configuration');
  });

  // ── Render-time timezone (Story 1.5) ───────────────────────────────────────
  it('defaults APP_TIMEZONE to America/New_York when unset (app boots without it)', () => {
    const config = loadConfig(baseEnv());
    expect(config.APP_TIMEZONE).toBe('America/New_York');
  });

  it('accepts a valid IANA APP_TIMEZONE', () => {
    const config = loadConfig(baseEnv({ APP_TIMEZONE: 'Europe/London' }));
    expect(config.APP_TIMEZONE).toBe('Europe/London');
  });

  it('rejects an invalid APP_TIMEZONE (not an IANA zone)', () => {
    expect(() => loadConfig(baseEnv({ APP_TIMEZONE: 'Not/AZone' })))
      .toThrow('Invalid environment configuration');
  });
});
