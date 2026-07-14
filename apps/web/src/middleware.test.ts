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
