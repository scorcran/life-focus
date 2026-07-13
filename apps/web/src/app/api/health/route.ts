import { NextResponse } from 'next/server';
import { loadConfig } from '@life-focus/config';
import { checkDbReachable } from '@life-focus/db';
import { createLogger } from '../../../lib/logger';

const logger = createLogger('health');

export async function GET() {
  const correlationId = crypto.randomUUID();
  const childLogger = logger.child({ correlationId });

  let dbReachable = false;
  try {
    const config = loadConfig();
    dbReachable = await checkDbReachable(config.DATABASE_URL);
  } catch (err) {
    childLogger.warn({ err }, 'Health check: DB unreachable or config error');
  }

  const status = dbReachable ? 'ok' : 'degraded';
  const statusCode = dbReachable ? 200 : 503;

  childLogger.info({ status, dbReachable, correlationId }, 'Health check');

  return NextResponse.json(
    { status, db: dbReachable, correlationId },
    { status: statusCode },
  );
}
