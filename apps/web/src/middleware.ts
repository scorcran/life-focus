import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Path prefixes that must remain reachable without a session:
 * - `/sign-in`      — the sign-in / first-run sign-up surface itself
 * - `/api/auth`     — Better Auth's own endpoints (sign-in, sign-up, session…)
 * - `/api/health`   — liveness/readiness probe (must answer without a session)
 */
const PUBLIC_PREFIXES = ['/sign-in', '/api/auth', '/api/health'];

/**
 * Static asset file extensions that must never be gated. Restricted to a known
 * allowlist (not "any path containing a dot") so a real app route whose segment
 * contains a period — e.g. `/commitments/v1.2` — is still gated rather than
 * silently treated as a public asset.
 */
const STATIC_ASSET_EXT =
  /\.(?:ico|png|jpe?g|gif|svg|webp|avif|css|js|mjs|map|woff2?|ttf|otf|txt|json|xml|webmanifest)$/i;

/** True for paths that must never be gated (public surfaces + framework/static assets). */
function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  // Next.js internals and static assets. The matcher already excludes /_next
  // static/image, but keep this defensive so asset requests never redirect.
  if (pathname.startsWith('/_next') || STATIC_ASSET_EXT.test(pathname)) {
    return true;
  }
  return false;
}

/**
 * Two responsibilities, in order:
 *  1. Correlation ID — every request carries an `x-correlation-id` header
 *     (incoming value preserved, else a fresh UUID), set on both the forwarded
 *     request and the response so callers/handlers can correlate logs.
 *  2. Auth gate (AD-6) — unauthenticated requests to any non-public app route
 *     are redirected to `/sign-in`. This is an optimistic cookie-presence check
 *     (edge-safe, no DB call); the authoritative DB-backed session check lives
 *     in the `(app)` layout.
 */
export function middleware(request: NextRequest) {
  const correlationId =
    request.headers.get(CORRELATION_ID_HEADER) ?? crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CORRELATION_ID_HEADER, correlationId);

  const { pathname } = request.nextUrl;

  if (!isPublicPath(pathname) && !getSessionCookie(request)) {
    const signInUrl = new URL('/sign-in', request.url);
    const redirect = NextResponse.redirect(signInUrl);
    redirect.headers.set(CORRELATION_ID_HEADER, correlationId);
    return redirect;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(CORRELATION_ID_HEADER, correlationId);
  return response;
}

export const config = {
  // Run on everything except Next.js internals and obvious static files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
