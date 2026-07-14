'use client';

import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth browser client. Same-origin, so no explicit baseURL is needed —
 * requests hit `/api/auth/*` on the current host.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
