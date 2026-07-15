/**
 * Google OAuth authorization-code helpers (Story 1.4) over the injected
 * `HttpClient` port. Read-only calendar scope only (AD-8). No real network
 * module here — hosts inject `fetch`, tests inject a fake.
 */
import {
  GCAL_SCOPES,
  GOOGLE_AUTH_URL,
  GOOGLE_TOKEN_URL,
  GOOGLE_USERINFO_URL,
  TokenRevokedError,
  type HttpClient,
} from './types.js';

export interface BuildAuthUrlParams {
  readonly clientId: string;
  readonly redirectUri: string;
  /** Opaque signed state (context + CSRF nonce) built by the host. */
  readonly state: string;
}

/**
 * Build the Google consent URL. `access_type=offline` + `prompt=consent` ensure
 * a refresh token is returned (so the worker can keep syncing).
 */
export function buildAuthUrl(params: BuildAuthUrlParams): string {
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set('client_id', params.clientId);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', GCAL_SCOPES.join(' '));
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('state', params.state);
  return url.toString();
}

export interface OAuthTokens {
  readonly accessToken: string;
  /** Absent on re-consent when Google withholds it; caller keeps the prior one. */
  readonly refreshToken: string | null;
  readonly expiresInSeconds: number | null;
  readonly idToken: string | null;
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
  error?: string;
}

function formBody(fields: Record<string, string>): string {
  return Object.entries(fields)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

async function postToken(
  http: HttpClient,
  fields: Record<string, string>,
): Promise<OAuthTokens> {
  const res = await http(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: formBody(fields),
  });
  const body = (await res.json()) as TokenResponse;
  if (res.status >= 400 || body.error) {
    // invalid_grant on a token call means the grant/refresh is revoked.
    if (body.error === 'invalid_grant' || res.status === 401) {
      throw new TokenRevokedError(`token endpoint: ${body.error ?? res.status}`);
    }
    throw new Error(`Google token endpoint failed (${res.status}): ${body.error ?? 'unknown'}`);
  }
  if (typeof body.access_token !== 'string') {
    throw new Error('Google token endpoint returned no access_token');
  }
  return {
    accessToken: body.access_token,
    refreshToken: typeof body.refresh_token === 'string' ? body.refresh_token : null,
    expiresInSeconds: typeof body.expires_in === 'number' ? body.expires_in : null,
    idToken: typeof body.id_token === 'string' ? body.id_token : null,
  };
}

export interface ExchangeCodeParams {
  readonly code: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly redirectUri: string;
}

/** Exchange an authorization code for tokens. */
export function exchangeCode(
  http: HttpClient,
  params: ExchangeCodeParams,
): Promise<OAuthTokens> {
  return postToken(http, {
    code: params.code,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    redirect_uri: params.redirectUri,
    grant_type: 'authorization_code',
  });
}

export interface RefreshTokenParams {
  readonly refreshToken: string;
  readonly clientId: string;
  readonly clientSecret: string;
}

/** Refresh an access token from a stored refresh token. */
export function refreshAccessToken(
  http: HttpClient,
  params: RefreshTokenParams,
): Promise<OAuthTokens> {
  return postToken(http, {
    refresh_token: params.refreshToken,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    grant_type: 'refresh_token',
  });
}

interface UserInfoResponse {
  email?: string;
}

/**
 * Resolve the connected Google account email via the userinfo endpoint
 * (needs the `email` scope, which we request). Used to form the AD-6
 * (provider, account, context) source identity.
 */
export async function fetchAccountEmail(
  http: HttpClient,
  accessToken: string,
): Promise<string> {
  const res = await http(GOOGLE_USERINFO_URL, {
    method: 'GET',
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) {
    throw new TokenRevokedError('userinfo endpoint: 401');
  }
  const body = (await res.json()) as UserInfoResponse;
  if (typeof body.email !== 'string' || body.email.length === 0) {
    throw new Error('Google userinfo returned no email');
  }
  return body.email;
}
