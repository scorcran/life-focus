import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((u) => u.startsWith('postgres'), {
      message: 'DATABASE_URL must use a postgres:// or postgresql:// scheme',
    }),
  PORT: z
    .string()
    .regex(/^\d+$/, { message: 'PORT must be a numeric string (e.g. "3000")' })
    .default('3000')
    .refine(
      (p) => {
        const n = Number(p);
        return Number.isInteger(n) && n >= 1 && n <= 65535;
      },
      { message: 'PORT must be an integer between 1 and 65535' },
    ),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Better Auth (apps/web, AD-6). Secret signs sessions/tokens — must be strong.
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, { message: 'BETTER_AUTH_SECRET must be at least 32 characters' }),
  // Base URL Better Auth uses to build callback/cookie origins.
  BETTER_AUTH_URL: z
    .string()
    .url({ message: 'BETTER_AUTH_URL must be a valid URL' })
    .default('http://localhost:3000'),
});

export type AppConfig = z.infer<typeof EnvSchema>;

let _config: AppConfig | null = null;
let _configEnv: NodeJS.ProcessEnv | null = null;

/**
 * Strip empty-string env values before parsing so zod defaults apply.
 * A line like `LOG_LEVEL=` in .env yields '' — treat it as unset, not invalid.
 */
function stripEmptyValues(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(env).filter(([, value]) => value !== undefined && value !== ''),
  );
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  if (_config !== null) {
    // Second call with a DIFFERENT env object is a programming error — throw to surface it.
    if (env !== _configEnv) {
      throw new Error(
        'loadConfig() was already called with a different env object. ' +
        'Call resetConfig() first if you need to re-initialise.',
      );
    }
    return _config;
  }
  const result = EnvSchema.safeParse(stripEmptyValues(env));
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${result.error.message}`);
  }
  _config = result.data;
  _configEnv = env;
  return _config;
}

export function resetConfig(): void {
  _config = null;
  _configEnv = null;
}
