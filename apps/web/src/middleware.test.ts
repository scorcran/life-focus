import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware, CORRELATION_ID_HEADER } from './middleware.js';

describe('apps/web correlation-ID middleware', () => {
  it('echoes an incoming x-correlation-id onto request and response headers', () => {
    const request = new NextRequest('http://localhost/api/health', {
      headers: { [CORRELATION_ID_HEADER]: 'corr-abc' },
    });
    const response = middleware(request);
    expect(response.headers.get(CORRELATION_ID_HEADER)).toBe('corr-abc');
    // NextResponse.next({ request }) records forwarded request headers
    expect(
      response.headers.get(`x-middleware-request-${CORRELATION_ID_HEADER}`),
    ).toBe('corr-abc');
  });

  it('generates a UUID when no x-correlation-id header is present', () => {
    const request = new NextRequest('http://localhost/api/health');
    const response = middleware(request);
    const correlationId = response.headers.get(CORRELATION_ID_HEADER);
    expect(correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(
      response.headers.get(`x-middleware-request-${CORRELATION_ID_HEADER}`),
    ).toBe(correlationId);
  });
});

describe('apps/web auth-gate middleware', () => {
  it('redirects an unauthenticated request to a protected route to /sign-in', () => {
    const request = new NextRequest('http://localhost/today');
    const response = middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/sign-in');
    // Correlation ID is still attached on the redirect (logging stays intact).
    expect(response.headers.get(CORRELATION_ID_HEADER)).toBeTruthy();
  });

  it('redirects an unauthenticated request to the app root to /sign-in', () => {
    const request = new NextRequest('http://localhost/');
    const response = middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/sign-in');
  });

  it('does NOT redirect the public /sign-in surface', () => {
    const request = new NextRequest('http://localhost/sign-in');
    const response = middleware(request);
    // NextResponse.next() has no redirect status/location.
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get(CORRELATION_ID_HEADER)).toBeTruthy();
  });

  it('does NOT redirect Better Auth endpoints under /api/auth', () => {
    const request = new NextRequest('http://localhost/api/auth/get-session');
    const response = middleware(request);
    expect(response.headers.get('location')).toBeNull();
  });

  it('does NOT redirect the health probe under /api/health', () => {
    const request = new NextRequest('http://localhost/api/health');
    const response = middleware(request);
    expect(response.headers.get('location')).toBeNull();
  });

  it('allows a request that carries a Better Auth session cookie', () => {
    const request = new NextRequest('http://localhost/today', {
      // Better Auth's default session cookie name.
      headers: { cookie: 'better-auth.session_token=fake-signed-token' },
    });
    const response = middleware(request);
    expect(response.headers.get('location')).toBeNull();
    expect(
      response.headers.get(`x-middleware-request-${CORRELATION_ID_HEADER}`),
    ).toBeTruthy();
  });
});
