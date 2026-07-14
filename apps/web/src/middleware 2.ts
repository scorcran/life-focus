import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Request-correlation-ID middleware: every request carries an
 * `x-correlation-id` header — the incoming value is preserved, otherwise a
 * fresh UUID is generated. The ID is set on both the forwarded request
 * (so route handlers can consume it) and the response (so callers can
 * correlate logs).
 */
export function middleware(request: NextRequest) {
  const correlationId =
    request.headers.get(CORRELATION_ID_HEADER) ?? crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CORRELATION_ID_HEADER, correlationId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(CORRELATION_ID_HEADER, correlationId);
  return response;
}
