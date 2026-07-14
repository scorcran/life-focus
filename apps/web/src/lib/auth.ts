import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { loadConfig } from '@life-focus/config';
import { createDbClient, authSchema } from '@life-focus/db';
import { countUsersInDb, isSignUpOpen } from './sign-up-gate.js';

/**
 * Lazy singleton Better Auth server instance (AD-6, single-user).
 *
 * - Email + password only; single app user.
 * - Drizzle adapter over plain Postgres (AD-9) using the shared `authSchema`.
 * - Sign-up is gated server-side: the `user.create.before` hook refuses a
 *   second user by returning `false`, so a second sign-up can never create a
 *   user even if the UI is bypassed.
 *
 * The instance type is inferred (not annotated) so Better Auth's precise
 * options-parameterised type is preserved for `auth.api.*` consumers.
 */
function buildAuth() {
  const config = loadConfig();
  const { db } = createDbClient(config.DATABASE_URL);

  return betterAuth({
    baseURL: config.BETTER_AUTH_URL,
    secret: config.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
      // No email-verification flow at MVP: the single user is trusted on first
      // sign-up. (Better Auth still requires the `verification` table.)
      requireEmailVerification: false,
    },
    databaseHooks: {
      user: {
        create: {
          before: async (userData) => {
            // Refuse any sign-up after the first user exists (single-user gate).
            const open = await isSignUpOpen(countUsersInDb);
            if (!open) {
              return false;
            }
            return { data: userData };
          },
        },
      },
    },
  });
}

let _auth: ReturnType<typeof buildAuth> | null = null;

export function getAuth(): ReturnType<typeof buildAuth> {
  if (_auth === null) {
    _auth = buildAuth();
  }
  return _auth;
}
