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
  // Master key for ledger crypto-shredding erasure (ADR 0001). Must decode to
  // exactly 32 bytes (AES-256). Accepts base64 or hex; the adapter wraps
  // per-erasure-scope data keys under this key.
  LEDGER_MASTER_KEY: z
    .string()
    .refine((v) => decodeKeyBytes(v)?.length === 32, {
      message:
        'LEDGER_MASTER_KEY must be a base64 or hex string that decodes to exactly 32 bytes',
    }),
  // Google Calendar OAuth (Story 1.4) — data-source connection, DISTINCT from
  // Better Auth sign-in. Optional so the app boots + gates without them; the
  // connect flow is disabled with an explanatory note when any is unset
  // (see isGoogleOAuthConfigured). Read-only calendar scope only (AD-8).
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_OAUTH_REDIRECT_URI: z
    .string()
    .url({ message: 'GOOGLE_OAUTH_REDIRECT_URI must be a valid URL' })
    .optional(),
});

/**
 * Decode a key string as base64 or hex into raw bytes.
 * Returns null if the value cannot be decoded to a plausible key.
 *
 * Exported as the single canonical decoder so security-critical key parsing is
 * not duplicated (the ledger crypto adapter imports this rather than re-deriving
 * its own — divergent decoders are a latent key-mismatch bug).
 */
export function decodeKeyBytes(value: string): Buffer | null {
  // Hex: even length, only hex digits.
  if (/^[0-9a-fA-F]+$/.test(value) && value.length % 2 === 0) {
    const hex = Buffer.from(value, 'hex');
    if (hex.length === value.length / 2) return hex;
  }
  // Base64 (standard or url-safe).
  if (/^[A-Za-z0-9+/_-]+={0,2}$/.test(value)) {
    const b64 = Buffer.from(value, 'base64');
    if (b64.length > 0) return b64;
  }
  return null;
}

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

/**
 * Whether the Google Calendar OAuth data-source flow is fully configured.
 * All three creds must be present; otherwise the connections screen renders the
 * connect action disabled with an explanatory note (no throw at startup).
 */
export function isGoogleOAuthConfigured(config: AppConfig): boolean {
  return (
    !!config.GOOGLE_OAUTH_CLIENT_ID &&
    !!config.GOOGLE_OAUTH_CLIENT_SECRET &&
    !!config.GOOGLE_OAUTH_REDIRECT_URI
  );
}
