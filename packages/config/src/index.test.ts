import { describe, it, expect, beforeEach } from 'vitest';
import { loadConfig, resetConfig } from './index.js';

describe('packages/config', () => {
  beforeEach(() => {
    resetConfig();
  });

  it('loads valid config', () => {
    const config = loadConfig({ DATABASE_URL: 'postgresql://user:pass@localhost:5432/db', NODE_ENV: 'test' });
    expect(config.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
    expect(config.LOG_LEVEL).toBe('info');
    expect(config.PORT).toBe('3000');
  });

  it('throws on missing DATABASE_URL', () => {
    expect(() => loadConfig({})).toThrow('Invalid environment configuration');
  });

  it('throws on invalid DATABASE_URL (not a URL)', () => {
    expect(() => loadConfig({ DATABASE_URL: 'not-a-url' })).toThrow('Invalid environment configuration');
  });

  it('throws on DATABASE_URL with non-postgres scheme', () => {
    expect(() => loadConfig({ DATABASE_URL: 'mysql://user:pass@localhost:3306/db' }))
      .toThrow('Invalid environment configuration');
  });

  it('throws on PORT that is not a digit string', () => {
    expect(() => loadConfig({ DATABASE_URL: 'postgresql://u:p@h:5432/d', PORT: 'abc' }))
      .toThrow('Invalid environment configuration');
  });

  it('treats empty-string env values as unset so defaults apply', () => {
    const config = loadConfig({
      DATABASE_URL: 'postgresql://u:p@h:5432/d',
      LOG_LEVEL: '',
      PORT: '',
      NODE_ENV: 'test',
    });
    expect(config.LOG_LEVEL).toBe('info');
    expect(config.PORT).toBe('3000');
  });

  it('throws on PORT of 0 (below valid range)', () => {
    expect(() => loadConfig({ DATABASE_URL: 'postgresql://u:p@h:5432/d', PORT: '0' }))
      .toThrow('Invalid environment configuration');
  });

  it('throws on PORT above 65535', () => {
    expect(() => loadConfig({ DATABASE_URL: 'postgresql://u:p@h:5432/d', PORT: '70000' }))
      .toThrow('Invalid environment configuration');
  });

  it('accepts PORT at the range boundaries', () => {
    const config = loadConfig({ DATABASE_URL: 'postgresql://u:p@h:5432/d', PORT: '65535', NODE_ENV: 'test' });
    expect(config.PORT).toBe('65535');
  });

  it('accepts valid LOG_LEVEL', () => {
    const config = loadConfig({ DATABASE_URL: 'postgresql://u:p@h:5432/d', LOG_LEVEL: 'debug', NODE_ENV: 'test' });
    expect(config.LOG_LEVEL).toBe('debug');
  });

  it('returns the same object on repeated calls with the same env', () => {
    const env = { DATABASE_URL: 'postgresql://u:p@h:5432/d', NODE_ENV: 'test' } as NodeJS.ProcessEnv;
    const first = loadConfig(env);
    const second = loadConfig(env);
    expect(first).toBe(second);
  });

  it('throws when called a second time with a different env object', () => {
    const env1 = { DATABASE_URL: 'postgresql://u:p@h:5432/d', NODE_ENV: 'test' } as NodeJS.ProcessEnv;
    const env2 = { DATABASE_URL: 'postgresql://u:p@h:5432/db2', NODE_ENV: 'test' } as NodeJS.ProcessEnv;
    loadConfig(env1);
    expect(() => loadConfig(env2)).toThrow('already called with a different env object');
  });
});
