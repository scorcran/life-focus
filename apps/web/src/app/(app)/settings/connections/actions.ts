'use server';

/**
 * Server action to START the Google Calendar connect flow (Story 1.4, AD-6).
 *
 * The user picks `work` or `personal` BEFORE the connection saves: the chosen
 * context is carried in the signed OAuth `state` (with a CSRF nonce also set as
 * a cookie the callback re-checks). Read-only calendar scope only (AD-8). If
 * OAuth is not configured, the action is a no-op safeguard — the UI already
 * disables the buttons and shows an explanatory note (no throw at startup).
 */
import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { loadConfig, isGoogleOAuthConfigured } from '@life-focus/config';
import { createGcalConnector } from '@life-focus/connectors';
import { signState, type ConnectContext } from '../../../../lib/gcal-oauth-state.js';

/** Name of the CSRF nonce cookie the callback verifies against the state. */
export const OAUTH_NONCE_COOKIE = 'gcal_oauth_nonce';

export async function startGoogleConnect(context: ConnectContext): Promise<void> {
  const config = loadConfig();
  if (!isGoogleOAuthConfigured(config)) {
    // Defensive: the connect buttons are disabled when unconfigured. Do nothing.
    return;
  }

  const nonce = randomUUID();
  const state = signState({ context, nonce }, config.BETTER_AUTH_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(OAUTH_NONCE_COOKIE, nonce, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes — enough for the consent round-trip.
  });

  // buildAuthUrl is pure; a null HTTP client is never invoked by it.
  const connector = createGcalConnector(() => {
    throw new Error('HTTP client not available in connect-start');
  });
  const url = connector.buildAuthUrl({
    clientId: config.GOOGLE_OAUTH_CLIENT_ID!,
    redirectUri: config.GOOGLE_OAUTH_REDIRECT_URI!,
    state,
  });

  redirect(url);
}
