import { NextResponse } from 'next/server';
import { loadConfig } from '@life-focus/config';
import type { AppConfig } from '@life-focus/config';
import { checkDbReachable } from '@life-focus/db';
import { createLogger } from '../../../lib/logger';
import { CORRELATION_ID_HEADER } from '../../../middleware';

const logger = createLogger('health');

export async function GET(request: Request) {
  // Set by the correlation-ID middleware; fall back to a fresh UUID if absent
  // (e.g. direct handler invocation in tests).
  const correlationId =
    request.headers.get(CORRELATION_ID_HEADER) ?? crypto.randomUUID();
  const childLogger = logger.child({ correlationId });

  let config: AppConfig;
  try {
    config = loadConfig();
  } catch (err) {
    childLogger.error({ err }, 'Health check: invalid configuration');
    return NextResponse.json(
      { status: 'misconfigured', correlationId },
      { status: 500 },
    );
  }

  let dbReachable = false;
  try {
    dbReachable = await checkDbReachable(config.DATABASE_URL);
  } catch (err) {
    childLogger.warn({ err }, 'Health check: DB unreachable');
  }

  const status = dbReachable ? 'ok' : 'degraded';
  const statusCode = dbReachable ? 200 : 503;

  childLogger.info({ status, dbReachable, correlationId }, 'Health check');

  return NextResponse.json(
    { status, db: dbReachable, correlationId },
    { status: statusCode },
  );
}
