/**
 * Opaque, signed OAuth `state` for the Google Calendar connect flow (Story 1.4).
 *
 * PURE (no I/O, no next/*): the state carries the chosen context (AD-6) and a
 * CSRF nonce, HMAC-signed with a secret so the callback can verify it was not
 * tampered with and that the nonce matches the cookie the connect action set.
 * The signing key is passed in (the host supplies BETTER_AUTH_SECRET) so this
 * module is unit-testable without config.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export type ConnectContext = 'work' | 'personal';

export interface OAuthState {
  readonly context: ConnectContext;
  readonly nonce: string;
}

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

function sign(payloadB64: string, secret: string): string {
  return b64url(createHmac('sha256', secret).update(payloadB64).digest());
}

/** Encode + sign an opaque state string: `<payload>.<sig>`. */
export function signState(state: OAuthState, secret: string): string {
  const payloadB64 = b64url(Buffer.from(JSON.stringify(state), 'utf8'));
  return `${payloadB64}.${sign(payloadB64, secret)}`;
}

/**
 * Verify + decode a state string. Returns the state on success, or null on any
 * tamper / malformed input (never throws, so the callback can redirect cleanly).
 */
export function verifyState(raw: string, secret: string): OAuthState | null {
  const parts = raw.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts as [string, string];
  const expected = sign(payloadB64, secret);
  // Constant-time compare; guard against length mismatch (timingSafeEqual throws).
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      (parsed as OAuthState).context &&
      ((parsed as OAuthState).context === 'work' || (parsed as OAuthState).context === 'personal') &&
      typeof (parsed as OAuthState).nonce === 'string' &&
      (parsed as OAuthState).nonce.length > 0
    ) {
      return { context: (parsed as OAuthState).context, nonce: (parsed as OAuthState).nonce };
    }
    return null;
  } catch {
    return null;
  }
}
