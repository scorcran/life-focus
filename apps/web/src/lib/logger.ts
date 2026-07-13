import pino from 'pino';
import { loadConfig } from '@life-focus/config';

// Initialise log level from config (falls back to 'info' if config not yet available)
function getLogLevel(): string {
  try {
    return loadConfig().LOG_LEVEL;
  } catch {
    return 'info';
  }
}

const baseLogger = pino({
  level: getLogLevel(),
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export function createLogger(context: string) {
  return baseLogger.child({ context });
}

export { baseLogger as logger };
