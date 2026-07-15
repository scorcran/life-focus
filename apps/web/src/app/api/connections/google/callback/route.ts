/**
 * Google Calendar OAuth callback (Story 1.4, AD-6). API route (OAuth callbacks
 * are the only permitted API handlers per the conventions). This is reachable
 * by the SIGNED-IN single user who initiated the connect; the middleware's
 * cookie gate already requires a session for this path.
 *
 * Steps: verify state + nonce (CSRF), exchange the code (read-only scope),
 * resolve the account email, `connectSource` (choose-context-before-save,
 * context immutable), then redirect back to the connections screen. Any error
 * redirects with a message — never throws a raw error to the user.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loadConfig, isGoogleOAuthConfigured } from '@life-focus/config';
import { createGcalConnector } from '@life-focus/connectors';
import { getAuth } from '../../../../../lib/auth.js';
import { getStores } from '../../../../../lib/stores.js';
import { verifyState } from '../../../../../lib/gcal-oauth-state.js';
import { OAUTH_NONCE_COOKIE } from '../../../../../app/(app)/settings/connections/actions.js';

const CONNECTIONS_PATH = '/settings/connections';

function redirectWith(base: string, params: Record<string, string>): NextResponse {
  const url = new URL(CONNECTIONS_PATH, base);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return NextResponse.redirect(url);
}

export async function GET(request: Request): Promise<NextResponse> {
  const config = loadConfig();
  const base = config.BETTER_AUTH_URL;

  if (!isGoogleOAuthConfigured(config)) {
    return redirectWith(base, { error: 'not_configured' });
  }

  // The connect flow is initiated by the signed-in single user; require a session.
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.redirect(new URL('/sign-in', base));
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const rawState = requestUrl.searchParams.get('state');
  const oauthError = requestUrl.searchParams.get('error');

  if (oauthError) {
    return redirectWith(base, { error: 'declined' });
  }
  if (!code || !rawState) {
    return redirectWith(base, { error: 'missing_params' });
  }

  // Verify state signature + decode context/nonce (CSRF).
  const state = verifyState(rawState, config.BETTER_AUTH_SECRET);
  if (!state) {
    return redirectWith(base, { error: 'bad_state' });
  }

  // Nonce must match the cookie the connect action set.
  const cookieStore = await cookies();
  const cookieNonce = cookieStore.get(OAUTH_NONCE_COOKIE)?.value;
  cookieStore.delete(OAUTH_NONCE_COOKIE);
  if (!cookieNonce || cookieNonce !== state.nonce) {
    return redirectWith(base, { error: 'nonce_mismatch' });
  }

  try {
    const connector = createGcalConnector((url, init) => fetch(url, init));
    const tokens = await connector.exchangeCode({
      code,
      clientId: config.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: config.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirectUri: config.GOOGLE_OAUTH_REDIRECT_URI!,
    });
    const account = await connector.fetchAccountEmail(tokens.accessToken);

    const expiresAt =
      tokens.expiresInSeconds !== null
        ? new Date(Date.now() + tokens.expiresInSeconds * 1000).toISOString()
        : null;

    await getStores().mirror.connectSource({
      provider: 'gcal',
      account,
      context: state.context,
      googleCalendarId: 'primary',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: expiresAt,
      actor: session.user.id,
    });

    return redirectWith(base, { connected: state.context });
  } catch {
    // Do not surface a raw error; the connections screen shows a friendly note.
    return redirectWith(base, { error: 'connect_failed' });
  }
}
