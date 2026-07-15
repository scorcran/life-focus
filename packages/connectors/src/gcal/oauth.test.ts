import { describe, it, expect } from 'vitest';
import {
  buildAuthUrl,
  exchangeCode,
  refreshAccessToken,
  fetchAccountEmail,
} from './oauth.js';
import { TokenRevokedError, type HttpClient, type HttpResponse } from './types.js';

function fakeHttp(
  handler: (url: string, init?: Parameters<HttpClient>[1]) => { status: number; body: unknown },
): { http: HttpClient; calls: Array<{ url: string; init?: Parameters<HttpClient>[1] }> } {
  const calls: Array<{ url: string; init?: Parameters<HttpClient>[1] }> = [];
  const http: HttpClient = async (url, init) => {
    calls.push({ url, init });
    const { status, body } = handler(url, init);
    const res: HttpResponse = { status, json: async () => body };
    return res;
  };
  return { http, calls };
}

describe('buildAuthUrl', () => {
  it('builds a read-only, offline consent URL carrying the signed state', () => {
    const url = buildAuthUrl({
      clientId: 'cid',
      redirectUri: 'http://localhost:3000/api/connections/google/callback',
      state: 'signed-state',
    });
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(
      'https://accounts.google.com/o/oauth2/v2/auth',
    );
    expect(parsed.searchParams.get('client_id')).toBe('cid');
    expect(parsed.searchParams.get('response_type')).toBe('code');
    expect(parsed.searchParams.get('access_type')).toBe('offline');
    expect(parsed.searchParams.get('prompt')).toBe('consent');
    expect(parsed.searchParams.get('state')).toBe('signed-state');
    // Read-only calendar scope only (AD-8) — never a write scope.
    const scope = parsed.searchParams.get('scope') ?? '';
    expect(scope).toContain('https://www.googleapis.com/auth/calendar.readonly');
    expect(scope).not.toContain('calendar.events');
    expect(scope).not.toMatch(/calendar($|[^.])/); // no full read/write calendar scope
  });
});

describe('exchangeCode', () => {
  it('exchanges a code for tokens', async () => {
    const { http, calls } = fakeHttp(() => ({
      status: 200,
      body: {
        access_token: 'at',
        refresh_token: 'rt',
        expires_in: 3600,
        id_token: 'idt',
      },
    }));
    const tokens = await exchangeCode(http, {
      code: 'auth-code',
      clientId: 'cid',
      clientSecret: 'secret',
      redirectUri: 'http://localhost:3000/cb',
    });
    expect(tokens.accessToken).toBe('at');
    expect(tokens.refreshToken).toBe('rt');
    expect(tokens.expiresInSeconds).toBe(3600);
    expect(calls[0]!.init?.body).toContain('grant_type=authorization_code');
  });

  it('maps invalid_grant to TokenRevokedError', async () => {
    const { http } = fakeHttp(() => ({ status: 400, body: { error: 'invalid_grant' } }));
    await expect(
      exchangeCode(http, { code: 'c', clientId: 'i', clientSecret: 's', redirectUri: 'u' }),
    ).rejects.toBeInstanceOf(TokenRevokedError);
  });
});

describe('refreshAccessToken', () => {
  it('refreshes and preserves a missing refresh_token as null', async () => {
    const { http, calls } = fakeHttp(() => ({
      status: 200,
      body: { access_token: 'new-at', expires_in: 3599 },
    }));
    const tokens = await refreshAccessToken(http, {
      refreshToken: 'rt',
      clientId: 'cid',
      clientSecret: 'secret',
    });
    expect(tokens.accessToken).toBe('new-at');
    expect(tokens.refreshToken).toBeNull();
    expect(calls[0]!.init?.body).toContain('grant_type=refresh_token');
  });

  it('maps a revoked refresh grant to TokenRevokedError', async () => {
    const { http } = fakeHttp(() => ({ status: 400, body: { error: 'invalid_grant' } }));
    await expect(
      refreshAccessToken(http, { refreshToken: 'rt', clientId: 'i', clientSecret: 's' }),
    ).rejects.toBeInstanceOf(TokenRevokedError);
  });
});

describe('fetchAccountEmail', () => {
  it('resolves the account email for the AD-6 source identity', async () => {
    const { http, calls } = fakeHttp(() => ({ status: 200, body: { email: 'me@example.com' } }));
    const email = await fetchAccountEmail(http, 'at');
    expect(email).toBe('me@example.com');
    expect(calls[0]!.init?.headers?.authorization).toBe('Bearer at');
  });

  it('throws TokenRevokedError on 401', async () => {
    const { http } = fakeHttp(() => ({ status: 401, body: {} }));
    await expect(fetchAccountEmail(http, 'at')).rejects.toBeInstanceOf(TokenRevokedError);
  });
});
