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
    .default('3000'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type AppConfig = z.infer<typeof EnvSchema>;

let _config: AppConfig | null = null;
let _configEnv: NodeJS.ProcessEnv | null = null;

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
  const result = EnvSchema.safeParse(env);
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
